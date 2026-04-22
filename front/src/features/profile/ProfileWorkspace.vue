<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef, watch } from 'vue';

import { ApiError } from '@/lib/api';
import { useSession } from '@/composables/useSession';
import { useUiState } from '@/composables/useUiState';
import { fetchCategories, fetchTags } from '@/services/catalog';
import { updateMe } from '@/services/auth';
import {
  createPrompt,
  deletePrompt,
  fetchMyComments,
  fetchMyFavorites,
  fetchMyPrompts,
  updatePrompt,
} from '@/services/prompts';
import type { CategoryItem, CommentItem, PromptFormPayload, PromptItem, TagItem } from '@/shared/types/domain';
import type { Pagination } from '@/shared/types/api';

import PromptEditorDialog from './components/PromptEditorDialog.vue';

const { currentUser, isAuthenticated, refreshMe, token } = useSession();
const { openAuthDialog } = useUiState();

const profileLoading = shallowRef(false);
const saveProfileLoading = shallowRef(false);
const panelError = shallowRef('');
const panelMessage = shallowRef('');
const activeTab = shallowRef<'prompts' | 'favorites' | 'comments'>('prompts');
const promptEditorVisible = shallowRef(false);
const promptSubmitting = shallowRef(false);
const editingPrompt = shallowRef<PromptItem | null>(null);

const categories = shallowRef<CategoryItem[]>([]);
const tags = shallowRef<TagItem[]>([]);
const myPrompts = shallowRef<PromptItem[]>([]);
const myFavorites = shallowRef<PromptItem[]>([]);
const myComments = shallowRef<CommentItem[]>([]);
const promptPagination = shallowRef<Pagination>({ page: 1, pageSize: 6, total: 0, totalPages: 0 });
const favoritePagination = shallowRef<Pagination>({ page: 1, pageSize: 6, total: 0, totalPages: 0 });
const commentPagination = shallowRef<Pagination>({ page: 1, pageSize: 6, total: 0, totalPages: 0 });

const profileForm = reactive({
  username: '',
  email: '',
  phone: '',
  avatar: '',
  bio: '',
});

const summaryCards = computed(() => {
  const stats = currentUser.value?.stats;
  return [
    { label: '我的 Prompt', value: `${stats?.promptCount ?? 0}` },
    { label: '我的收藏', value: `${stats?.favoriteCount ?? 0}` },
    { label: '我的评论', value: `${stats?.commentCount ?? 0}` },
  ];
});

watch(
  currentUser,
  (user) => {
    profileForm.username = user?.username ?? '';
    profileForm.email = user?.email ?? '';
    profileForm.phone = user?.phone ?? '';
    profileForm.avatar = user?.avatar ?? '';
    profileForm.bio = user?.bio ?? '';
  },
  { immediate: true },
);

async function loadCatalog() {
  const [categoryRows, tagRows] = await Promise.all([fetchCategories(), fetchTags()]);
  categories.value = categoryRows;
  tags.value = tagRows;
}

async function loadProfileData() {
  if (!token.value) {
    return;
  }

  profileLoading.value = true;
  panelError.value = '';
  try {
    await Promise.all([refreshMe(), loadCatalog(), loadActiveTab()]);
  } catch (error) {
    panelError.value = error instanceof ApiError ? error.message : '加载个人中心失败';
  } finally {
    profileLoading.value = false;
  }
}

async function loadActiveTab() {
  if (!token.value) {
    return;
  }

  try {
    if (activeTab.value === 'prompts') {
      const result = await fetchMyPrompts(token.value, { page: promptPagination.value.page, pageSize: promptPagination.value.pageSize });
      myPrompts.value = result.list;
      promptPagination.value = result.pagination;
      return;
    }

    if (activeTab.value === 'favorites') {
      const result = await fetchMyFavorites(token.value, { page: favoritePagination.value.page, pageSize: favoritePagination.value.pageSize });
      myFavorites.value = result.list;
      favoritePagination.value = result.pagination;
      return;
    }

    const result = await fetchMyComments(token.value, { page: commentPagination.value.page, pageSize: commentPagination.value.pageSize });
    myComments.value = result.list;
    commentPagination.value = result.pagination;
  } catch (error) {
    panelError.value = error instanceof ApiError ? error.message : '加载列表失败';
  }
}

watch(activeTab, () => {
  if (token.value) {
    loadActiveTab();
  }
});

