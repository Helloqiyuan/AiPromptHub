import { readonly, ref } from 'vue';

const toastMessage = ref('');
const toastVisible = ref(false);

/** 简易全局 Toast（模块级单例） */
export function useToast() {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function showToast(message: string, durationMs = 4000): void {
    toastMessage.value = message;
    toastVisible.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      toastVisible.value = false;
    }, durationMs);
  }

  return {
    toastMessage: readonly(toastMessage),
    toastVisible: readonly(toastVisible),
    showToast,
  };
}
