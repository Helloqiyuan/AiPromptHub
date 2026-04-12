<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

const links = [
  { name: 'admin-stats' as const, label: '概览' },
  { name: 'admin-prompts' as const, label: 'Prompt 审核' },
  { name: 'admin-users' as const, label: '用户' },
];
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-[var(--aph-text)]">管理后台</h1>
    <p class="mt-1 text-sm text-[var(--aph-text-muted)]">审核内容、查看统计与管理用户权限。</p>
    <nav
      class="mt-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap"
      aria-label="管理子导航"
    >
      <RouterLink
        v-for="l in links"
        :key="l.name"
        :to="{ name: l.name }"
        class="shrink-0 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--aph-text-muted)] transition-[background-color,color,transform] duration-[var(--aph-duration-fast)] hover:bg-[var(--aph-surface-muted)] hover:text-[var(--aph-text)] active:scale-[0.98]"
        active-class="!bg-[var(--aph-text)] !text-white shadow-[var(--aph-shadow-md)] hover:!bg-[var(--aph-text)] hover:!text-white"
      >
        {{ l.label }}
      </RouterLink>
    </nav>
    <div class="mt-8">
      <RouterView />
    </div>
  </div>
</template>
