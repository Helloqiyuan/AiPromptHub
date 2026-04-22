<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';

import type { UserProfile } from '@/shared/types/domain';

defineProps<{
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  openAuth: [tab: 'login' | 'register'];
  logout: [];
}>();

const route = useRoute();
</script>

<template>
  <header class="header-shell">
    <div class="header-brand-block">
      <RouterLink class="header-brand" to="/">AI Prompt Hub</RouterLink>
      <p class="header-subtitle">发现、收藏并沉淀你的高质量 Prompt。</p>
    </div>

    <nav class="header-nav">
      <RouterLink class="header-link" :class="{ 'header-link-active': route.path === '/' }" to="/">大厅</RouterLink>
      <RouterLink class="header-link" :class="{ 'header-link-active': route.path.startsWith('/profile') }" to="/profile">个人中心</RouterLink>
      <RouterLink v-if="isAdmin" class="header-link" :class="{ 'header-link-active': route.path.startsWith('/admin') }" to="/admin">管理台</RouterLink>
    </nav>

    <div class="header-actions">
      <template v-if="isAuthenticated && user">
        <div class="header-user-card">
          <strong>{{ user.username }}</strong>
          <span>{{ user.role }}</span>
        </div>
        <button class="header-button" type="button" @click="emit('logout')">退出</button>
      </template>
      <template v-else>
        <button class="header-button" type="button" @click="emit('openAuth', 'login')">登录</button>
        <button class="header-button header-button-primary" type="button" @click="emit('openAuth', 'register')">注册</button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.header-shell { display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center; padding: 1rem 1.2rem; border-radius: 26px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 251, 245, 0.82); backdrop-filter: blur(12px); }
.header-brand-block { display: grid; gap: 0.25rem; }
.header-brand { font-family: var(--font-display); font-size: 1.6rem; color: var(--color-ink); text-decoration: none; }
.header-subtitle { margin: 0; color: var(--color-muted); font-size: 0.88rem; }
.header-nav,.header-actions { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
.header-nav { justify-content: center; }
.header-link,.header-button { min-height: 42px; padding: 0 0.95rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.7); color: var(--color-ink); text-decoration: none; display: inline-flex; align-items: center; }
.header-link-active,.header-button-primary { border-color: transparent; background: var(--color-accent); color: #fff9f1; }
.header-user-card { display: grid; justify-items: end; color: var(--color-ink); }
.header-user-card span { color: var(--color-muted); font-size: 0.82rem; }
@media (max-width: 980px) { .header-shell { grid-template-columns: 1fr; } .header-nav { justify-content: start; } .header-actions { justify-content: space-between; } }
</style>
