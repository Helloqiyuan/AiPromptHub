import { shallowRef } from 'vue';

const authDialogVisible = shallowRef(false);
const authTab = shallowRef<'login' | 'register'>('login');

function openAuthDialog(tab: 'login' | 'register') {
  authTab.value = tab;
  authDialogVisible.value = true;
}

function closeAuthDialog() {
  authDialogVisible.value = false;
}

export function useUiState() {
  return {
    authDialogVisible,
    authTab,
    closeAuthDialog,
    openAuthDialog,
  };
}
