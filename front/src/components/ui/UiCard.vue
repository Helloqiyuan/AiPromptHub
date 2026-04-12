<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 是否展示悬停微抬升（列表卡片） */
    interactive?: boolean;
    /** 内边距尺寸 */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    as?: string;
  }>(),
  {
    interactive: false,
    padding: 'md',
    as: 'div',
  },
);

const paddingClass = computed(() => {
  const map = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  };
  return map[props.padding];
});

const interactiveClass = computed(() =>
  props.interactive
    ? 'transition-[transform,box-shadow,border-color] duration-[var(--aph-duration-fast)] ease-[var(--aph-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--aph-shadow-elevated)] hover:border-[color-mix(in_oklab,var(--aph-primary)_35%,var(--aph-border))] focus-within:-translate-y-0.5 focus-within:shadow-[var(--aph-shadow-md)] focus-within:border-[color-mix(in_oklab,var(--aph-primary)_35%,var(--aph-border))]'
    : '',
);
</script>

<template>
  <component
    :is="as"
    class="rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] shadow-[var(--aph-shadow-sm)]"
    :class="[paddingClass, interactiveClass]"
  >
    <slot />
  </component>
</template>
