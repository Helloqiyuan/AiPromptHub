<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 行数（竖条骨架） */
    lines?: number;
    /** 外层额外 class */
    extraClass?: string;
  }>(),
  {
    lines: 3,
    extraClass: '',
  },
);
</script>

<template>
  <div
    class="animate-pulse space-y-3 rounded-[var(--aph-radius-lg)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-4"
    :class="extraClass"
    role="status"
    aria-label="加载中"
  >
    <div class="h-4 w-1/3 rounded bg-[var(--aph-border)]" />
    <div
      v-for="n in lines"
      :key="n"
      class="h-3 rounded bg-[var(--aph-surface-muted)]"
      :class="n === lines ? 'w-2/3' : 'w-full'"
    />
  </div>
</template>
