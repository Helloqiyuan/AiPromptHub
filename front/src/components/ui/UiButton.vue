<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    block?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
    block: false,
  },
);

const cls = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--aph-radius-md)] transition-[transform,background-color,border-color,color,box-shadow] duration-[var(--aph-duration-fast)] ease-[var(--aph-ease-out)] disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98]';
  const sizes: Record<string, string> = {
    sm: 'min-h-9 px-3 text-sm',
    md: 'min-h-11 px-4 text-sm',
    lg: 'min-h-12 px-6 text-base',
  };
  const variants: Record<string, string> = {
    primary:
      'bg-[var(--aph-primary)] text-white shadow-[var(--aph-shadow-sm)] hover:bg-[var(--aph-primary-hover)]',
    secondary:
      'bg-[var(--aph-surface)] text-[var(--aph-text)] border border-[var(--aph-border)] hover:bg-[var(--aph-surface-muted)]',
    ghost: 'text-[var(--aph-text-muted)] hover:bg-[var(--aph-surface-muted)] hover:text-[var(--aph-text)]',
    danger:
      'bg-[var(--aph-danger-soft)] text-[var(--aph-danger)] border border-red-200/80 hover:bg-red-100/80',
  };
  const block = props.block ? 'w-full' : '';
  return [base, sizes[props.size], variants[props.variant], block].filter(Boolean).join(' ');
});
</script>

<template>
  <button
    :type="type"
    :class="cls"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <Loader2 v-if="loading" class="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>
