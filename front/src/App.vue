<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import { useToast } from '@/composables/useToast';

const { toastMessage, toastVisible } = useToast();
</script>

<template>
  <div id="app-root" class="min-h-dvh flex flex-col">
    <!-- 跳过导航：键盘用户直达主内容 -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-[var(--aph-radius-md)] focus:bg-[var(--aph-primary)] focus:px-4 focus:py-2 focus:text-white focus:shadow-[var(--aph-shadow-lg)]"
    >
      跳到主内容
    </a>
    <AppHeader />
    <main
      id="main-content"
      class="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8"
      tabindex="-1"
    >
      <RouterView v-slot="{ Component }">
        <Transition name="route-fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- Toast：自底部滑入（外层 flex 居中，避免 transform 与 -translate-x-1/2 冲突） -->
    <div
      class="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
    >
      <Transition name="toast-slide">
        <div
          v-show="toastVisible"
          role="status"
          aria-live="polite"
          class="max-w-[min(100vw-2rem,24rem)] rounded-[var(--aph-radius-lg)] border border-white/10 bg-[var(--aph-text)] px-4 py-3 text-sm text-white shadow-[var(--aph-shadow-elevated)]"
        >
          {{ toastMessage }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* 路由：淡入 + 自下而上进入，离开略快 */
.route-fade-slide-enter-active {
  transition:
    opacity var(--aph-duration-normal) var(--aph-ease-out),
    transform var(--aph-duration-normal) var(--aph-ease-out);
}
.route-fade-slide-leave-active {
  transition:
    opacity var(--aph-duration-fast) var(--aph-ease-in),
    transform var(--aph-duration-fast) var(--aph-ease-in);
}
.route-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.route-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Toast：自底部滑入 */
.toast-slide-enter-active {
  transition:
    opacity var(--aph-duration-normal) var(--aph-ease-out),
    transform var(--aph-duration-normal) var(--aph-ease-out);
}
.toast-slide-leave-active {
  transition:
    opacity var(--aph-duration-fast) var(--aph-ease-in),
    transform var(--aph-duration-fast) var(--aph-ease-in);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
