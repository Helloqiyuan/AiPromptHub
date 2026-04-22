<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import { RouterView } from 'vue-router';

import { ApiError } from './lib/api';
import { useSession } from './composables/useSession';
import { useUiState } from './composables/useUiState';
import AuthDialog from './shared/components/AuthDialog.vue';
import AppHeader from './shared/components/AppHeader.vue';

const {
  authError,
  bootstrapSession,
  currentUser,
  isAdmin,
  isAuthenticated,
  loading,
  logout,
  loginWithPassword,
  registerAndLogin,
} = useSession();

const { authDialogVisible, authTab, closeAuthDialog, openAuthDialog } = useUiState();
const pageMessage = shallowRef('');

const bannerMessage = computed(() => pageMessage.value || authError.value);

onMounted(() => {
  bootstrapSession();
});

async function handleLogin(payload: { email: string; password: string }) {
  try {
    await loginWithPassword(payload);
    pageMessage.value = '登录成功，已同步当前用户信息。';
    closeAuthDialog();
  } catch (error) {
    pageMessage.value = error instanceof ApiError ? error.message : '登录失败';
  }
}

async function handleRegister(payload: {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
}) {
  try {
    await registerAndLogin(payload);
    pageMessage.value = '注册成功，已自动登录。';
    closeAuthDialog();
  } catch (error) {
    pageMessage.value = error instanceof ApiError ? error.message : '注册失败';
  }
}

function handleLogout() {
  logout();
  pageMessage.value = '已退出登录。';
}

function handleSwitchTab(tab: 'login' | 'register') {
  authTab.value = tab;
}
</script>

<template>
  <div class="app-shell">
    <AppHeader
      :user="currentUser"
      :is-authenticated="isAuthenticated"
      :is-admin="isAdmin"
      @open-auth="openAuthDialog"
      @logout="handleLogout"
    />

    <p v-if="bannerMessage" class="app-banner">{{ bannerMessage }}</p>

    <RouterView />

    <AuthDialog
      :visible="authDialogVisible"
      :submitting="loading"
      :error-message="authError"
      :active-tab="authTab"
      @close="closeAuthDialog"
      @switch-tab="handleSwitchTab"
      @login="handleLogin"
      @register="handleRegister"
    />
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  gap: 1rem;
}

.app-banner {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 20px;
  background: rgba(156, 110, 72, 0.12);
  color: var(--color-ink);
}
</style>
