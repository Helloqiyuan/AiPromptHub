<script setup lang="ts">
import type { PaginationMeta } from '@/types/models';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  pagination: PaginationMeta;
  loading?: boolean;
}>();

const emit = defineEmits<{
  change: [page: number];
}>();

function go(p: number): void {
  if (props.loading) return;
  if (p < 1 || p > props.pagination.totalPages) return;
  emit('change', p);
}
</script>

<template>
  <nav
    class="flex flex-wrap items-center justify-center gap-3 py-6"
    aria-label="分页"
  >
    <button
      type="button"
      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--aph-radius-md)] border border-[var(--aph-border)] bg-[var(--aph-surface)] text-[var(--aph-text)] shadow-[var(--aph-shadow-sm)] transition-[transform,background-color,box-shadow] duration-[var(--aph-duration-fast)] ease-[var(--aph-ease-out)] hover:bg-[var(--aph-surface-muted)] active:scale-95 disabled:pointer-events-none disabled:opacity-35"
      :disabled="loading || pagination.page <= 1"
      aria-label="上一页"
      @click="go(pagination.page - 1)"
    >
      <ChevronLeft class="h-5 w-5" />
    </button>
    <span class="min-w-[12rem] px-2 text-center text-sm tabular-nums text-[var(--aph-text-muted)]">
      第 {{ pagination.page }} / {{ pagination.totalPages || 1 }} 页 · 共 {{ pagination.total }} 条
    </span>
    <button
      type="button"
      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--aph-radius-md)] border border-[var(--aph-border)] bg-[var(--aph-surface)] text-[var(--aph-text)] shadow-[var(--aph-shadow-sm)] transition-[transform,background-color,box-shadow] duration-[var(--aph-duration-fast)] ease-[var(--aph-ease-out)] hover:bg-[var(--aph-surface-muted)] active:scale-95 disabled:pointer-events-none disabled:opacity-35"
      :disabled="loading || pagination.page >= pagination.totalPages"
      aria-label="下一页"
      @click="go(pagination.page + 1)"
    >
      <ChevronRight class="h-5 w-5" />
    </button>
  </nav>
</template>
