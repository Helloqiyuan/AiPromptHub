<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useSession } from '@/composables/useSession';
import { useUiState } from '@/composables/useUiState';

import FilterSidebar from './FilterSidebar.vue';
import HallHero from './HallHero.vue';
import PromptDetailPanel from './PromptDetailPanel.vue';
import PromptGrid from './PromptGrid.vue';
import { usePromptHallPage } from '../composables/usePromptHallPage';

const {
  commentDraft,
  commentLoading,
  commentSubmitting,
  comments,
  detailLoading,
  errorMessage,
  heroMetrics,
  keyword,
  loading,
  pagination,
  prompts,
  replyTarget,
  secondCategories,
  selectedPrompt,
  selectedSecondCategoryId,
  selectedTagId,
  selectedThirdCategoryId,
  spotlight,
  tags,
  thirdCategories,
  cancelReply,
  canDeleteComment,
  getPromptLabels,
  initialize,
  loadPromptDetail,
  removeComment,
  selectSecondCategory,
  selectTag,
  selectThirdCategory,
  setPage,
  startReply,
  submitComment,
  toggleFavorite,
  toggleLike,
} = usePromptHallPage();

const { currentUser, isAdmin, isAuthenticated } = useSession();
const { openAuthDialog } = useUiState();

const selectedPromptLabels = computed(() => {
  if (!selectedPrompt.value) {
    return { second: '未分类', third: '未分类' };
  }

  return getPromptLabels(selectedPrompt.value);
});

function updateCommentDraft(value: string) {
  commentDraft.value = value;
}

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="page-shell">
    <HallHero
      v-model="keyword"
      :metrics="heroMetrics"
      :spotlight="spotlight"
      :is-authenticated="isAuthenticated"
      :is-admin="isAdmin"
      :user-name="currentUser?.username || null"
      @open-auth="openAuthDialog"
    />

    <p v-if="errorMessage" class="page-error">{{ errorMessage }}</p>

    <section class="insight-strip">
      <article>
        <span>分类浏览</span>
        <strong>先看大方向，再缩小到具体模型或细分类目。</strong>
      </article>
      <article>
        <span>标签定位</span>
        <strong>按使用场景快速筛出适合当前任务的 Prompt。</strong>
      </article>
      <article>
        <span>互动沉淀</span>
        <strong>收藏、点赞和评论都会沉淀到你的个人中心。</strong>
      </article>
    </section>

    <section class="content-shell">
      <div class="content-main">
        <FilterSidebar
          :second-categories="secondCategories"
          :third-categories="thirdCategories"
          :tags="tags"
          :selected-second-category-id="selectedSecondCategoryId"
          :selected-third-category-id="selectedThirdCategoryId"
          :selected-tag-id="selectedTagId"
          @select-second="selectSecondCategory"
          @select-third="selectThirdCategory"
          @select-tag="selectTag"
        />

        <PromptGrid
          :prompts="prompts"
          :loading="loading"
          :pagination="pagination"
          :selected-prompt-id="selectedPrompt?.id ?? null"
          :get-category-labels="getPromptLabels"
          @select="loadPromptDetail"
          @toggle-like="toggleLike"
          @toggle-favorite="toggleFavorite"
          @change-page="setPage"
        />
      </div>

      <PromptDetailPanel
        :prompt="selectedPrompt"
        :comments="comments"
        :detail-loading="detailLoading"
        :comment-loading="commentLoading"
        :comment-draft="commentDraft"
        :reply-target="replyTarget"
        :comment-submitting="commentSubmitting"
        :current-user="currentUser"
        :second-category-name="selectedPromptLabels.second"
        :third-category-name="selectedPromptLabels.third"
        :can-delete-comment="canDeleteComment"
        @toggle-like="toggleLike"
        @toggle-favorite="toggleFavorite"
        @open-auth="openAuthDialog"
        @update:comment-draft="updateCommentDraft"
        @submit-comment="submitComment"
        @reply-comment="startReply"
        @cancel-reply="cancelReply"
        @delete-comment="removeComment"
      />
    </section>
  </div>
</template>

<style scoped>
.page-shell { display: grid; gap: 1.4rem; }
.page-error { margin: 0; padding: 0.9rem 1rem; border-radius: 18px; background: rgba(182, 79, 47, 0.12); color: #8f4022; }
.insight-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.insight-strip article { display: grid; gap: 0.45rem; padding: 1rem 1.1rem; border-radius: 22px; background: rgba(255, 252, 246, 0.78); border: 1px solid rgba(122, 93, 70, 0.1); }
.insight-strip span { font-size: 0.8rem; color: var(--color-muted); }
.insight-strip strong { font-family: var(--font-display); font-size: 1.1rem; line-height: 1.35; color: var(--color-ink); }
.content-shell { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.92fr); gap: 1.2rem; align-items: start; }
.content-main { display: grid; gap: 1rem; }
@media (max-width: 1180px) { .content-shell { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .insight-strip { grid-template-columns: 1fr; } }
</style>
