<script setup lang="ts">
import CommentThread from './CommentThread.vue';
import type { CommentItem, PromptItem, UserProfile } from '@/shared/types/domain';

const props = defineProps<{
  prompt: PromptItem | null;
  comments: CommentItem[];
  detailLoading: boolean;
  commentLoading: boolean;
  commentDraft: string;
  replyTarget: CommentItem | null;
  commentSubmitting: boolean;
  currentUser: UserProfile | null;
  secondCategoryName: string;
  thirdCategoryName: string;
  canDeleteComment: (comment: CommentItem) => boolean;
}>();

const emit = defineEmits<{
  openAuth: [tab: 'login' | 'register'];
  toggleLike: [promptId: number];
  toggleFavorite: [promptId: number];
  'update:commentDraft': [value: string];
  submitComment: [];
  replyComment: [comment: CommentItem];
  cancelReply: [];
  deleteComment: [commentId: number];
}>();
</script>

<template>
  <aside class="detail-shell">
    <article v-if="prompt" class="detail-card">
      <p v-if="detailLoading" class="detail-loading">正在加载 Prompt 详情...</p>

      <div class="detail-header">
        <p class="detail-kicker">Prompt 详情预览</p>
        <h2 class="detail-title">{{ prompt.title }}</h2>
        <p class="detail-summary">{{ prompt.summary || '这个 Prompt 暂无摘要说明。' }}</p>
      </div>

      <div class="detail-pills">
        <span>{{ secondCategoryName }}</span>
        <span>{{ thirdCategoryName }}</span>
        <span v-for="tag in prompt.tags" :key="tag.id">{{ tag.name }}</span>
      </div>

      <div class="detail-actions">
        <button class="detail-action detail-action-dark" type="button" @click="emit('toggleLike', prompt.id)">
          {{ prompt.liked ? '已点赞' : '点赞' }} {{ prompt.likeCount }}
        </button>
        <button class="detail-action" type="button" @click="emit('toggleFavorite', prompt.id)">
          {{ prompt.favorited ? '已收藏' : '收藏' }} {{ prompt.favoriteCount }}
        </button>
        <button class="detail-action" type="button" @click="emit('openAuth', 'login')">切换账号</button>
      </div>

      <section class="detail-section">
        <h3>Prompt 内容</h3>
        <p>{{ prompt.content }}</p>
      </section>

      <section class="detail-section detail-grid">
        <div>
          <h3>适用场景</h3>
          <p>{{ prompt.usageScenario || '暂无场景说明' }}</p>
        </div>
        <div>
          <h3>示例输入</h3>
          <p>{{ prompt.exampleInput || '暂无示例输入' }}</p>
        </div>
        <div>
          <h3>示例输出</h3>
          <p>{{ prompt.exampleOutput || '暂无示例输出' }}</p>
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-section-header">
          <h3>评论区</h3>
          <span>共 {{ prompt.commentCount }} 条</span>
        </div>

        <div class="comment-editor">
          <div v-if="replyTarget" class="reply-chip">
            <span>正在回复：{{ replyTarget.author?.username || '匿名用户' }}</span>
            <button type="button" @click="emit('cancelReply')">取消回复</button>
          </div>
          <textarea
            :value="commentDraft"
            class="comment-textarea"
            rows="4"
            placeholder="写下你的评论，支持直接发一级评论或回复。"
            @input="emit('update:commentDraft', ($event.target as HTMLTextAreaElement).value)"
          />
          <button class="detail-action detail-action-dark" type="button" :disabled="commentSubmitting" @click="emit('submitComment')">
            {{ commentSubmitting ? '提交中...' : '发表评论' }}
          </button>
        </div>

        <p v-if="commentLoading" class="detail-loading">正在加载评论树...</p>
        <CommentThread
          v-else-if="comments.length"
          :comments="comments"
          :current-user="currentUser"
          :can-delete-comment="canDeleteComment"
          @reply-comment="emit('replyComment', $event)"
          @delete-comment="emit('deleteComment', $event)"
        />
        <div v-else class="comment-empty">
          <p>还没有评论，发布第一条评论吧。</p>
        </div>
      </section>
    </article>

    <article v-else class="detail-card detail-empty">
      <p class="detail-kicker">Prompt 详情预览</p>
      <h2 class="detail-title">当前筛选下暂无内容</h2>
      <p class="detail-summary">调整分类、标签或关键词后，这里会自动加载对应 Prompt 详情。</p>
    </article>
  </aside>
</template>

<style scoped>
.detail-shell { position: sticky; top: 1.5rem; }
.detail-card { display: grid; gap: 1rem; padding: 1.35rem; border-radius: 28px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 250, 243, 0.9); box-shadow: 0 18px 42px rgba(90, 63, 43, 0.08); }
.detail-loading { margin: 0; color: var(--color-muted); }
.detail-kicker { margin: 0; font-size: 0.76rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-accent-strong); }
.detail-title { margin: 0; font-family: var(--font-display); font-size: 2rem; line-height: 1.08; color: var(--color-ink); }
.detail-summary,.detail-section p { margin: 0; line-height: 1.75; color: var(--color-muted); }
.detail-pills,.detail-actions { display: flex; flex-wrap: wrap; gap: 0.65rem; }
.detail-pills span,.detail-action { min-height: 42px; padding: 0 0.9rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.76); color: var(--color-ink); font-size: 0.88rem; }
.detail-pills span { display: inline-flex; align-items: center; }
.detail-action-dark { border-color: transparent; background: var(--color-ink); color: #fff8ef; }
.detail-section { display: grid; gap: 0.65rem; padding-top: 1rem; border-top: 1px solid rgba(122, 93, 70, 0.08); }
.detail-section h3 { margin: 0; font-size: 0.98rem; color: var(--color-ink); }
.detail-section-header { display: flex; justify-content: space-between; gap: 0.75rem; align-items: baseline; }
.comment-editor { display: grid; gap: 0.8rem; }
.reply-chip { display: flex; justify-content: space-between; gap: 0.75rem; align-items: center; padding: 0.7rem 0.9rem; border-radius: 18px; background: rgba(214, 188, 158, 0.14); color: var(--color-ink); }
.reply-chip button { min-height: 34px; padding: 0 0.8rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); }
.comment-textarea { width: 100%; padding: 1rem; border-radius: 20px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); resize: vertical; }
.comment-empty p { color: var(--color-muted); }
.detail-empty { min-height: 320px; align-content: center; }
@media (max-width: 1180px) { .detail-shell { position: static; } }
</style>
