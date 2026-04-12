<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as adminApi from '@/api/admin';
import PaginationBar from '@/components/PaginationBar.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { User, UserRole, UserStatus } from '@/types/models';

const auth = useAuthStore();
const { showToast } = useToast();

const loading = ref(false);
const list = ref<User[]>([]);
const page = ref(1);
const keyword = ref('');
const roleFilter = ref<UserRole | ''>('');
const statusFilter = ref<UserStatus | ''>('');
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

const busyId = ref<number | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await adminApi.listAdminUsers({
      page: page.value,
      pageSize: 10,
      keyword: keyword.value || undefined,
      role: roleFilter.value || undefined,
      status: statusFilter.value || undefined,
    });
    list.value = res.list;
    pagination.value = res.pagination;
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    loading.value = false;
  }
}

async function patchRole(id: number, role: UserRole): Promise<void> {
  busyId.value = id;
  try {
    await adminApi.adminUpdateUserRole(id, role);
    showToast('角色已更新');
    await load();
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    busyId.value = null;
  }
}

async function patchStatus(id: number, status: UserStatus): Promise<void> {
  busyId.value = id;
  try {
    await adminApi.adminUpdateUserStatus(id, status);
    showToast('状态已更新');
    await load();
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    busyId.value = null;
  }
}

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-[var(--aph-text)]">用户列表</h2>
    <div class="mt-4 flex flex-wrap items-end gap-2">
      <input
        v-model="keyword"
        type="search"
        placeholder="用户名/邮箱/手机"
        class="aph-input min-w-[200px] max-w-full flex-1 sm:max-w-xs"
        @keyup.enter="page = 1; load()"
      />
      <select v-model="roleFilter" class="aph-select min-w-[140px]" @change="page = 1; load()">
        <option value="">全部角色</option>
        <option value="user">user</option>
        <option value="admin">admin</option>
        <option value="super_admin">super_admin</option>
      </select>
      <select v-model="statusFilter" class="aph-select min-w-[120px]" @change="page = 1; load()">
        <option value="">全部状态</option>
        <option value="active">active</option>
        <option value="disabled">disabled</option>
      </select>
      <UiButton type="button" variant="primary" @click="page = 1; load()">筛选</UiButton>
    </div>

    <UiSkeleton v-if="loading" class="mt-4" :lines="5" />
    <div
      v-else
      class="mt-4 overflow-x-auto rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] shadow-[var(--aph-shadow-sm)]"
    >
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-[var(--aph-border)] bg-[var(--aph-surface-muted)]/90">
          <tr>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">ID</th>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">用户名</th>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">角色</th>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">状态</th>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in list"
            :key="u.id"
            class="border-b border-[var(--aph-border)] transition-colors duration-[var(--aph-duration-fast)] hover:bg-[var(--aph-surface-muted)]/70"
          >
            <td class="px-4 py-3 font-mono text-xs text-[var(--aph-text-muted)]">{{ u.id }}</td>
            <td class="px-4 py-3 font-medium text-[var(--aph-text)]">{{ u.username }}</td>
            <td class="px-4 py-3 text-[var(--aph-text-muted)]">{{ u.role }}</td>
            <td class="px-4 py-3 text-[var(--aph-text-muted)]">{{ u.status }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <div v-if="auth.isSuperAdmin" class="flex flex-wrap gap-1">
                  <button
                    v-for="r in ['user', 'admin', 'super_admin']"
                    :key="r"
                    type="button"
                    class="rounded-[var(--aph-radius-sm)] border border-[var(--aph-border)] bg-[var(--aph-surface)] px-2 py-1 text-xs transition-colors hover:bg-[var(--aph-primary-soft)] disabled:opacity-45"
                    :disabled="busyId === u.id"
                    :title="Number(u.id) === auth.user?.id ? '不能修改自己的角色' : ''"
                    @click="patchRole(u.id, r as UserRole)"
                  >
                    设为 {{ r }}
                  </button>
                </div>
                <p v-else class="text-xs text-[var(--aph-text-subtle)]">仅超级管理员可改角色</p>
                <div class="flex flex-wrap gap-1">
                  <button
                    type="button"
                    class="rounded-[var(--aph-radius-sm)] border border-[var(--aph-border)] bg-[var(--aph-surface)] px-2 py-1 text-xs transition-colors hover:bg-[var(--aph-surface-muted)] disabled:opacity-45"
                    :disabled="busyId === u.id"
                    @click="patchStatus(u.id, 'active')"
                  >
                    启用
                  </button>
                  <button
                    type="button"
                    class="rounded-[var(--aph-radius-sm)] border border-red-200 bg-[var(--aph-danger-soft)] px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
                    :disabled="busyId === u.id"
                    @click="patchStatus(u.id, 'disabled')"
                  >
                    禁用
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationBar v-if="pagination.total > 0" :pagination="pagination" :loading="loading" @change="(p) => { page = p; load(); }" />
  </div>
</template>
