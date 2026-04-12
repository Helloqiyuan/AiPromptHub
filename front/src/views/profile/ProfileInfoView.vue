<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import * as userApi from '@/api/users';
import UiButton from '@/components/ui/UiButton.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';

const auth = useAuthStore();
const { showToast } = useToast();

const loading = ref(true);
const saving = ref(false);

const form = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const u = await userApi.getMe();
    form.username = u.username;
    form.email = u.email || '';
    form.phone = u.phone || '';
    form.avatar = u.avatar || '';
    form.bio = u.bio || '';
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    loading.value = false;
  }
}

async function onSave(): Promise<void> {
  saving.value = true;
  try {
    await userApi.updateMe({
      username: form.username,
      email: form.email || null,
      phone: form.phone || null,
      avatar: form.avatar || null,
      bio: form.bio || null,
    });
    auth.user = await userApi.getMe();
    showToast('已保存');
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-[var(--aph-text)]">个人资料</h1>
    <UiSkeleton v-if="loading" class="mt-4" :lines="5" />
    <form
      v-else
      class="mt-4 max-w-xl space-y-4 rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-6 shadow-[var(--aph-shadow-md)] sm:p-8"
      @submit.prevent="onSave"
    >
      <div v-if="auth.user?.stats" class="grid grid-cols-3 gap-2 text-center text-sm">
        <div
          v-for="(item, i) in [
            { n: auth.user.stats.promptCount, l: '发布' },
            { n: auth.user.stats.favoriteCount, l: '收藏' },
            { n: auth.user.stats.commentCount, l: '评论' },
          ]"
          :key="item.l"
          class="list-stagger-item rounded-[var(--aph-radius-lg)] border border-[var(--aph-border)] bg-[var(--aph-surface-muted)]/80 p-3"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <div class="text-2xl font-semibold tabular-nums text-[var(--aph-text)]">{{ item.n }}</div>
          <div class="text-[var(--aph-text-muted)]">{{ item.l }}</div>
        </div>
      </div>
      <div>
        <label for="username" class="aph-label">用户名</label>
        <input id="username" v-model="form.username" required class="aph-input mt-1.5" />
      </div>
      <div>
        <label for="email" class="aph-label">邮箱</label>
        <input id="email" v-model="form.email" type="email" class="aph-input mt-1.5" />
      </div>
      <div>
        <label for="phone" class="aph-label">手机</label>
        <input id="phone" v-model="form.phone" type="tel" class="aph-input mt-1.5" />
      </div>
      <div>
        <label for="avatar" class="aph-label">头像 URL</label>
        <input id="avatar" v-model="form.avatar" class="aph-input mt-1.5" />
      </div>
      <div>
        <label for="bio" class="aph-label">简介</label>
        <textarea id="bio" v-model="form.bio" maxlength="255" rows="3" class="aph-textarea mt-1.5 font-sans text-base" />
      </div>
      <UiButton type="submit" variant="primary" :loading="saving">
        {{ saving ? '保存中…' : '保存' }}
      </UiButton>
    </form>
  </div>
</template>
