<script setup lang="ts">
import PromptCard from './PromptCard.vue';
import type { Pagination } from '@/shared/types/api';
import type { PromptItem } from '@/shared/types/domain';

interface CategoryLabels {
  second: string;
  third: string;
}

const props = defineProps<{
  prompts: PromptItem[];
  loading: boolean;
  pagination: Pagination;
  selectedPromptId: number | null;
  getCategoryLabels: (prompt: PromptItem) => CategoryLabels;
}>();

const emit = defineEmits<{
  select: [promptId: number];
  toggleLike: [promptId: number];
  toggleFavorite: [promptId: number];
  changePage: [page: number];
}>();
</script>

<template>
  <section class="grid-shell">
    <header class="grid-header">
      <div>
        <p class="grid-kicker">Prompt 大厅</p>
        <h2 class="grid-title">挑选适合当下任务的 Prompt</h2>
      </div>
      <span class="grid-count">共 {{ props.pagination.total }} 条</span>
    </header>

    <p v-if="props.loading" class="grid-loading">正在加载 Prompt 列表...</p>

    <div v-else-if="props.prompts.length" class="grid-list">
      <PromptCard
        v-for="prompt in props.prompts"
        :key="prompt.id"
        :prompt="prompt"
        :selected="props.selectedPromptId === prompt.id"
        :second-category-name="props.getCategoryLabels(prompt).second"
        :third-category-name="props.getCategoryLabels(prompt).third"
        @select="emit('select', $event)"
        @toggle-like="emit('toggleLike', $event)"
        @toggle-favorite="emit('toggleFavorite', $event)"
      />
    </div>

    <article v-else class="empty-state">
      <p class="grid-kicker">没有匹配结果</p>
      <h3>当前筛选条件下没有 Prompt。</h3>
      <p>可以换一个二级分类、三级分类、标签或搜索关键词试试。</p>
    </article>

    <footer class="grid-pagination">
      <button type="button" class="page-button" :disabled="props.pagination.page <= 1" @click="emit('changePage', props.pagination.page - 1)">上一页</button>
      <span>第 {{ props.pagination.page }} / {{ Math.max(props.pagination.totalPages, 1) }} 页</span>
      <button type="button" class="page-button" :disabled="props.pagination.page >= Math.max(props.pagination.totalPages, 1)" @click="emit('changePage', props.pagination.page + 1)">下一页</button>
    </footer>
  </section>
</template>

<style scoped>
.grid-shell { display: grid; gap: 1rem; }
.grid-header { display: flex; justify-content: space-between; gap: 1rem; align-items: end; }
.grid-kicker { margin: 0 0 0.3rem; font-size: 0.76rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-accent-strong); }
.grid-title { margin: 0; font-family: var(--font-display); font-size: 1.6rem; color: var(--color-ink); }
.grid-count,.grid-loading { color: var(--color-muted); font-size: 0.92rem; }
.grid-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.empty-state { padding: 1.4rem; border-radius: 26px; background: rgba(255, 252, 247, 0.82); border: 1px dashed rgba(122, 93, 70, 0.2); }
.empty-state h3,.empty-state p { margin: 0; }
.empty-state h3 { font-family: var(--font-display); margin-bottom: 0.6rem; }
.empty-state p:last-child { color: var(--color-muted); line-height: 1.7; }
.grid-pagination { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.page-button { min-height: 42px; padding: 0 0.95rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); }
.page-button:disabled { opacity: 0.48; cursor: not-allowed; }
@media (max-width: 940px) { .grid-list { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .grid-header { flex-direction: column; align-items: start; } }
</style>
