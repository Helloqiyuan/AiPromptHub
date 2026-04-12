import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as userApi from '@/api/users';
import { setStoredToken, getStoredToken } from '@/api/client';
import type { User } from '@/types/models';

/** Pinia：登录态、用户信息、角色判断 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getStoredToken());
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => Boolean(token.value));
  const isAdmin = computed(() => {
    const r = user.value?.role;
    return r === 'admin' || r === 'super_admin';
  });
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin');

  /** 拉取当前用户（需已有 token） */
  async function fetchMe(): Promise<void> {
    if (!token.value) return;
    const me = await userApi.getMe();
    user.value = me;
  }

  /** 登录成功：写入 token 与内存中的 user */
  function setSession(accessToken: string, u: User): void {
    token.value = accessToken;
    user.value = u;
    setStoredToken(accessToken);
  }

  /** 退出登录 */
  function logout(): void {
    token.value = null;
    user.value = null;
    setStoredToken(null);
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    fetchMe,
    setSession,
    logout,
  };
});
