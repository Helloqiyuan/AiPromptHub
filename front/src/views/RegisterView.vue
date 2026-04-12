<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import * as userApi from '@/api/users';
import UiButton from '@/components/ui/UiButton.vue';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import { UserPlus } from 'lucide-vue-next';

const router = useRouter();
const { showToast } = useToast();

const username = ref('');
const password = ref('');
const email = ref('');
const phone = ref('');
const submitting = ref(false);

async function onSubmit(): Promise<void> {
  submitting.value = true;
  try {
    await userApi.register({
      username: username.value.trim(),
      password: password.value,
      email: email.value.trim() || undefined,
      phone: phone.value.trim() || undefined,
    });
    showToast('注册成功，请登录');
    await router.replace({ name: 'login' });
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch lg:gap-10">
    <div
      class="relative hidden overflow-hidden rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-gradient-to-br from-[color-mix(in_oklab,var(--aph-primary)_12%,white)] via-[var(--aph-surface)] to-[var(--aph-primary-soft)] p-8 shadow-[var(--aph-shadow-md)] lg:flex lg:flex-col lg:justify-between"
    >
      <div>
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-[var(--aph-radius-lg)] bg-[var(--aph-surface)] text-[var(--aph-primary)] shadow-[var(--aph-shadow-sm)]">
          <UserPlus class="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 class="mt-6 text-2xl font-bold tracking-tight text-[var(--aph-text)]">加入社区</h2>
        <p class="mt-2 max-w-sm text-[var(--aph-text-muted)] leading-relaxed">
          注册仅需几秒，即可保存你喜爱的 Prompt 并与他人交流心得。
        </p>
      </div>
      <p class="text-xs text-[var(--aph-text-subtle)]">密码长度 6–32 位；邮箱与手机选填。</p>
    </div>

    <div class="min-w-0">
      <h1 class="text-2xl font-bold tracking-tight text-[var(--aph-text)]">注册</h1>
      <p class="mt-1 text-sm text-[var(--aph-text-muted)]">创建账号后即可发布与收藏 Prompt。</p>

      <form
        class="mt-6 space-y-4 rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-6 shadow-[var(--aph-shadow-md)] sm:p-8"
        @submit.prevent="onSubmit"
      >
        <div>
          <label for="username" class="aph-label">
            用户名 <span class="text-red-600">*</span>
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            minlength="2"
            maxlength="50"
            class="aph-input mt-1.5"
            required
          />
        </div>
        <div>
          <label for="password" class="aph-label">
            密码 <span class="text-red-600">*</span>
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            minlength="6"
            maxlength="32"
            class="aph-input mt-1.5"
            required
          />
        </div>
        <div>
          <label for="email" class="aph-label">邮箱（可选）</label>
          <input id="email" v-model="email" type="email" class="aph-input mt-1.5" />
        </div>
        <div>
          <label for="phone" class="aph-label">手机（可选）</label>
          <input id="phone" v-model="phone" type="tel" class="aph-input mt-1.5" />
        </div>
        <UiButton type="submit" variant="primary" block :loading="submitting">
          {{ submitting ? '提交中…' : '注册' }}
        </UiButton>
        <p class="text-center text-sm text-[var(--aph-text-muted)]">
          已有账号？
          <RouterLink
            to="/login"
            class="font-medium text-[var(--aph-primary)] underline-offset-2 hover:text-[var(--aph-primary-hover)] hover:underline"
          >
            去登录
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
