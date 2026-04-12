<script setup lang="ts">
defineProps<{
  /** 主标题 */
  title: string;
  /** 副标题 */
  description?: string;
}>();
</script>

<template>
  <header class="mb-6 sm:mb-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 max-w-3xl">
        <h1 class="text-2xl font-bold tracking-tight text-[var(--aph-text)] sm:text-3xl">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="mt-1.5 text-base leading-relaxed text-[var(--aph-text-muted)]"
        >
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
