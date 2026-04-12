import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/** 应用路由与权限元信息 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录', guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: '注册', guestOnly: true },
    },
    {
      path: '/prompts/new',
      name: 'prompt-new',
      component: () => import('@/views/PromptFormView.vue'),
      meta: { title: '发布 Prompt', requiresAuth: true },
    },
    {
      path: '/prompts/:id/edit',
      name: 'prompt-edit',
      component: () => import('@/views/PromptFormView.vue'),
      meta: { title: '编辑 Prompt', requiresAuth: true },
    },
    {
      path: '/prompts/:id',
      name: 'prompt-detail',
      component: () => import('@/views/PromptDetailView.vue'),
      meta: { title: 'Prompt 详情' },
    },
    {
      path: '/me',
      component: () => import('@/views/profile/ProfileLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'me-profile',
          component: () => import('@/views/profile/ProfileInfoView.vue'),
          meta: { title: '个人中心' },
        },
        {
          path: 'prompts',
          name: 'me-prompts',
          component: () => import('@/views/profile/MyPromptsView.vue'),
          meta: { title: '我的发布' },
        },
        {
          path: 'favorites',
          name: 'me-favorites',
          component: () => import('@/views/profile/MyFavoritesView.vue'),
          meta: { title: '我的收藏' },
        },
        {
          path: 'comments',
          name: 'me-comments',
          component: () => import('@/views/profile/MyCommentsView.vue'),
          meta: { title: '我的评论' },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', redirect: { name: 'admin-stats' } },
        {
          path: 'stats',
          name: 'admin-stats',
          component: () => import('@/views/admin/AdminStatsView.vue'),
          meta: { title: '管理概览' },
        },
        {
          path: 'prompts',
          name: 'admin-prompts',
          component: () => import('@/views/admin/AdminPromptsView.vue'),
          meta: { title: 'Prompt 审核' },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUsersView.vue'),
          meta: { title: '用户管理' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  const title = (to.meta.title as string) || 'AI Prompt Hub';
  document.title = `${title} · AI Prompt Hub`;

  const needsAuth = to.matched.some((r) => r.meta.requiresAuth);
  const needsAdmin = to.matched.some((r) => r.meta.requiresAdmin);
  const guestOnly = to.matched.some((r) => r.meta.guestOnly);

  if (guestOnly && auth.token) {
    return next({ name: 'home' });
  }

  if (needsAuth && !auth.token) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (needsAuth && auth.token && !auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      auth.logout();
      return next({ name: 'login', query: { redirect: to.fullPath } });
    }
  }

  if (needsAdmin && !auth.isAdmin) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
