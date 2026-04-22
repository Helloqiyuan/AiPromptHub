<script setup lang="ts">
import { onMounted, reactive, shallowRef, watch } from 'vue';

import { ApiError } from '@/lib/api';
import { useSession } from '@/composables/useSession';
import { useUiState } from '@/composables/useUiState';
import { createCategory, fetchCategories } from '@/services/catalog';
import {
  deleteAdminPrompt,
  fetchAdminPrompts,
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminPromptStatus,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '@/services/admin';
import type { AdminStats, CategoryItem, PromptItem, PromptStatus, UserProfile, UserRole, UserStatus } from '@/shared/types/domain';
import type { Pagination } from '@/shared/types/api';

const { isAdmin, isSuperAdmin, token } = useSession();
const { openAuthDialog } = useUiState();

const loading = shallowRef(false);
const errorMessage = shallowRef('');
const successMessage = shallowRef('');
const stats = shallowRef<AdminStats | null>(null);
const categories = shallowRef<CategoryItem[]>([]);
const prompts = shallowRef<PromptItem[]>([]);
const users = shallowRef<UserProfile[]>([]);
const promptPagination = shallowRef<Pagination>({ page: 1, pageSize: 8, total: 0, totalPages: 0 });
const userPagination = shallowRef<Pagination>({ page: 1, pageSize: 8, total: 0, totalPages: 0 });

const promptFilters = reactive({ keyword: '', status: '' as PromptStatus | '' });
const userFilters = reactive({ keyword: '', role: '' as UserRole | '', status: '' as UserStatus | '' });
const categoryForm = reactive({ name: '', description: '', parentId: -1, sort: 0 });

async function loadDashboard() {
  if (!token.value || !isAdmin.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  try {
    const [statsData, categoryRows, promptRows, userRows] = await Promise.all([
      fetchAdminStats(token.value),
      fetchCategories(),
      fetchAdminPrompts(token.value, { page: promptPagination.value.page, pageSize: promptPagination.value.pageSize, keyword: promptFilters.keyword || undefined, status: promptFilters.status || undefined }),
      fetchAdminUsers(token.value, { page: userPagination.value.page, pageSize: userPagination.value.pageSize, keyword: userFilters.keyword || undefined, role: userFilters.role || undefined, status: userFilters.status || undefined }),
    ]);

    stats.value = statsData;
    categories.value = categoryRows;
    prompts.value = promptRows.list;
    promptPagination.value = promptRows.pagination;
    users.value = userRows.list;
    userPagination.value = userRows.pagination;
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '加载管理台失败';
  } finally {
    loading.value = false;
  }
}

watch(
  () => [promptFilters.keyword, promptFilters.status, promptPagination.value.page, userFilters.keyword, userFilters.role, userFilters.status, userPagination.value.page] as const,
  () => {
    if (token.value && isAdmin.value) {
      loadDashboard();
    }
  },
);

async function changePromptStatus(promptId: number, status: PromptStatus) {
  if (!token.value) {
    return;
  }
  try {
    await updateAdminPromptStatus(token.value, promptId, status);
    successMessage.value = 'Prompt 状态已更新。';
    await loadDashboard();
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '更新 Prompt 状态失败';
  }
}

async function removePrompt(promptId: number) {
  if (!token.value || !window.confirm('确定删除这条 Prompt 吗？')) {
    return;
  }
  try {
    await deleteAdminPrompt(token.value, promptId);
    successMessage.value = 'Prompt 已删除。';
    await loadDashboard();
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '删除 Prompt 失败';
  }
}

async function changeUserRole(userId: number, role: UserRole) {
  if (!token.value) {
    return;
  }
  try {
    await updateAdminUserRole(token.value, userId, role);
    successMessage.value = '用户角色已更新。';
    await loadDashboard();
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '修改用户角色失败';
  }
}

async function changeUserStatus(userId: number, status: UserStatus) {
  if (!token.value) {
    return;
  }
  try {
    await updateAdminUserStatus(token.value, userId, status);
    successMessage.value = '用户状态已更新。';
    await loadDashboard();
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '修改用户状态失败';
  }
}

async function submitCategory() {
  if (!token.value) {
    return;
  }
  try {
    await createCategory(token.value, {
      name: categoryForm.name,
      description: categoryForm.description,
      parentId: Number(categoryForm.parentId),
      sort: Number(categoryForm.sort),
    });
    categoryForm.name = '';
    categoryForm.description = '';
    categoryForm.parentId = -1;
    categoryForm.sort = 0;
    successMessage.value = '分类创建成功。';
    await loadDashboard();
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '创建分类失败';
  }
}

onMounted(() => {
  if (isAdmin.value) {
    loadDashboard();
  }
});
</script>

<template>
  <section v-if="!token" class="admin-empty">
    <p class="admin-kicker">管理台</p>
    <h2>请先登录管理员账号。</h2>
    <button class="admin-button" type="button" @click="openAuthDialog('login')">前往登录</button>
  </section>

  <section v-else-if="!isAdmin" class="admin-empty">
    <p class="admin-kicker">管理台</p>
    <h2>当前账号没有管理权限。</h2>
    <p>只有管理员账号可以进入管理台。</p>
  </section>

  <div v-else class="admin-shell">
    <p v-if="errorMessage" class="admin-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-success">{{ successMessage }}</p>

    <section class="stats-grid">
      <article class="stat-card"><span>用户数</span><strong>{{ stats?.userCount ?? 0 }}</strong></article>
      <article class="stat-card"><span>管理员数</span><strong>{{ stats?.adminCount ?? 0 }}</strong></article>
      <article class="stat-card"><span>分类数</span><strong>{{ stats?.categoryCount ?? 0 }}</strong></article>
      <article class="stat-card"><span>Prompt 数</span><strong>{{ stats?.promptCount ?? 0 }}</strong></article>
      <article class="stat-card"><span>评论数</span><strong>{{ stats?.commentCount ?? 0 }}</strong></article>
      <article class="stat-card"><span>收藏数</span><strong>{{ stats?.favoriteCount ?? 0 }}</strong></article>
    </section>

    <section class="admin-grid">
      <article class="admin-card admin-card-wide">
        <div class="card-header card-header-spread">
          <div>
            <p class="admin-kicker">Prompt 审核</p>
            <h2>状态管理与删除</h2>
          </div>
          <div class="filter-line">
            <input v-model="promptFilters.keyword" placeholder="搜索 Prompt" />
            <select v-model="promptFilters.status">
              <option value="">全部状态</option>
              <option value="published">published</option>
              <option value="pending">pending</option>
              <option value="rejected">rejected</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>
        <p v-if="loading" class="admin-loading">正在加载管理数据...</p>
        <div v-else class="table-stack">
          <article v-for="prompt in prompts" :key="prompt.id" class="table-card">
            <div>
              <h3>{{ prompt.title }}</h3>
              <p>{{ prompt.summary || '暂无摘要' }}</p>
            </div>
            <div class="table-actions">
              <select :value="prompt.status" @change="changePromptStatus(prompt.id, ($event.target as HTMLSelectElement).value as PromptStatus)">
                <option value="published">published</option>
                <option value="pending">pending</option>
                <option value="rejected">rejected</option>
                <option value="archived">archived</option>
              </select>
              <button type="button" @click="removePrompt(prompt.id)">删除</button>
            </div>
          </article>
        </div>
      </article>

      <article class="admin-card admin-card-wide">
        <div class="card-header card-header-spread">
          <div>
            <p class="admin-kicker">用户管理</p>
            <h2>角色与状态</h2>
          </div>
          <div class="filter-line">
            <input v-model="userFilters.keyword" placeholder="搜索用户" />
            <select v-model="userFilters.role">
              <option value="">全部角色</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
            <select v-model="userFilters.status">
              <option value="">全部状态</option>
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </div>
        </div>
        <div class="table-stack">
          <article v-for="user in users" :key="user.id" class="table-card">
            <div>
              <h3>{{ user.username }}</h3>
              <p>{{ user.email || '无邮箱' }}</p>
            </div>
            <div class="table-actions">
              <select :value="user.status" @change="changeUserStatus(user.id, ($event.target as HTMLSelectElement).value as UserStatus)">
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
              <select v-if="isSuperAdmin" :value="user.role" @change="changeUserRole(user.id, ($event.target as HTMLSelectElement).value as UserRole)">
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
            </div>
          </article>
        </div>
      </article>

      <article class="admin-card">
        <div class="card-header">
          <div>
            <p class="admin-kicker">创建分类</p>
            <h2>新增 catalog 分类</h2>
          </div>
        </div>
        <form class="category-form" @submit.prevent="submitCategory">
          <label>
            <span>分类名称</span>
            <input v-model="categoryForm.name" />
          </label>
          <label>
            <span>父级分类</span>
            <select v-model="categoryForm.parentId">
              <option :value="-1">根分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </label>
          <label>
            <span>排序值</span>
            <input v-model="categoryForm.sort" type="number" />
          </label>
          <label>
            <span>描述</span>
            <textarea v-model="categoryForm.description" rows="4" />
          </label>
          <button class="admin-button admin-button-primary" type="submit">创建分类</button>
        </form>
      </article>
    </section>
  </div>
</template>

<style scoped>
.admin-shell { display: grid; gap: 1rem; }
.admin-empty,.admin-card,.stat-card { border-radius: 26px; background: rgba(255, 251, 245, 0.84); border: 1px solid rgba(122, 93, 70, 0.12); }
.admin-empty { display: grid; gap: 0.75rem; justify-items: start; padding: 1.5rem; }
.admin-kicker { margin: 0; font-size: 0.76rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-accent-strong); }
.admin-empty h2,.admin-card h2,.table-card h3 { margin: 0; font-family: var(--font-display); color: var(--color-ink); }
.admin-empty p,.table-card p { margin: 0.35rem 0 0; color: var(--color-muted); line-height: 1.7; }
.admin-button { min-height: 42px; padding: 0 0.95rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); }
.admin-button-primary { border-color: transparent; background: var(--color-accent); color: #fffaf2; }
.admin-error,.admin-success { margin: 0; padding: 0.9rem 1rem; border-radius: 18px; }
.admin-error { background: rgba(182, 79, 47, 0.12); color: #8f4022; }
.admin-success { background: rgba(156, 110, 72, 0.12); color: var(--color-ink); }
.stats-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 1rem; }
.stat-card { display: grid; gap: 0.35rem; padding: 1rem; }
.stat-card span { color: var(--color-muted); }
.stat-card strong { font-family: var(--font-display); font-size: 1.8rem; color: var(--color-ink); }
.admin-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.admin-card { display: grid; gap: 1rem; padding: 1.2rem; }
.admin-card-wide { align-content: start; }
.card-header { display: flex; justify-content: space-between; gap: 1rem; }
.card-header-spread { align-items: center; }
.filter-line { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.filter-line input,.filter-line select,.table-actions select,.category-form input,.category-form select,.category-form textarea { padding: 0.85rem 0.95rem; border-radius: 18px; border: 1px solid rgba(122, 93, 70, 0.14); background: rgba(255, 255, 255, 0.72); }
.admin-loading { margin: 0; color: var(--color-muted); }
.table-stack { display: grid; gap: 0.8rem; }
.table-card { display: flex; justify-content: space-between; gap: 1rem; align-items: start; padding: 1rem; border-radius: 22px; background: rgba(255, 255, 255, 0.68); border: 1px solid rgba(122, 93, 70, 0.1); }
.table-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: 0.6rem; }
.table-actions button { min-height: 42px; padding: 0 0.95rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); }
.category-form { display: grid; gap: 0.9rem; }
.category-form label { display: grid; gap: 0.45rem; }
.category-form span { color: var(--color-ink); font-size: 0.92rem; }
@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .stats-grid { grid-template-columns: 1fr; } .card-header,.card-header-spread,.table-card { flex-direction: column; } }
</style>

