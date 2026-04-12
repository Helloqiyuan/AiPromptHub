<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { BookOpen, LogIn, LogOut, Shield, User, PenSquare } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

/** 导航链接基础样式 + 激活态 pill */
function linkClass(active: boolean): string {
  const base =
    'relative inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-[color,background-color,transform] duration-[var(--aph-duration-fast)] ease-[var(--aph-ease-out)] active:scale-[0.98]';
  if (active) {
    return `${base} bg-[var(--aph-primary-soft)] text-[var(--aph-primary)] shadow-[var(--aph-shadow-sm)]`;
  }
  return `${base} text-[var(--aph-text-muted)] hover:bg-[var(--aph-surface-muted)] hover:text-[var(--aph-text)]`;
}

const activeHome = computed(() => route.name === 'home');
const activeNew = computed(() => route.name === 'prompt-new' || route.name === 'prompt-edit');
const activeAdmin = computed(() => typeof route.path === 'string' && route.path.startsWith('/admin'));
const activeMe = computed(() => route.path.startsWith('/me'));

async function onLogout(): Promise<void> {
  auth.logout();
  await router.push({ name: 'home' });
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-[var(--aph-border)] bg-[color-mix(in_oklab,var(--aph-surface)_88%,transparent)] shadow-[var(--aph-shadow-sm)] backdrop-blur-md backdrop-saturate-150"
  >
    <div class="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <RouterLink
        to="/"
        class="group flex items-center gap-2.5 rounded-[var(--aph-radius-md)] font-semibold text-[var(--aph-text)] transition-opacity duration-[var(--aph-duration-fast)] hover:opacity-90 focus-visible:rounded-[var(--aph-radius-md)]"
        aria-label="返回首页"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-[var(--aph-radius-md)] bg-[var(--aph-primary-soft)] text-[var(--aph-primary)] transition-transform duration-[var(--aph-duration-fast)] group-hover:scale-105"
        >
          <BookOpen class="h-5 w-5" aria-hidden="true" />
        </span>
        <span class="hidden sm:inline">AI Prompt Hub</span>
      </RouterLink>

      <nav class="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5" aria-label="主导航">
        <RouterLink to="/" :class="linkClass(activeHome)">
          首页
        </RouterLink>

        <RouterLink
          v-if="auth.isAuthenticated"
          :to="{ name: 'prompt-new' }"
          :class="linkClass(activeNew)"
        >
          <PenSquare class="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
          <span class="hidden sm:inline">发布</span>
        </RouterLink>

        <RouterLink
          v-if="auth.isAdmin"
          :to="{ name: 'admin-stats' }"
          :class="linkClass(activeAdmin)"
        >
          <Shield class="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
          <span class="hidden sm:inline">管理</span>
        </RouterLink>

        <RouterLink
          v-if="auth.isAuthenticated"
          :to="{ name: 'me-profile' }"
          :class="linkClass(activeMe)"
        >
          <User class="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
          <span class="max-w-[7.5rem] truncate sm:max-w-[10rem]">{{ auth.user?.username }}</span>
        </RouterLink>

        <RouterLink
          v-if="!auth.isAuthenticated"
          :to="{ name: 'login' }"
          :class="linkClass(route.name === 'login')"
        >
          <LogIn class="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
          登录
        </RouterLink>

        <button
          v-else
          type="button"
          :class="linkClass(false)"
          aria-label="退出登录"
          @click="onLogout"
        >
          <LogOut class="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
          <span class="hidden sm:inline">退出</span>
        </button>
      </nav>
    </div>
  </header>
</template>
