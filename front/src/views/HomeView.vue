<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import * as catalogApi from '@/api/catalog';
import * as promptsApi from '@/api/prompts';
import PromptCard from '@/components/PromptCard.vue';
import PaginationBar from '@/components/PaginationBar.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { AiModel, Category, Prompt, Tag } from '@/types/models';
import { Sparkles } from 'lucide-vue-next';

const auth = useAuthStore();
const { showToast } = useToast();

const loading = ref(false);
const prompts = ref<Prompt[]>([]);
const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);
const models = ref<AiModel[]>([]);

const filters = reactive({
  keyword: '',
  categoryId: '' as string,
  tagId: '' as string,
  modelId: '' as string,
  mine: false,
  page: 1,
  pageSize: 10,
});

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
});

async function loadCatalog(): Promise<void> {
  try {
    const [c, t, m] = await Promise.all([
      catalogApi.listCategories(),
      catalogApi.listTags(),
      catalogApi.listModels(),
    ]);
    categories.value = c;
    tags.value = t;
    models.value = m;
  } catch (e) {
    showToast(errorMessage(e));
  }
}

async function loadPrompts(): Promise<void> {
  loading.value = true;
  try {
    const res = await promptsApi.listPrompts({
      page: filters.page,
      pageSize: filters.pageSize,
      keyword: filters.keyword || undefined,
      categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
      tagId: filters.tagId ? Number(filters.tagId) : undefined,
      modelId: filters.modelId ? Number(filters.modelId) : undefined,
      mine: auth.isAuthenticated && filters.mine ? true : undefined,
    });
    prompts.value = res.list;
    pagination.value = res.pagination;
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    loading.value = false;
  }
}

function onSearch(): void {
  filters.page = 1;
  loadPrompts();
}

function onPageChange(p: number): void {
  filters.page = p;
  loadPrompts();
}

/** 列表前 8 条启用 stagger 入场（减弱动效下由全局 CSS 缩短） */
function staggerClass(index: number): string {
  return index < 8 ? 'list-stagger-item' : '';
}

onMounted(async () => {
  await loadCatalog();
  await loadPrompts();
});

watch(
  () => auth.isAuthenticated,
  () => {
    if (!auth.isAuthenticated) filters.mine = false;
  },
);
</script>

<template>
  <div>
    <!-- Hero：视觉锚点 + 文案层级 -->
    <section
      class="relative overflow-hidden rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[color-mix(in_oklab,var(--aph-surface)_92%,transparent)] px-5 py-8 shadow-[var(--aph-shadow-md)] sm:px-8 sm:py-10"
    >
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--aph-primary-soft)] blur-3xl opacity-90"
        aria-hidden="true"
      />
      <div class="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--aph-radius-lg)] bg-[var(--aph-primary-soft)] text-[var(--aph-primary)]"
          >
            <Sparkles class="h-6 w-6" aria-hidden="true" />
          </span>
          <div class="min-w-0">
            <h1 class="text-2xl font-bold tracking-tight text-[var(--aph-text)] sm:text-3xl">探索 Prompt</h1>
            <p class="mt-2 max-w-2xl text-base leading-relaxed text-[var(--aph-text-muted)]">
              搜索、筛选并发现社区发布的 AI 提示词。支持分类、标签与适用模型过滤。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 筛选区 -->
    <UiCard class="mt-6" padding="md" aria-label="筛选条件">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="sm:col-span-2">
          <label for="kw" class="aph-label">关键词</label>
          <div class="mt-1.5 flex gap-2">
            <input
              id="kw"
              v-model="filters.keyword"
              type="search"
              class="aph-input min-w-0 flex-1"
              placeholder="标题或正文"
              @keyup.enter="onSearch"
            />
            <UiButton type="button" class="shrink-0" @click="onSearch">搜索</UiButton>
          </div>
        </div>
        <div>
          <label for="cat" class="aph-label">分类</label>
          <select id="cat" v-model="filters.categoryId" class="aph-select mt-1.5" @change="onSearch">
            <option value="">全部</option>
            <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label for="tag" class="aph-label">标签</label>
          <select id="tag" v-model="filters.tagId" class="aph-select mt-1.5" @change="onSearch">
            <option value="">全部</option>
            <option v-for="t in tags" :key="t.id" :value="String(t.id)">{{ t.name }}</option>
          </select>
        </div>
        <div>
          <label for="model" class="aph-label">模型</label>
          <select id="model" v-model="filters.modelId" class="aph-select mt-1.5" @change="onSearch">
            <option value="">全部</option>
            <option v-for="m in models" :key="m.id" :value="String(m.id)">{{ m.name }}</option>
          </select>
        </div>
        <div v-if="auth.isAuthenticated" class="flex items-end">
          <label
            class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--aph-radius-md)] text-sm text-[var(--aph-text-muted)] transition-colors hover:text-[var(--aph-text)]"
          >
            <input
              v-model="filters.mine"
              type="checkbox"
              class="h-4 w-4 rounded border-[var(--aph-border)] text-[var(--aph-primary)] focus:ring-[var(--aph-primary)]"
              @change="onSearch"
            />
            仅看我的
          </label>
        </div>
      </div>
    </UiCard>

    <UiSkeleton v-if="loading" class="mt-8" :lines="4" />

    <div
      v-else-if="!prompts.length"
      class="mt-8 rounded-[var(--aph-radius-xl)] border border-dashed border-[var(--aph-border-strong)] bg-[var(--aph-surface)]/80 p-10 text-center text-[var(--aph-text-muted)]"
      role="status"
    >
      暂无数据，试试调整筛选条件。
    </div>
    <ul v-else class="mt-8 grid list-none gap-4 p-0">
      <li
        v-for="(p, idx) in prompts"
        :key="p.id"
        :class="staggerClass(idx)"
      >
        <PromptCard :prompt="p" />
      </li>
    </ul>

    <PaginationBar v-if="pagination.total > 0" :pagination="pagination" :loading="loading" @change="onPageChange" />
  </div>
</template>
