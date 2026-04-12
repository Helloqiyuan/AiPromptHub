<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as catalogApi from '@/api/catalog';
import * as promptsApi from '@/api/prompts';
import UiButton from '@/components/ui/UiButton.vue';
import UiPageHeader from '@/components/ui/UiPageHeader.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { AiModel, Category, Tag } from '@/types/models';

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();

const isEdit = computed(() => route.name === 'prompt-edit');
const promptId = computed(() => (isEdit.value ? Number(route.params.id) : 0));

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);
const models = ref<AiModel[]>([]);
const loading = ref(false);
const submitting = ref(false);

const form = reactive({
  title: '',
  content: '',
  summary: '',
  usageScenario: '',
  exampleInput: '',
  exampleOutput: '',
  categoryId: '' as string,
  tagIds: [] as number[],
  modelIds: [] as number[],
});

async function loadCatalog(): Promise<void> {
  const [c, t, m] = await Promise.all([
    catalogApi.listCategories(),
    catalogApi.listTags(),
    catalogApi.listModels(),
  ]);
  categories.value = c;
  tags.value = t;
  models.value = m;
}

async function loadPrompt(): Promise<void> {
  if (!isEdit.value || !promptId.value) return;
  loading.value = true;
  try {
    const p = await promptsApi.getPrompt(promptId.value);
    form.title = p.title;
    form.content = p.content;
    form.summary = p.summary || '';
    form.usageScenario = p.usageScenario || '';
    form.exampleInput = p.exampleInput || '';
    form.exampleOutput = p.exampleOutput || '';
    form.categoryId = p.categoryId ? String(p.categoryId) : '';
    form.tagIds = (p.tags || []).map((t) => t.id);
    form.modelIds = (p.models || []).map((m) => m.id);
  } catch (e) {
    showToast(errorMessage(e));
    await router.replace({ name: 'home' });
  } finally {
    loading.value = false;
  }
}

async function onSubmit(): Promise<void> {
  submitting.value = true;
  try {
    const categoryId = form.categoryId ? Number(form.categoryId) : undefined;
    if (isEdit.value) {
      const updated = await promptsApi.updatePrompt(promptId.value, {
        title: form.title,
        content: form.content,
        summary: form.summary || undefined,
        usageScenario: form.usageScenario || undefined,
        exampleInput: form.exampleInput || undefined,
        exampleOutput: form.exampleOutput || undefined,
        categoryId,
        tagIds: form.tagIds,
        modelIds: form.modelIds,
      });
      showToast('已保存');
      await router.replace({ name: 'prompt-detail', params: { id: String(updated.id) } });
    } else {
      const created = await promptsApi.createPrompt({
        title: form.title,
        content: form.content,
        summary: form.summary || undefined,
        usageScenario: form.usageScenario || undefined,
        categoryId,
        tagIds: form.tagIds.length ? form.tagIds : undefined,
        modelIds: form.modelIds.length ? form.modelIds : undefined,
      });
      showToast('发布成功');
      await router.replace({ name: 'prompt-detail', params: { id: String(created.id) } });
    }
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    await loadCatalog();
    await loadPrompt();
  } catch (e) {
    showToast(errorMessage(e));
  }
});
</script>

<template>
  <div>
    <UiPageHeader
      :title="isEdit ? '编辑 Prompt' : '发布 Prompt'"
      description="填写标题与正文；可选摘要、场景与示例，便于他人理解与复用。"
    />

    <UiSkeleton v-if="loading" :lines="5" />

    <form v-else class="mt-2 space-y-8" @submit.prevent="onSubmit">
      <!-- 基础信息 -->
      <fieldset class="space-y-4 rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-5 shadow-[var(--aph-shadow-sm)] sm:p-6">
        <legend class="px-1 text-sm font-semibold text-[var(--aph-text)]">基础信息</legend>
        <div>
          <label for="title" class="aph-label">标题</label>
          <input id="title" v-model="form.title" required maxlength="150" class="aph-input mt-1.5" />
        </div>
        <div>
          <label for="summary" class="aph-label">摘要（可选）</label>
          <input id="summary" v-model="form.summary" maxlength="255" class="aph-input mt-1.5" />
        </div>
        <div>
          <label for="content" class="aph-label">正文</label>
          <textarea id="content" v-model="form.content" required rows="12" class="aph-textarea mt-1.5 min-h-[240px]" />
        </div>
        <div>
          <label for="usage" class="aph-label">使用场景（可选）</label>
          <input id="usage" v-model="form.usageScenario" maxlength="255" class="aph-input mt-1.5" />
        </div>
      </fieldset>

      <!-- 示例 -->
      <fieldset class="grid gap-4 sm:grid-cols-2 sm:gap-6 rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-5 shadow-[var(--aph-shadow-sm)] sm:p-6">
        <legend class="px-1 text-sm font-semibold text-[var(--aph-text)] sm:col-span-2">示例（可选）</legend>
        <div>
          <label for="exIn" class="aph-label">示例输入</label>
          <textarea id="exIn" v-model="form.exampleInput" rows="5" class="aph-textarea mt-1.5" />
        </div>
        <div>
          <label for="exOut" class="aph-label">示例输出</label>
          <textarea id="exOut" v-model="form.exampleOutput" rows="5" class="aph-textarea mt-1.5" />
        </div>
      </fieldset>

      <!-- 分类与关联 -->
      <fieldset class="space-y-4 rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-5 shadow-[var(--aph-shadow-sm)] sm:p-6">
        <legend class="px-1 text-sm font-semibold text-[var(--aph-text)]">分类与标签</legend>
        <div>
          <label for="cat" class="aph-label">分类（可选）</label>
          <select id="cat" v-model="form.categoryId" class="aph-select mt-1.5">
            <option value="">（不选则使用「文本生成」分类）</option>
            <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label for="tags" class="aph-label">标签（Ctrl / ⌘ 多选）</label>
          <select id="tags" v-model="form.tagIds" multiple class="aph-select mt-1.5 min-h-[120px]">
            <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div>
          <label for="models" class="aph-label">适用模型（Ctrl / ⌘ 多选）</label>
          <select id="models" v-model="form.modelIds" multiple class="aph-select mt-1.5 min-h-[120px]">
            <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
      </fieldset>

      <div class="flex flex-wrap gap-3">
        <UiButton type="submit" variant="primary" :loading="submitting">
          {{ submitting ? '提交中…' : '提交' }}
        </UiButton>
        <UiButton type="button" variant="secondary" @click="router.back()">取消</UiButton>
      </div>
    </form>
  </div>
</template>
