<script setup lang="ts">
defineProps<{
  /** 可选：小号标签 */
  small?: boolean;
}>();
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border border-[var(--aph-border)] bg-[var(--aph-surface-muted)] px-2.5 py-0.5 font-medium text-[var(--aph-text-muted)]"
    :class="small ? 'text-xs' : 'text-sm'"
  >
    <slot />
  </span>
</template>
