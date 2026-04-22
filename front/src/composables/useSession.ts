import { computed, shallowRef } from 'vue';

import { ApiError } from '@/lib/api';
import { clearToken, readToken, writeToken } from '@/lib/authStorage';
import { fetchMe, login, register } from '@/services/auth';
import type { LoginPayload, RegisterPayload, UserProfile } from '@/shared/types/domain';

const token = shallowRef<string | null>(readToken());
const currentUser = shallowRef<UserProfile | null>(null);
const ready = shallowRef(false);
const loading = shallowRef(false);
const authError = shallowRef('');

const isAuthenticated = computed(() => Boolean(token.value && currentUser.value));
const isAdmin = computed(() => ['admin', 'super_admin'].includes(currentUser.value?.role ?? ''));
const isSuperAdmin = computed(() => currentUser.value?.role === 'super_admin');

async function bootstrapSession() {
  if (ready.value) {
    return;
  }

  if (!token.value) {
    ready.value = true;
    return;
  }

  loading.value = true;
  try {
    currentUser.value = await fetchMe(token.value);
  } catch {
    clearSession();
  } finally {
    loading.value = false;
    ready.value = true;
  }
}

async function loginWithPassword(payload: LoginPayload) {
  loading.value = true;
  authError.value = '';
  try {
    const result = await login(payload);
    token.value = result.token;
    currentUser.value = result.user;
    writeToken(result.token);
    return result.user;
  } catch (error) {
    authError.value = error instanceof ApiError ? error.message : '登录失败';
    throw error;
  } finally {
    loading.value = false;
  }
}

async function registerAndLogin(payload: RegisterPayload) {
  loading.value = true;
  authError.value = '';
  try {
    await register(payload);
    return await loginWithPassword({ email: payload.email, password: payload.password });
  } catch (error) {
    authError.value = error instanceof ApiError ? error.message : '注册失败';
    throw error;
  } finally {
    loading.value = false;
  }
}

async function refreshMe() {
  if (!token.value) {
    currentUser.value = null;
    return null;
  }

  currentUser.value = await fetchMe(token.value);
  return currentUser.value;
}

function clearSession() {
  token.value = null;
  currentUser.value = null;
  authError.value = '';
  clearToken();
}

function logout() {
  clearSession();
}

export function useSession() {
  return {
    authError,
    currentUser,
    isAdmin,
    isAuthenticated,
    isSuperAdmin,
    loading,
    ready,
    token,
    bootstrapSession,
    clearSession,
    loginWithPassword,
    logout,
    refreshMe,
    registerAndLogin,
  };
}
