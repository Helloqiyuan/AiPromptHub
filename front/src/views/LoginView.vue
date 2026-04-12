<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import * as userApi from '@/api/users';
import UiButton from '@/components/ui/UiButton.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import { BookOpen } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { showToast } = useToast();

const account = ref('');
const password = ref('');
const submitting = ref(false);

async function onSubmit(): Promise<void> {
  if (!password.value) {
    showToast('请输入密码');
    return;
  }
  if (!account.value.trim()) {
    showToast('请输入用户名、邮箱或手机号');
    return;
  }
  submitting.value = true;
  try {
    const res = await userApi.login({
      account: account.value.trim(),
      password: password.value,
    });
    auth.setSession(res.token, res.user);
    const redirect = (route.query.redirect as string) || '/';
    await router.replace(redirect);
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch lg:gap-10">
    <!-- 左侧品牌区：大屏展示，小屏隐藏 -->
    <div
      class="relative hidden overflow-hidden rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-gradient-to-br from-[var(--aph-primary-soft)] via-[var(--aph-surface)] to-[color-mix(in_oklab,var(--aph-primary)_15%,white)] p-8 shadow-[var(--aph-shadow-md)] lg:flex lg:flex-col lg:justify-between"
    >
      <div>
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-[var(--aph-radius-lg)] bg-[var(--aph-surface)] text-[var(--aph-primary)] shadow-[var(--aph-shadow-sm)]">
          <BookOpen class="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 class="mt-6 text-2xl font-bold tracking-tight text-[var(--aph-text)]">欢迎回来</h2>
        <p class="mt-2 max-w-sm text-[var(--aph-text-muted)] leading-relaxed">
          登录后可发布 Prompt、收藏与评论，与社区共建提示词库。
        </p>
      </div>
      <p class="text-xs text-[var(--aph-text-subtle)]">提示：支持用户名、邮箱或手机号作为账号。</p>
    </div>

    <div class="min-w-0">
      <h1 class="text-2xl font-bold tracking-tight text-[var(--aph-text)]">登录</h1>
      <p class="mt-1 text-sm text-[var(--aph-text-muted)]">使用用户名、邮箱或手机号登录。</p>

      <form
        class="mt-6 space-y-4 rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-6 shadow-[var(--aph-shadow-md)] sm:p-8"
        @submit.prevent="onSubmit"
      >
        <div>
          <label for="account" class="aph-label">账号</label>
          <input
            id="account"
            v-model="account"
            name="account"
            type="text"
            autocomplete="username"
            class="aph-input mt-1.5"
            required
          />
        </div>
        <div>
          <label for="password" class="aph-label">密码</label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            class="aph-input mt-1.5"
            required
          />
        </div>
        <UiButton type="submit" variant="primary" block :loading="submitting">
          {{ submitting ? '登录中…' : '登录' }}
        </UiButton>
        <p class="text-center text-sm text-[var(--aph-text-muted)]">
          没有账号？
          <RouterLink
            to="/register"
            class="font-medium text-[var(--aph-primary)] underline-offset-2 transition-colors hover:text-[var(--aph-primary-hover)] hover:underline"
          >
            去注册
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
