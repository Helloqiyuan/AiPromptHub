<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue';

import type { CategoryItem, PromptFormPayload, PromptItem, TagItem } from '@/shared/types/domain';

const props = defineProps<{
  visible: boolean;
  submitting: boolean;
  errorMessage: string;
  categories: CategoryItem[];
  tags: TagItem[];
  initialPrompt: PromptItem | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: PromptFormPayload];
}>();

const form = reactive<PromptFormPayload>({
  title: '',
  summary: '',
  image: '',
  content: '',
  usageScenario: '',
  exampleInput: '',
  exampleOutput: '',
  categoryId: null,
  tagIds: [],
});

const selectedSecondCategoryId = shallowRef<number | null>(null);

const rootCategory = computed(() => props.categories.find((item) => item.parentId === -1) ?? null);
const secondCategories = computed(() => {
  const rootId = rootCategory.value?.id ?? 1;
  return props.categories.filter((item) => item.parentId === rootId);
});
const thirdCategories = computed(() => {
  if (!selectedSecondCategoryId.value) {
    return [] as CategoryItem[];
  }
  return props.categories.filter((item) => item.parentId === selectedSecondCategoryId.value);
});

function syncForm(prompt: PromptItem | null) {
  form.title = prompt?.title ?? '';
  form.summary = prompt?.summary ?? '';
  form.image = prompt?.image ?? '';
  form.content = prompt?.content ?? '';
  form.usageScenario = prompt?.usageScenario ?? '';
  form.exampleInput = prompt?.exampleInput ?? '';
  form.exampleOutput = prompt?.exampleOutput ?? '';
  form.tagIds = prompt?.tags.map((tag) => tag.id) ?? [];

  const category = prompt ? props.categories.find((item) => item.id === prompt.categoryId) ?? null : null;
  if (category && secondCategories.value.some((item) => item.id === category.parentId)) {
    selectedSecondCategoryId.value = category.parentId;
    form.categoryId = category.id;
  } else if (category) {
    selectedSecondCategoryId.value = category.id;
    form.categoryId = category.id;
  } else {
    selectedSecondCategoryId.value = secondCategories.value[0]?.id ?? null;
    form.categoryId = thirdCategories.value[0]?.id ?? selectedSecondCategoryId.value ?? null;
  }
}

watch(
  () => [props.visible, props.initialPrompt, props.categories] as const,
  ([visible]) => {
    if (visible) {
      syncForm(props.initialPrompt);
    }
  },
  { immediate: true },
);

watch(selectedSecondCategoryId, (secondId) => {
  if (!secondId) {
    form.categoryId = null;
    return;
  }

  const hasCurrentThird = thirdCategories.value.some((item) => item.id === form.categoryId);
  if (!hasCurrentThird) {
    form.categoryId = thirdCategories.value[0]?.id ?? secondId;
  }
});

function toggleTag(tagId: number) {
  const exists = form.tagIds.includes(tagId);
  form.tagIds = exists ? form.tagIds.filter((item) => item !== tagId) : [...form.tagIds, tagId];
}
</script>

