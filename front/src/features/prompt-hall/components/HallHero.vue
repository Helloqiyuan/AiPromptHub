<script setup lang="ts">
import { RouterLink } from 'vue-router';

const model = defineModel<string>({ required: true });

interface MetricItem {
  label: string;
  value: string;
}

interface SpotlightItem {
  title: string;
  summary: string;
  categoryName: string;
  tagNames: string[];
}

defineProps<{
  metrics: MetricItem[];
  spotlight: SpotlightItem | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userName?: string | null;
}>();

const emit = defineEmits<{
  openAuth: [tab: 'login' | 'register'];
}>();
</script>

<template>
  <section class="hero-shell">
    <div class="hero-copy">
      <p class="hero-kicker">AI Prompt Hub</p>
      <h1 class="hero-title">米色调 Prompt 大厅，用筛选和内容密度让好 Prompt 一眼可见。</h1>
      <p class="hero-description">
        首页围绕 Prompt 浏览效率来组织：先筛二级分类，再看所属三级分类，最后按标签锁定具体场景。
      </p>

      <label class="hero-search">
        <span class="hero-search-label">检索 Prompt</span>
        <input
          v-model="model"
          class="hero-search-input"
          type="text"
          placeholder="试试搜索：周报、竞品、代码 Agent、品牌 KV"
        />
      </label>

      <div v-if="isAuthenticated" class="hero-member-card">
        <strong>{{ userName || '欢迎回来' }}</strong>
        <span>你的收藏、评论和个人 Prompt 已同步，可继续浏览或进入个人中心管理。</span>
      </div>

      <div class="hero-actions">
        <template v-if="isAuthenticated">
          <RouterLink class="hero-primary hero-link" to="/profile">进入个人中心</RouterLink>
          <RouterLink v-if="isAdmin" class="hero-secondary hero-link" to="/admin">查看管理台</RouterLink>
          <span v-else class="hero-secondary hero-tip">登录状态下可直接点赞、收藏和评论。</span>
        </template>
        <template v-else>
          <button class="hero-primary" type="button" @click="emit('openAuth', 'register')">创建账号</button>
          <button class="hero-secondary" type="button" @click="emit('openAuth', 'login')">已有账号，立即登录</button>
        </template>
      </div>
    </div>

    <div class="hero-panel">
      <div class="metric-grid">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card">
          <span class="metric-label">{{ metric.label }}</span>
          <strong class="metric-value">{{ metric.value }}</strong>
        </article>
      </div>

      <article v-if="spotlight" class="spotlight-card">
        <p class="spotlight-eyebrow">今日厅内精选</p>
        <h2 class="spotlight-title">{{ spotlight.title }}</h2>
        <p class="spotlight-summary">{{ spotlight.summary }}</p>
        <div class="spotlight-meta">
          <span>{{ spotlight.categoryName }}</span>
          <span v-for="tag in spotlight.tagNames" :key="tag">{{ tag }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.hero-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
  gap: 1.5rem;
  padding: 1.75rem;
  border: 1px solid rgba(126, 95, 71, 0.14);
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(215, 182, 147, 0.35), transparent 30%),
    linear-gradient(135deg, rgba(255, 248, 239, 0.98), rgba(248, 236, 221, 0.9));
  box-shadow: 0 20px 45px rgba(89, 62, 42, 0.08);
}

.hero-copy { display: grid; gap: 1rem; }
.hero-kicker,
.spotlight-eyebrow,
.hero-search-label {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent-strong);
}
.hero-title { margin: 0; font-family: var(--font-display); font-size: clamp(2.4rem, 4vw, 4.5rem); line-height: 0.98; color: var(--color-ink); }
.hero-description,
.spotlight-summary { margin: 0; line-height: 1.75; color: var(--color-muted); }
.hero-search { display: grid; gap: 0.6rem; padding: 1rem; border: 1px solid rgba(126, 95, 71, 0.12); border-radius: 24px; background: rgba(255, 252, 247, 0.82); }
.hero-search-input { border: none; outline: none; background: transparent; font-size: 1rem; color: var(--color-ink); }
.hero-member-card { display: grid; gap: 0.35rem; padding: 1rem 1.1rem; border-radius: 22px; background: rgba(255, 251, 245, 0.72); border: 1px solid rgba(126, 95, 71, 0.12); }
.hero-member-card strong { color: var(--color-ink); font-size: 1rem; }
.hero-member-card span { color: var(--color-muted); line-height: 1.7; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.9rem; align-items: center; }
.hero-primary,
.hero-secondary,
.hero-link { min-height: 46px; padding: 0 1.2rem; border-radius: 999px; font-size: 0.95rem; }
.hero-primary { border: none; background: var(--color-ink); color: #fff8ef; }
.hero-secondary { border: 1px solid rgba(87, 58, 39, 0.16); background: rgba(255, 252, 248, 0.88); color: var(--color-ink); }
.hero-link { display: inline-flex; align-items: center; text-decoration: none; }
.hero-tip { display: inline-flex; align-items: center; }
.hero-panel,
.metric-grid { display: grid; gap: 1rem; }
.metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.metric-card,
.spotlight-card { padding: 1.2rem; border-radius: 24px; background: rgba(255, 251, 245, 0.86); border: 1px solid rgba(126, 95, 71, 0.12); }
.metric-card { display: grid; gap: 0.45rem; }
.metric-label { color: var(--color-muted); }
.metric-value { font-family: var(--font-display); font-size: 2rem; color: var(--color-ink); }
.spotlight-card { display: grid; gap: 0.8rem; align-content: start; }
.spotlight-title { margin: 0; font-family: var(--font-display); font-size: 1.75rem; line-height: 1.15; }
.spotlight-meta { display: flex; flex-wrap: wrap; gap: 0.55rem; }
.spotlight-meta span { padding: 0.35rem 0.7rem; border-radius: 999px; background: rgba(193, 154, 115, 0.12); color: var(--color-accent-strong); font-size: 0.85rem; }
@media (max-width: 1080px) { .hero-shell { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .hero-shell { padding: 1.2rem; border-radius: 24px; } .metric-grid { grid-template-columns: 1fr 1fr; } }
</style>
