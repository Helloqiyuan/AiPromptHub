<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Heart, MessageCircle, Star } from 'lucide-vue-next';
import UiCard from '@/components/ui/UiCard.vue';
import UiTag from '@/components/ui/UiTag.vue';
import type { Prompt } from '@/types/models';

defineProps<{
  prompt: Prompt;
}>();
</script>

<template>
  <UiCard interactive padding="md" as="article">
    <RouterLink
      :to="{ name: 'prompt-detail', params: { id: prompt.id } }"
      class="block rounded-[var(--aph-radius-lg)] outline-none ring-offset-2 ring-offset-[var(--aph-surface)] focus-visible:ring-2 focus-visible:ring-[var(--aph-primary)]"
    >
      <h2 class="text-lg font-semibold leading-snug tracking-tight text-[var(--aph-text)] line-clamp-2">
        {{ prompt.title }}
      </h2>
      <p
        v-if="prompt.summary"
        class="mt-2 text-sm leading-relaxed text-[var(--aph-text-muted)] line-clamp-2"
      >
        {{ prompt.summary }}
      </p>
      <div v-if="(prompt.tags || []).length" class="mt-3 flex flex-wrap gap-2">
        <UiTag v-for="t in prompt.tags" :key="t.id" small>
          {{ t.name }}
        </UiTag>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--aph-text-subtle)]">
        <span v-if="prompt.author" class="font-medium text-[var(--aph-text-muted)]">
          {{ prompt.author.username }}
        </span>
        <span class="inline-flex items-center gap-1">
          <Heart class="h-3.5 w-3.5" aria-hidden="true" />
          {{ prompt.likeCount }}
        </span>
        <span class="inline-flex items-center gap-1">
          <Star class="h-3.5 w-3.5" aria-hidden="true" />
          {{ prompt.favoriteCount }}
        </span>
        <span class="inline-flex items-center gap-1">
          <MessageCircle class="h-3.5 w-3.5" aria-hidden="true" />
          {{ prompt.commentCount }}
        </span>
      </div>
    </RouterLink>
  </UiCard>
</template>