<template>
  <div v-if="visible" class="editor-overlay" @click.self="emit('close')">
    <section class="editor-card">
      <div class="editor-header">
        <div>
          <p class="editor-kicker">Prompt 编辑器</p>
          <h2 class="editor-title">{{ initialPrompt ? '编辑 Prompt' : '新建 Prompt' }}</h2>
        </div>
        <button class="editor-close" type="button" @click="emit('close')">关闭</button>
      </div>

      <p v-if="errorMessage" class="editor-error">{{ errorMessage }}</p>

      <form class="editor-form" @submit.prevent="emit('save', { ...form, tagIds: [...form.tagIds] })">
        <div class="editor-grid two-column">
          <label class="editor-field column-full">
            <span>标题</span>
            <input v-model="form.title" placeholder="请输入 Prompt 标题" />
          </label>
          <label class="editor-field column-full">
            <span>摘要</span>
            <input v-model="form.summary" placeholder="一句话说明这个 Prompt 解决什么问题" />
          </label>
          <label class="editor-field column-full">
            <span>封面图</span>
            <input v-model="form.image" placeholder="可选，输入图片 URL" />
          </label>
          <label class="editor-field">
            <span>二级分类</span>
            <select v-model="selectedSecondCategoryId">
              <option :value="null">请选择二级分类</option>
              <option v-for="category in secondCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </label>
          <label class="editor-field">
            <span>三级分类 / 模型</span>
            <select v-model="form.categoryId">
              <option v-for="category in thirdCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </label>
          <label class="editor-field column-full">
            <span>适用场景</span>
            <input v-model="form.usageScenario" placeholder="如：周报、品牌视觉、代码重构" />
          </label>
          <label class="editor-field column-full">
            <span>Prompt 内容</span>
            <textarea v-model="form.content" rows="7" placeholder="请输入完整 Prompt 内容" />
          </label>
          <label class="editor-field">
            <span>示例输入</span>
            <textarea v-model="form.exampleInput" rows="4" placeholder="请输入示例输入" />
          </label>
          <label class="editor-field">
            <span>示例输出</span>
            <textarea v-model="form.exampleOutput" rows="4" placeholder="请输入示例输出" />
          </label>
        </div>

        <section class="editor-tags">
          <p class="editor-kicker">标签选择</p>
          <div class="editor-tag-list">
            <button
              v-for="tag in tags"
              :key="tag.id"
              type="button"
              class="editor-tag"
              :class="{ 'editor-tag-active': form.tagIds.includes(tag.id) }"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </button>
          </div>
        </section>

        <button class="editor-submit" type="submit" :disabled="submitting">
          {{ submitting ? '提交中...' : initialPrompt ? '保存修改' : '发布 Prompt' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.editor-overlay { position: fixed; inset: 0; display: grid; place-items: center; padding: 1rem; background: rgba(58, 40, 27, 0.34); backdrop-filter: blur(12px); z-index: 50; }
.editor-card { width: min(980px, 100%); display: grid; gap: 1rem; max-height: calc(100vh - 32px); overflow: auto; padding: 1.4rem; border-radius: 28px; background: rgba(255, 250, 243, 0.98); border: 1px solid rgba(122, 93, 70, 0.14); }
.editor-header { display: flex; justify-content: space-between; gap: 0.75rem; align-items: center; }
.editor-kicker { margin: 0 0 0.35rem; font-size: 0.76rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-accent-strong); }
.editor-title { margin: 0; font-family: var(--font-display); color: var(--color-ink); }
.editor-close,.editor-submit,.editor-tag { min-height: 42px; border-radius: 999px; }
.editor-close { padding: 0 0.9rem; border: 1px solid rgba(122, 93, 70, 0.14); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); }
.editor-error { margin: 0; padding: 0.8rem 1rem; border-radius: 18px; background: rgba(182, 79, 47, 0.12); color: #8f4022; }
.editor-form,.editor-grid { display: grid; gap: 0.9rem; }
.two-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.column-full { grid-column: 1 / -1; }
.editor-field { display: grid; gap: 0.45rem; }
.editor-field span { color: var(--color-ink); font-size: 0.92rem; }
.editor-field input,.editor-field select,.editor-field textarea { width: 100%; padding: 0.95rem 1rem; border-radius: 18px; border: 1px solid rgba(122, 93, 70, 0.14); background: rgba(255, 255, 255, 0.7); color: var(--color-ink); }
.editor-tags { display: grid; gap: 0.8rem; }
.editor-tag-list { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.editor-tag { padding: 0 0.95rem; border: 1px solid rgba(122, 93, 70, 0.14); background: rgba(255, 255, 255, 0.72); color: var(--color-ink); }
.editor-tag-active,.editor-submit { border-color: transparent; background: var(--color-accent); color: #fffaf2; }
.editor-submit { border: none; }
@media (max-width: 760px) { .two-column { grid-template-columns: 1fr; } .editor-header { align-items: start; } }
</style>