async function saveProfile() {
  if (!token.value) {
    openAuthDialog('login');
    return;
  }

  saveProfileLoading.value = true;
  panelError.value = '';
  panelMessage.value = '';
  try {
    await updateMe(token.value, { ...profileForm });
    await refreshMe();
    panelMessage.value = '个人资料已更新。';
  } catch (error) {
    panelError.value = error instanceof ApiError ? error.message : '保存个人资料失败';
  } finally {
    saveProfileLoading.value = false;
  }
}

function openCreatePrompt() {
  editingPrompt.value = null;
  promptEditorVisible.value = true;
}

function openEditPrompt(prompt: PromptItem) {
  editingPrompt.value = prompt;
  promptEditorVisible.value = true;
}

function closePromptEditor() {
  promptEditorVisible.value = false;
  editingPrompt.value = null;
}

async function savePrompt(payload: PromptFormPayload) {
  if (!token.value) {
    openAuthDialog('login');
    return;
  }

  promptSubmitting.value = true;
  panelError.value = '';
  try {
    if (editingPrompt.value) {
      await updatePrompt(token.value, editingPrompt.value.id, payload);
      panelMessage.value = 'Prompt 修改成功。';
    } else {
      await createPrompt(token.value, payload);
      panelMessage.value = 'Prompt 创建成功。';
    }
    closePromptEditor();
    activeTab.value = 'prompts';
    await Promise.all([refreshMe(), loadActiveTab()]);
  } catch (error) {
    panelError.value = error instanceof ApiError ? error.message : '保存 Prompt 失败';
  } finally {
    promptSubmitting.value = false;
  }
}

async function removePrompt(promptId: number) {
  if (!token.value) {
    return;
  }
  if (!window.confirm('确定删除这条 Prompt 吗？')) {
    return;
  }
  try {
    await deletePrompt(token.value, promptId);
    panelMessage.value = 'Prompt 已删除。';
    await Promise.all([refreshMe(), loadActiveTab()]);
  } catch (error) {
    panelError.value = error instanceof ApiError ? error.message : '删除 Prompt 失败';
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadProfileData();
  }
});
</script>

<template>
  <section v-if="!isAuthenticated" class="workspace-empty">
    <p class="workspace-kicker">个人中心</p>
    <h2>登录后即可查看我的 Prompt、收藏与评论。</h2>
    <button class="workspace-button" type="button" @click="openAuthDialog('login')">立即登录</button>
  </section>

  <div v-else class="workspace-shell">
    <p v-if="panelError" class="workspace-error">{{ panelError }}</p>
    <p v-if="panelMessage" class="workspace-message">{{ panelMessage }}</p>

    <section class="workspace-summary">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </section>

    <section class="workspace-grid">
      <article class="workspace-card">
        <div class="card-header">
          <div>
            <p class="workspace-kicker">我的资料</p>
            <h2>编辑基础信息</h2>
          </div>
        </div>
        <form class="profile-form" @submit.prevent="saveProfile">
          <label>
            <span>用户名</span>
            <input v-model="profileForm.username" />
          </label>
          <label>
            <span>邮箱</span>
            <input v-model="profileForm.email" type="email" />
          </label>
          <label>
            <span>手机号</span>
            <input v-model="profileForm.phone" />
          </label>
          <label>
            <span>头像 URL</span>
            <input v-model="profileForm.avatar" />
          </label>
          <label class="full-line">
            <span>个人简介</span>
            <textarea v-model="profileForm.bio" rows="4" />
          </label>
          <button class="workspace-button" type="submit" :disabled="saveProfileLoading">
            {{ saveProfileLoading ? '保存中...' : '保存资料' }}
          </button>
        </form>
      </article>

      <article class="workspace-card workspace-card-wide">
        <div class="card-header card-header-spread">
          <div>
            <p class="workspace-kicker">我的资产</p>
            <h2>Prompt / 收藏 / 评论</h2>
          </div>
          <button class="workspace-button" type="button" @click="openCreatePrompt">新建 Prompt</button>
        </div>

        <div class="workspace-tabs">
          <button type="button" class="tab-button" :class="{ 'tab-button-active': activeTab === 'prompts' }" @click="activeTab = 'prompts'">我的 Prompt</button>
          <button type="button" class="tab-button" :class="{ 'tab-button-active': activeTab === 'favorites' }" @click="activeTab = 'favorites'">我的收藏</button>
          <button type="button" class="tab-button" :class="{ 'tab-button-active': activeTab === 'comments' }" @click="activeTab = 'comments'">我的评论</button>
        </div>

        <p v-if="profileLoading" class="workspace-loading">正在加载个人中心数据...</p>

        <div v-else-if="activeTab === 'prompts'" class="list-stack">
          <article v-for="prompt in myPrompts" :key="prompt.id" class="item-card">
            <div>
              <h3>{{ prompt.title }}</h3>
              <p>{{ prompt.summary || '暂无摘要' }}</p>
            </div>
            <div class="item-actions">
              <span>{{ prompt.status }}</span>
              <button type="button" @click="openEditPrompt(prompt)">编辑</button>
              <button type="button" @click="removePrompt(prompt.id)">删除</button>
            </div>
          </article>
        </div>

        <div v-else-if="activeTab === 'favorites'" class="list-stack">
          <article v-for="prompt in myFavorites" :key="prompt.id" class="item-card">
            <div>
              <h3>{{ prompt.title }}</h3>
              <p>{{ prompt.summary || '暂无摘要' }}</p>
            </div>
            <div class="item-actions">
              <span>{{ prompt.favoriteCount }} 收藏</span>
              <span>{{ prompt.likeCount }} 点赞</span>
            </div>
          </article>
        </div>

        <div v-else class="list-stack">
          <article v-for="comment in myComments" :key="comment.id" class="item-card">
            <div>
              <h3>{{ comment.prompt?.title || '所属 Prompt 已不可见' }}</h3>
              <p>{{ comment.content }}</p>
            </div>
            <div class="item-actions">
              <span>{{ comment.createTime }}</span>
              <span>{{ comment.prompt?.status || 'unknown' }}</span>
            </div>
          </article>
        </div>
      </article>
    </section>

    <PromptEditorDialog
      :visible="promptEditorVisible"
      :submitting="promptSubmitting"
      :error-message="panelError"
      :categories="categories"
      :tags="tags"
      :initial-prompt="editingPrompt"
      @close="closePromptEditor"
      @save="savePrompt"
    />
  </div>
