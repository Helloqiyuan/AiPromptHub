<script setup lang="ts">
import type { CommentNode } from '@/types/models';
import { Trash2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    node: CommentNode;
    depth?: number;
    currentUserId?: number | null;
    isAdmin?: boolean;
    deletingId?: number | null;
  }>(),
  { depth: 0 },
);

const emit = defineEmits<{
  reply: [parentId: number];
  delete: [id: number];
}>();

function canDelete(): boolean {
  if (!props.currentUserId) return false;
  if (props.isAdmin) return true;
  return Number(props.node.userId) === Number(props.currentUserId);
}
</script>

<template>
  <div
    class="border-l-2 border-[color-mix(in_oklab,var(--aph-primary)_35%,var(--aph-border))] pl-3 transition-colors"
    :style="{ marginLeft: depth ? `${Math.min(depth, 6) * 12}px` : 0 }"
  >
    <div
      class="rounded-[var(--aph-radius-lg)] border border-transparent bg-[var(--aph-surface-muted)]/80 px-3 py-2.5 transition-[background-color,box-shadow,border-color] duration-[var(--aph-duration-fast)] hover:border-[var(--aph-border)] hover:bg-[var(--aph-surface)] hover:shadow-[var(--aph-shadow-sm)]"
    >
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="font-semibold text-[var(--aph-text)]">{{ node.author?.username || '用户' }}</span>
        <time v-if="node.createTime" class="text-xs text-[var(--aph-text-subtle)]" :datetime="node.createTime">
          {{ node.createTime }}
        </time>
      </div>
      <p class="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--aph-text)]">{{ node.content }}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-if="currentUserId"
          type="button"
          class="min-h-11 rounded-[var(--aph-radius-md)] px-2 text-xs font-medium text-[var(--aph-primary)] transition-colors hover:bg-[var(--aph-primary-soft)]"
          @click="emit('reply', node.id)"
        >
          回复
        </button>
        <button
          v-if="canDelete()"
          type="button"
          class="inline-flex min-h-11 items-center gap-1 rounded-[var(--aph-radius-md)] px-2 text-xs font-medium text-red-600 transition-colors hover:bg-[var(--aph-danger-soft)] disabled:opacity-50"
          :disabled="deletingId === node.id"
          aria-label="删除评论"
          @click="emit('delete', node.id)"
        >
          <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
          删除
        </button>
      </div>
    </div>
    <div v-if="node.children?.length" class="mt-2 space-y-2">
      <CommentThread
        v-for="ch in node.children"
        :key="ch.id"
        :node="ch"
        :depth="depth + 1"
        :current-user-id="currentUserId"
        :is-admin="isAdmin"
        :deleting-id="deletingId"
        @reply="emit('reply', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
