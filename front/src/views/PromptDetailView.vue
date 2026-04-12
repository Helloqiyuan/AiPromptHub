<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import * as commentsApi from '@/api/comments';
import * as promptsApi from '@/api/prompts';
import CommentThread from '@/components/CommentThread.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import UiTag from '@/components/ui/UiTag.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { CommentNode, Prompt } from '@/types/models';
import { Heart, Loader2, Star, Pencil, Trash2 } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { showToast } = useToast();

const id = computed(() => Number(route.params.id));

const loading = ref(true);
const prompt = ref<Prompt | null>(null);
const tree = ref<CommentNode[]>([]);

const commentText = ref('');
const replyParentId = ref<number | null>(null);
const likeLoading = ref(false);
const favLoading = ref(false);
const deleting = ref(false);
const deletingCommentId = ref<number | null>(null);

const canEdit = computed(() => {
  if (!prompt.value || !auth.user) return false;
  if (auth.isAdmin) return true;
  return Number(prompt.value.userId) === Number(auth.user.id);
});

async function loadAll(): Promise<void> {
  loading.value = true;
  try {
    const [p, c] = await Promise.all([promptsApi.getPrompt(id.value), commentsApi.getCommentTree(id.value)]);
    prompt.value = p;
    tree.value = c;
  } catch (e) {
    showToast(errorMessage(e));
    await router.replace({ name: 'home' });
  } finally {
    loading.value = false;
  }
}

async function toggleLike(): Promise<void> {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  likeLoading.value = true;
  try {
    const r = await promptsApi.toggleLike(id.value);
    if (prompt.value) {
      prompt.value.liked = r.liked;
      prompt.value.likeCount = r.likeCount;
    }
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    likeLoading.value = false;
  }
}

async function toggleFav(): Promise<void> {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  favLoading.value = true;
  try {
    const r = await promptsApi.toggleFavorite(id.value);
    if (prompt.value) {
      prompt.value.favorited = r.favorited;
      prompt.value.favoriteCount = r.favoriteCount;
    }
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    favLoading.value = false;
  }
}

async function submitComment(): Promise<void> {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  const content = commentText.value.trim();
  if (!content) {
    showToast('请输入评论内容');
    return;
  }
  try {
    await commentsApi.createComment({
      promptId: id.value,
      content,
      parentId: replyParentId.value ?? undefined,
    });
    commentText.value = '';
    replyParentId.value = null;
    tree.value = await commentsApi.getCommentTree(id.value);
    prompt.value = await promptsApi.getPrompt(id.value);
    showToast('评论已发布');
  } catch (e) {
    showToast(errorMessage(e));
  }
}

function onReply(parentId: number): void {
  replyParentId.value = parentId;
  document.getElementById('comment-box')?.focus();
}

async function onDeleteComment(cid: number): Promise<void> {
  if (!confirm('确定删除该评论及其回复？')) return;
  deletingCommentId.value = cid;
  try {
    await commentsApi.deleteComment(cid);
    tree.value = await commentsApi.getCommentTree(id.value);
    prompt.value = await promptsApi.getPrompt(id.value);
    showToast('已删除');
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    deletingCommentId.value = null;
  }
}

async function onDeletePrompt(): Promise<void> {
  if (!prompt.value) return;
  if (!confirm('确定删除该 Prompt？')) return;
  deleting.value = true;
  try {
    await promptsApi.deletePrompt(prompt.value.id);
    showToast('已删除');
    await router.replace({ name: 'home' });
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  loadAll();
});

watch(id, () => {
  loadAll();
});
</script>