</template>

<style scoped>
.workspace-empty,.workspace-card,.summary-card { border-radius: 26px; background: rgba(255, 251, 245, 0.84); border: 1px solid rgba(122, 93, 70, 0.12); }
.workspace-empty { display: grid; gap: 0.8rem; justify-items: start; padding: 1.5rem; }
.workspace-kicker { margin: 0; font-size: 0.76rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-accent-strong); }
.workspace-empty h2,.workspace-card h2,.item-card h3 { margin: 0; font-family: var(--font-display); color: var(--color-ink); }
.workspace-button,.tab-button,.item-actions button { min-height: 42px; padding: 0 0.95rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); }
.workspace-shell { display: grid; gap: 1rem; }
.workspace-error,.workspace-message { margin: 0; padding: 0.9rem 1rem; border-radius: 18px; }
.workspace-error { background: rgba(182, 79, 47, 0.12); color: #8f4022; }
.workspace-message { background: rgba(156, 110, 72, 0.12); color: var(--color-ink); }
.workspace-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.summary-card { display: grid; gap: 0.35rem; padding: 1rem; }
.summary-card span { color: var(--color-muted); }
.summary-card strong { font-family: var(--font-display); font-size: 1.9rem; color: var(--color-ink); }
.workspace-grid { display: grid; grid-template-columns: 0.9fr 1.4fr; gap: 1rem; }
.workspace-card { display: grid; gap: 1rem; padding: 1.2rem; }
.workspace-card-wide { align-content: start; }
.card-header { display: flex; align-items: start; justify-content: space-between; gap: 1rem; }
.card-header-spread { align-items: center; }
.profile-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.9rem; }
.profile-form label { display: grid; gap: 0.45rem; }
.profile-form span { color: var(--color-ink); font-size: 0.92rem; }
.profile-form input,.profile-form textarea { width: 100%; padding: 0.95rem 1rem; border-radius: 18px; border: 1px solid rgba(122, 93, 70, 0.14); background: rgba(255, 255, 255, 0.72); }
.full-line { grid-column: 1 / -1; }
.workspace-tabs { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.tab-button-active { border-color: transparent; background: var(--color-accent); color: #fffaf2; }
.workspace-loading { margin: 0; color: var(--color-muted); }
.list-stack { display: grid; gap: 0.8rem; }
.item-card { display: flex; justify-content: space-between; gap: 1rem; align-items: start; padding: 1rem; border-radius: 22px; background: rgba(255, 255, 255, 0.68); border: 1px solid rgba(122, 93, 70, 0.1); }
.item-card p { margin: 0.4rem 0 0; color: var(--color-muted); line-height: 1.7; }
.item-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: 0.6rem; align-items: center; color: var(--color-muted); font-size: 0.88rem; }
@media (max-width: 1100px) { .workspace-grid { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .workspace-summary { grid-template-columns: 1fr; } .profile-form { grid-template-columns: 1fr; } .item-card { flex-direction: column; } }
</style>
