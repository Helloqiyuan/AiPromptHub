import { computed, ref, shallowRef, watch } from 'vue';

import { ApiError } from '@/lib/api';
import { fetchCategories, fetchTags } from '@/services/catalog';
import { createComment, deleteComment, fetchCommentTree } from '@/services/comments';
import {
  fetchPromptDetail,
  fetchPrompts,
  togglePromptFavorite,
  togglePromptLike,
  type PromptQuery,
} from '@/services/prompts';
import { useSession } from '@/composables/useSession';
import { useUiState } from '@/composables/useUiState';
import type { CategoryItem, CommentItem, PromptItem, TagItem } from '@/shared/types/domain';
import type { Pagination } from '@/shared/types/api';

const emptyPagination: Pagination = {
  page: 1,
  pageSize: 6,
  total: 0,
  totalPages: 0,
};

export function usePromptHallPage() {
  const { currentUser, isAuthenticated, token } = useSession();
  const { openAuthDialog } = useUiState();

  const categories = ref<CategoryItem[]>([]);
  const tags = ref<TagItem[]>([]);
  const prompts = ref<PromptItem[]>([]);
  const pagination = ref<Pagination>(emptyPagination);
  const selectedPrompt = shallowRef<PromptItem | null>(null);
  const comments = ref<CommentItem[]>([]);
  const loading = shallowRef(false);
  const detailLoading = shallowRef(false);
  const commentLoading = shallowRef(false);
  const commentSubmitting = shallowRef(false);
  const errorMessage = shallowRef('');
  const commentDraft = shallowRef('');
  const replyTarget = shallowRef<CommentItem | null>(null);

  const keyword = shallowRef('');
  const page = shallowRef(1);
  const pageSize = shallowRef(6);
  const selectedSecondCategoryId = shallowRef<number | null>(null);
  const selectedThirdCategoryId = shallowRef<number | null>(null);
  const selectedTagId = shallowRef<number | null>(null);
  const selectedPromptId = shallowRef<number | null>(null);

  const rootCategory = computed(() => categories.value.find((item) => item.parentId === -1) ?? null);
  const secondCategories = computed(() => {
    const rootId = rootCategory.value?.id ?? 1;
    return categories.value.filter((item) => item.parentId === rootId);
  });
  const thirdCategories = computed(() => {
    if (!selectedSecondCategoryId.value) {
      return [] as CategoryItem[];
    }
    return categories.value.filter((item) => item.parentId === selectedSecondCategoryId.value);
  });

  const heroMetrics = computed(() => [
    { label: 'Prompt 存量', value: `${pagination.value.total}` },
    { label: '二级分类', value: `${secondCategories.value.length}` },
    { label: '标签总量', value: `${tags.value.length}` },
    { label: '当前页结果', value: `${prompts.value.length}` },
  ]);

  const spotlight = computed(() => {
    const prompt = prompts.value[0];
    if (!prompt) {
      return null;
    }

    const labels = getPromptLabels(prompt);
    return {
      title: prompt.title,
      summary: prompt.summary ?? '暂无摘要',
      categoryName: `${labels.second} / ${labels.third}`,
      tagNames: prompt.tags.map((tag) => tag.name),
    };
  });

  function getPromptLabels(prompt: PromptItem) {
    const third = categories.value.find((item) => item.id === prompt.categoryId) ?? null;
    const second = third ? categories.value.find((item) => item.id === third.parentId) ?? null : null;

    return {
      second: second?.name ?? '未分类',
      third: third?.name ?? prompt.category?.name ?? '未分类',
    };
  }

  function buildQuery(): PromptQuery {
    return {
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      parentCategoryId: selectedSecondCategoryId.value,
      categoryId: selectedThirdCategoryId.value,
      tagId: selectedTagId.value,
    };
  }

  async function loadCatalog() {
    const [categoryRows, tagRows] = await Promise.all([fetchCategories(), fetchTags()]);
    categories.value = categoryRows;
    tags.value = tagRows;

    if (!selectedSecondCategoryId.value) {
      selectedSecondCategoryId.value = secondCategories.value[0]?.id ?? null;
    }
  }

  async function loadPrompts() {
    loading.value = true;
    errorMessage.value = '';
    try {
      const result = await fetchPrompts(buildQuery(), token.value);
      prompts.value = result.list;
      pagination.value = result.pagination;
      const nextPromptId = result.list.find((item) => item.id === selectedPromptId.value)?.id ?? result.list[0]?.id ?? null;
      selectedPromptId.value = nextPromptId;
      if (nextPromptId) {
        await loadPromptDetail(nextPromptId);
      } else {
        selectedPrompt.value = null;
        comments.value = [];
      }
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : '加载 Prompt 失败';
    } finally {
      loading.value = false;
    }
  }

  async function loadPromptDetail(promptId: number) {
    detailLoading.value = true;
    errorMessage.value = '';
    try {
      const [detail, commentRows] = await Promise.all([
        fetchPromptDetail(promptId, token.value),
        fetchCommentTree(promptId),
      ]);
      selectedPrompt.value = detail;
      comments.value = commentRows;
      selectedPromptId.value = promptId;
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : '加载 Prompt 详情失败';
    } finally {
      detailLoading.value = false;
    }
  }

  async function reloadCurrentPrompt() {
    if (!selectedPromptId.value) {
      return;
    }
    await loadPromptDetail(selectedPromptId.value);
  }

  async function refreshCurrentComments() {
    if (!selectedPromptId.value) {
      return;
    }
    commentLoading.value = true;
    try {
      comments.value = await fetchCommentTree(selectedPromptId.value);
    } finally {
      commentLoading.value = false;
    }
  }

  async function toggleLike(promptId: number) {
    if (!isAuthenticated.value || !token.value) {
      openAuthDialog('login');
      return;
    }

    try {
      await togglePromptLike(token.value, promptId);
      await loadPrompts();
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : '点赞失败';
    }
  }

  async function toggleFavorite(promptId: number) {
    if (!isAuthenticated.value || !token.value) {
      openAuthDialog('login');
      return;
    }

    try {
      await togglePromptFavorite(token.value, promptId);
      await loadPrompts();
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : '收藏失败';
    }
  }

  async function submitComment() {
    if (!selectedPromptId.value) {
      return;
    }

    if (!isAuthenticated.value || !token.value) {
      openAuthDialog('login');
      return;
    }

    if (!commentDraft.value.trim()) {
      errorMessage.value = '评论内容不能为空';
      return;
    }

    commentSubmitting.value = true;
    try {
      await createComment(token.value, {
        promptId: selectedPromptId.value,
        content: commentDraft.value.trim(),
        parentId: replyTarget.value?.id,
      });
      commentDraft.value = '';
      replyTarget.value = null;
      await Promise.all([reloadCurrentPrompt(), refreshCurrentComments()]);
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : '发表评论失败';
    } finally {
      commentSubmitting.value = false;
    }
  }

  async function removeComment(commentId: number) {
    if (!token.value) {
      openAuthDialog('login');
      return;
    }

    try {
      await deleteComment(token.value, commentId);
      await Promise.all([reloadCurrentPrompt(), refreshCurrentComments()]);
    } catch (error) {
      errorMessage.value = error instanceof ApiError ? error.message : '删除评论失败';
    }
  }

  function selectSecondCategory(categoryId: number | null) {
    selectedSecondCategoryId.value = categoryId;
    selectedThirdCategoryId.value = null;
    page.value = 1;
  }

  function selectThirdCategory(categoryId: number | null) {
    selectedThirdCategoryId.value = categoryId;
    page.value = 1;
  }

  function selectTag(tagId: number | null) {
    selectedTagId.value = tagId;
    page.value = 1;
  }

  function setPage(nextPage: number) {
    if (nextPage < 1 || nextPage > Math.max(pagination.value.totalPages, 1)) {
      return;
    }
    page.value = nextPage;
  }

  function startReply(comment: CommentItem) {
    replyTarget.value = comment;
  }

  function cancelReply() {
    replyTarget.value = null;
  }

  function canDeleteComment(comment: CommentItem) {
    if (!currentUser.value) {
      return false;
    }

    return currentUser.value.id === comment.userId || ['admin', 'super_admin'].includes(currentUser.value.role);
  }

  watch(selectedPromptId, (promptId) => {
    if (promptId) {
      loadPromptDetail(promptId);
    }
  });

  watch(
    [keyword, selectedSecondCategoryId, selectedThirdCategoryId, selectedTagId, page, pageSize, token],
    (_values, _previous, onCleanup) => {
      const timer = window.setTimeout(() => {
        loadPrompts();
      }, 180);

      onCleanup(() => {
        window.clearTimeout(timer);
      });
    },
    { immediate: false },
  );

  async function initialize() {
    await loadCatalog();
    await loadPrompts();
  }

  return {
    categories,
    commentDraft,
    commentLoading,
    commentSubmitting,
    comments,
    detailLoading,
    errorMessage,
    heroMetrics,
    keyword,
    loading,
    page,
    pageSize,
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
    loadPrompts,
    removeComment,
    selectSecondCategory,
    selectTag,
    selectThirdCategory,
    setPage,
    startReply,
    submitComment,
    toggleFavorite,
    toggleLike,
    loadPromptDetail,
  };
}
