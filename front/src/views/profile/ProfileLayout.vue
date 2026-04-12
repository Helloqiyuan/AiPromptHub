<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

const links = [
  { name: 'me-profile' as const, label: '资料' },
  { name: 'me-prompts' as const, label: '我的发布' },
  { name: 'me-favorites' as const, label: '我的收藏' },
  { name: 'me-comments' as const, label: '我的评论' },
];
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
    <!-- 小屏横向滚动，避免导航换行挤爆 -->
    <nav
      class="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:block lg:overflow-visible lg:rounded-[var(--aph-radius-xl)] lg:border lg:border-[var(--aph-border)] lg:bg-[var(--aph-surface)] lg:p-2 lg:shadow-[var(--aph-shadow-sm)] lg:sticky lg:top-20 lg:self-start"
      aria-label="个人中心"
    >
      <ul class="flex min-w-0 list-none gap-1 p-0 lg:flex-col lg:gap-1">
        <li v-for="l in links" :key="l.name" class="shrink-0 lg:w-full">
          <RouterLink
            :to="{ name: l.name }"
            class="block min-h-11 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium text-[var(--aph-text-muted)] transition-[background-color,color,transform] duration-[var(--aph-duration-fast)] hover:bg-[var(--aph-surface-muted)] hover:text-[var(--aph-text)] active:scale-[0.98] lg:rounded-[var(--aph-radius-md)]"
            active-class="!bg-[var(--aph-primary-soft)] !text-[var(--aph-primary)] shadow-[var(--aph-shadow-sm)]"
          >
            {{ l.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
    <div class="min-w-0">
      <RouterView />
    </div>
  </div>
</template>
