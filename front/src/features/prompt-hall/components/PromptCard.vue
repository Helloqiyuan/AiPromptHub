<script setup lang="ts">
import type { PromptItem } from '@/shared/types/domain';

defineProps<{
  prompt: PromptItem;
  selected: boolean;
  secondCategoryName: string;
  thirdCategoryName: string;
}>();

const emit = defineEmits<{
  select: [promptId: number];
  toggleLike: [promptId: number];
  toggleFavorite: [promptId: number];
}>();
</script>

<template>
  <article class="card-shell" :class="{ 'card-selected': selected }" @click="emit('select', prompt.id)">
    <div class="card-media">
      <img class="card-image" :src="prompt.image || 'https://picsum.photos/seed/fallback-prompt/900/680'" :alt="prompt.title" />
      <div class="card-badges">
        <span>{{ secondCategoryName }}</span>
        <span>{{ thirdCategoryName }}</span>
      </div>
    </div>

    <div class="card-body">
      <div class="card-copy">
        <h3 class="card-title">{{ prompt.title }}</h3>
        <p class="card-summary">{{ prompt.summary || '这个 Prompt 暂无摘要，点击查看完整内容。' }}</p>
      </div>

      <div class="card-tags">
        <span v-for="tag in prompt.tags" :key="tag.id">{{ tag.name }}</span>
      </div>

      <div class="card-footer">
        <button class="metric-button" type="button" @click.stop="emit('toggleLike', prompt.id)">
          {{ prompt.liked ? '已赞' : '点赞' }} {{ prompt.likeCount }}
        </button>
        <button class="metric-button" type="button" @click.stop="emit('toggleFavorite', prompt.id)">
          {{ prompt.favorited ? '已藏' : '收藏' }} {{ prompt.favoriteCount }}
        </button>
        <span class="card-comments">评论 {{ prompt.commentCount }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card-shell { display: grid; gap: 1rem; padding: 1rem; border-radius: 26px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 252, 247, 0.86); box-shadow: 0 16px 36px rgba(96, 68, 48, 0.08); cursor: pointer; transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
.card-shell:hover { transform: translateY(-2px); box-shadow: 0 20px 42px rgba(96, 68, 48, 0.12); }
.card-selected { border-color: rgba(160, 117, 79, 0.46); box-shadow: 0 24px 48px rgba(135, 99, 69, 0.14); }
.card-media { position: relative; overflow: hidden; border-radius: 22px; aspect-ratio: 1.35; }
.card-image { width: 100%; height: 100%; object-fit: cover; }
.card-badges { position: absolute; inset: auto 0.8rem 0.8rem 0.8rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.card-badges span,.card-tags span { padding: 0.34rem 0.65rem; border-radius: 999px; background: rgba(255, 249, 240, 0.88); color: var(--color-ink); font-size: 0.82rem; }
.card-body,.card-copy { display: grid; gap: 0.8rem; }
.card-title { margin: 0; font-family: var(--font-display); font-size: 1.4rem; line-height: 1.12; color: var(--color-ink); }
.card-summary { margin: 0; line-height: 1.7; color: var(--color-muted); }
.card-tags,.card-footer { display: flex; flex-wrap: wrap; gap: 0.7rem; align-items: center; }
.card-tags span { background: rgba(214, 188, 158, 0.16); color: var(--color-accent-strong); }
.metric-button,.card-comments { min-height: 40px; padding: 0 0.9rem; border-radius: 999px; border: 1px solid rgba(122, 93, 70, 0.12); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); font-size: 0.88rem; }
.card-comments { display: inline-flex; align-items: center; }
</style>