<template>
  <div>
    <UiSkeleton v-if="loading" :lines="6" />

    <template v-else-if="prompt">
      <UiCard as="article" padding="lg">
        <header class="border-b border-[var(--aph-border)] pb-5">
          <h1 class="text-2xl font-bold tracking-tight text-[var(--aph-text)] sm:text-3xl">{{ prompt.title }}</h1>
          <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--aph-text-muted)]">
            <span v-if="prompt.author">{{ prompt.author.username }}</span>
            <span v-if="prompt.category" class="text-[var(--aph-text-subtle)]">· {{ prompt.category.name }}</span>
            <time v-if="prompt.createTime" class="text-[var(--aph-text-subtle)]">{{ prompt.createTime }}</time>
            <UiTag v-if="prompt.status !== 'published'" small>{{ prompt.status }}</UiTag>
          </div>
          <div class="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-[var(--aph-radius-md)] border px-4 text-sm font-medium transition-[transform,background-color,border-color] duration-[var(--aph-duration-fast)] active:scale-[0.98] disabled:opacity-45"
              :class="
                prompt.liked
                  ? 'border-[color-mix(in_oklab,var(--aph-primary)_45%,var(--aph-border))] bg-[var(--aph-primary-soft)] text-[var(--aph-primary)]'
                  : 'border-[var(--aph-border)] bg-[var(--aph-surface)] text-[var(--aph-text)] hover:bg-[var(--aph-surface-muted)]'
              "
              :disabled="likeLoading"
              :aria-pressed="prompt.liked"
              aria-label="点赞"
              @click="toggleLike"
            >
              <Loader2 v-if="likeLoading" class="h-4 w-4 animate-spin" aria-hidden="true" />
              <Heart v-else class="h-4 w-4" :fill="prompt.liked ? 'currentColor' : 'none'" aria-hidden="true" />
              点赞 {{ prompt.likeCount }}
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-[var(--aph-radius-md)] border px-4 text-sm font-medium transition-[transform,background-color] duration-[var(--aph-duration-fast)] active:scale-[0.98] disabled:opacity-45"
              :class="
                prompt.favorited
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-[var(--aph-border)] bg-[var(--aph-surface)] text-[var(--aph-text)] hover:bg-[var(--aph-surface-muted)]'
              "
              :disabled="favLoading"
              :aria-pressed="prompt.favorited"
              aria-label="收藏"
              @click="toggleFav"
            >
              <Loader2 v-if="favLoading" class="h-4 w-4 animate-spin" aria-hidden="true" />
              <Star v-else class="h-4 w-4" :fill="prompt.favorited ? 'currentColor' : 'none'" aria-hidden="true" />
              收藏 {{ prompt.favoriteCount }}
            </button>
            <RouterLink
              v-if="canEdit"
              :to="{ name: 'prompt-edit', params: { id: prompt.id } }"
              class="inline-flex min-h-11 items-center gap-2 rounded-[var(--aph-radius-md)] border border-[var(--aph-border)] bg-[var(--aph-surface)] px-4 text-sm font-medium text-[var(--aph-text)] transition-colors hover:bg-[var(--aph-surface-muted)]"
            >
              <Pencil class="h-4 w-4" aria-hidden="true" />
              编辑
            </RouterLink>
            <UiButton v-if="canEdit" variant="danger" :disabled="deleting" @click="onDeletePrompt">
              <Trash2 class="h-4 w-4" aria-hidden="true" />
              删除
            </UiButton>
          </div>
        </header>

        <p v-if="prompt.summary" class="mt-5 text-base leading-relaxed text-[var(--aph-text-muted)]">{{ prompt.summary }}</p>

        <section class="mt-8">
          <h2 class="text-lg font-semibold text-[var(--aph-text)]">正文</h2>
          <pre
            class="mt-3 max-h-[min(70vh,520px)] overflow-auto whitespace-pre-wrap rounded-[var(--aph-radius-lg)] border border-[var(--aph-border)] bg-[var(--aph-surface-muted)] p-4 font-mono text-sm leading-relaxed text-[var(--aph-text)] shadow-inner"
          >{{ prompt.content }}</pre>
        </section>

        <section v-if="prompt.usageScenario" class="mt-8">
          <h2 class="text-lg font-semibold text-[var(--aph-text)]">使用场景</h2>
          <p class="mt-2 leading-relaxed text-[var(--aph-text-muted)]">{{ prompt.usageScenario }}</p>
        </section>

        <section v-if="prompt.exampleInput || prompt.exampleOutput" class="mt-8 grid gap-6 sm:grid-cols-2">
          <div v-if="prompt.exampleInput">
            <h3 class="font-medium text-[var(--aph-text)]">示例输入</h3>
            <pre
              class="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-[var(--aph-radius-md)] border border-[var(--aph-border)] bg-[var(--aph-surface-muted)] p-3 font-mono text-xs leading-relaxed"
            >{{ prompt.exampleInput }}</pre>
          </div>
          <div v-if="prompt.exampleOutput">
            <h3 class="font-medium text-[var(--aph-text)]">示例输出</h3>
            <pre
              class="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-[var(--aph-radius-md)] border border-[var(--aph-border)] bg-[var(--aph-surface-muted)] p-3 font-mono text-xs leading-relaxed"
            >{{ prompt.exampleOutput }}</pre>
          </div>
        </section>

        <div v-if="(prompt.tags || []).length" class="mt-6 flex flex-wrap gap-2">
          <UiTag v-for="t in prompt.tags" :key="t.id">{{ t.name }}</UiTag>
        </div>
        <div v-if="(prompt.models || []).length" class="mt-3 text-sm text-[var(--aph-text-muted)]">
          <span class="font-medium text-[var(--aph-text-subtle)]">适用模型：</span>
          <span v-for="m in prompt.models" :key="m.id" class="mr-2">{{ m.name }}</span>
        </div>
      </UiCard>

      <UiCard class="mt-8" padding="lg" aria-labelledby="comments-heading">
        <h2 id="comments-heading" class="text-lg font-semibold text-[var(--aph-text)]">
          评论
          <span class="text-[var(--aph-text-muted)]">（{{ prompt.commentCount }}）</span>
        </h2>

        <div v-if="auth.isAuthenticated" class="mt-4 space-y-3">
          <p v-if="replyParentId" class="text-sm text-[var(--aph-primary)]">
            回复评论 #{{ replyParentId }}
            <button type="button" class="ml-2 rounded font-medium underline underline-offset-2 hover:text-[var(--aph-primary-hover)]" @click="replyParentId = null">
              取消
            </button>
          </p>
          <label for="comment-box" class="aph-label">发表评论</label>
          <textarea
            id="comment-box"
            v-model="commentText"
            rows="4"
            class="aph-textarea mt-1.5 text-base font-sans"
            placeholder="友善交流，禁止人身攻击与违法内容"
          />
          <UiButton type="button" @click="submitComment">发布评论</UiButton>
        </div>
        <p v-else class="mt-4 text-sm text-[var(--aph-text-muted)]">
          <RouterLink
            :to="{ name: 'login', query: { redirect: route.fullPath } }"
            class="font-medium text-[var(--aph-primary)] underline-offset-2 hover:underline"
          >
            登录
          </RouterLink>
          后参与评论
        </p>

        <ul class="mt-6 list-none space-y-3 p-0">
          <li v-for="node in tree" :key="node.id">
            <CommentThread
              :node="node"
              :current-user-id="auth.user?.id ?? null"
              :is-admin="auth.isAdmin"
              :deleting-id="deletingCommentId"
              @reply="onReply"
              @delete="onDeleteComment"
            />
          </li>
        </ul>
        <p v-if="!tree.length" class="text-sm text-[var(--aph-text-subtle)]">暂无评论，来抢沙发吧。</p>
      </UiCard>
    </template>
  </div>
</template>
