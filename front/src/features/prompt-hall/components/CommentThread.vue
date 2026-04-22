<script setup lang="ts">
defineOptions({ name: 'CommentThread' });

import type { CommentItem, UserProfile } from '@/shared/types/domain';

const props = defineProps<{
  comments: CommentItem[];
  currentUser: UserProfile | null;
  canDeleteComment: (comment: CommentItem) => boolean;
}>();

const emit = defineEmits<{
  replyComment: [comment: CommentItem];
  deleteComment: [commentId: number];
}>();
</script>

<template>
  <div class="comment-stack">
    <article v-for="comment in props.comments" :key="comment.id" class="comment-card">
      <div class="comment-meta">
        <div>
          <strong>{{ comment.author?.username || '匿名用户' }}</strong>
          <span v-if="comment.replyUser" class="comment-reply">回复 {{ comment.replyUser.username }}</span>
        </div>
        <span>{{ comment.createTime }}</span>
      </div>
      <p class="comment-content">{{ comment.content }}</p>
      <div class="comment-actions">
        <button type="button" class="comment-button" @click="emit('replyComment', comment)">回复</button>
        <button v-if="props.currentUser && props.canDeleteComment(comment)" type="button" class="comment-button comment-button-danger" @click="emit('deleteComment', comment.id)">
          删除
        </button>
      </div>
      <CommentThread
        v-if="comment.children.length"
        :comments="comment.children"
        :current-user="props.currentUser"
        :can-delete-comment="props.canDeleteComment"
        class="comment-children"
        @reply-comment="emit('replyComment', $event)"
        @delete-comment="emit('deleteComment', $event)"
      />
    </article>
  </div>
</template>

<style scoped>
.comment-stack { display: grid; gap: 0.8rem; }
.comment-card { display: grid; gap: 0.55rem; padding: 0.95rem; border-radius: 20px; background: rgba(255, 251, 244, 0.75); border: 1px solid rgba(122, 93, 70, 0.1); }
.comment-meta { display: flex; justify-content: space-between; gap: 0.75rem; color: var(--color-muted); font-size: 0.84rem; }
.comment-meta strong { color: var(--color-ink); }
.comment-reply { margin-left: 0.5rem; }
.comment-content { margin: 0; line-height: 1.7; color: var(--color-ink); }
.comment-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.comment-button { min-height: 36px; padding: 0 0.8rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); }
.comment-button-danger { color: #8f4022; }
.comment-children { padding-left: 0.8rem; border-left: 1px dashed rgba(122, 93, 70, 0.16); }
</style>
