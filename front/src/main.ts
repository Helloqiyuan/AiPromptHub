import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from '@/stores/auth';
import './styles/main.css';

// 应用入口：挂载 Pinia 与 Vue Router；若本地有 token 则预拉用户信息（顶栏与权限）
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
const auth = useAuthStore();
if (auth.token) {
  auth.fetchMe().catch(() => auth.logout());
}
app.use(router);
app.mount('#app');
