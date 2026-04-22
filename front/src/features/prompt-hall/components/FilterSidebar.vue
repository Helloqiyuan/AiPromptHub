<script setup lang="ts">
import type { CategoryItem, TagItem } from '@/shared/types/domain';

defineProps<{
  secondCategories: CategoryItem[];
  thirdCategories: CategoryItem[];
  tags: TagItem[];
  selectedSecondCategoryId: number | null;
  selectedThirdCategoryId: number | null;
  selectedTagId: number | null;
}>();

const emit = defineEmits<{
  selectSecond: [categoryId: number | null];
  selectThird: [categoryId: number | null];
  selectTag: [tagId: number | null];
}>();
</script>

<template>
  <aside class="filter-shell">
    <section class="filter-section">
      <div class="filter-header">
        <p class="filter-eyebrow">二级分类</p>
        <h2 class="filter-title">Prompt 大厅导航</h2>
      </div>
      <div class="chip-wrap">
        <button type="button" class="chip" :class="{ 'chip-active': selectedSecondCategoryId === null }" @click="emit('selectSecond', null)">全部方向</button>
        <button
          v-for="category in secondCategories"
          :key="category.id"
          type="button"
          class="chip"
          :class="{ 'chip-active': selectedSecondCategoryId === category.id }"
          @click="emit('selectSecond', category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </section>

    <section class="filter-section">
      <div class="filter-header inline-header">
        <p class="filter-eyebrow">三级分类</p>
        <span class="filter-hint">只显示当前二级分类所属模型</span>
      </div>
      <div class="chip-wrap">
        <button type="button" class="chip chip-soft" :class="{ 'chip-active': selectedThirdCategoryId === null }" @click="emit('selectThird', null)">不限模型</button>
        <button
          v-for="category in thirdCategories"
          :key="category.id"
          type="button"
          class="chip chip-soft"
          :class="{ 'chip-active': selectedThirdCategoryId === category.id }"
          @click="emit('selectThird', category.id)"
        >
          {{ category.name }}
        </button>
      </div>
    </section>

    <section class="filter-section">
      <div class="filter-header inline-header">
        <p class="filter-eyebrow">标签筛选</p>
        <span class="filter-hint">支持后端 `tagId` 查询</span>
      </div>
      <div class="chip-wrap">
        <button type="button" class="chip chip-tag" :class="{ 'chip-active': selectedTagId === null }" @click="emit('selectTag', null)">全部标签</button>
        <button
          v-for="tag in tags"
          :key="tag.id"
          type="button"
          class="chip chip-tag"
          :class="{ 'chip-active': selectedTagId === tag.id }"
          @click="emit('selectTag', tag.id)"
        >
          {{ tag.name }}
        </button>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.filter-shell { display: grid; gap: 1rem; }
.filter-section { padding: 1.1rem; border-radius: 24px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 251, 245, 0.84); }
.filter-header { display: grid; gap: 0.3rem; margin-bottom: 0.9rem; }
.inline-header { grid-template-columns: 1fr; }
.filter-eyebrow { margin: 0; font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-accent-strong); }
.filter-title { margin: 0; font-family: var(--font-display); font-size: 1.35rem; color: var(--color-ink); }
.filter-hint { color: var(--color-muted); font-size: 0.88rem; }
.chip-wrap { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.chip { min-height: 42px; padding: 0 0.95rem; border: 1px solid rgba(122, 93, 70, 0.12); border-radius: 999px; background: rgba(245, 234, 220, 0.6); color: var(--color-ink); font-size: 0.92rem; }
.chip-soft { background: rgba(255, 255, 255, 0.72); }
.chip-tag { background: rgba(214, 188, 158, 0.14); }
.chip-active { border-color: transparent; background: var(--color-accent); color: #fffaf2; box-shadow: 0 10px 24px rgba(121, 84, 52, 0.18); }
</style>
