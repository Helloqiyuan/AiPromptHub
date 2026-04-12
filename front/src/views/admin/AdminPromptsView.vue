<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import * as adminApi from '@/api/admin';
import PaginationBar from '@/components/PaginationBar.vue';
import UiButton from '@/components/ui/UiButton.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { Prompt, PromptStatus } from '@/types/models';

const { showToast } = useToast();

const loading = ref(false);
const list = ref<Prompt[]>([]);
const page = ref(1);
const keyword = ref('');
const statusFilter = ref<PromptStatus | ''>('');
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

const statusOptions: { value: PromptStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'published', label: '已发布' },
  { value: 'pending', label: '待审核' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'archived', label: '已归档' },
];

const busyId = ref<number | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await adminApi.listAdminPrompts({
      page: page.value,
      pageSize: 10,
      keyword: keyword.value || undefined,
      status: statusFilter.value || undefined,
    });
    list.value = res.list;
    pagination.value = res.pagination;
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    loading.value = false;
  }
}

async function setStatus(id: number, status: PromptStatus): Promise<void> {
  busyId.value = id;
  try {
    await adminApi.reviewPrompt(id, status);
    showToast('状态已更新');
    await load();
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    busyId.value = null;
  }
}

async function remove(id: number): Promise<void> {
  if (!confirm('确定删除该 Prompt？')) return;
  busyId.value = id;
  try {
    await adminApi.adminDeletePrompt(id);
    showToast('已删除');
    await load();
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    busyId.value = null;
  }
}

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-[var(--aph-text)]">Prompt 列表</h2>
    <div class="mt-4 flex flex-wrap items-end gap-2">
      <input
        v-model="keyword"
        type="search"
        placeholder="关键词"
        class="aph-input min-w-[200px] max-w-full flex-1 sm:max-w-xs"
        @keyup.enter="page = 1; load()"
      />
      <select v-model="statusFilter" class="aph-select min-w-[140px]" @change="page = 1; load()">
        <option v-for="o in statusOptions" :key="o.value || 'all'" :value="o.value">{{ o.label }}</option>
      </select>
      <UiButton type="button" variant="primary" @click="page = 1; load()">筛选</UiButton>
    </div>

    <UiSkeleton v-if="loading" class="mt-4" :lines="5" />
    <div
      v-else
      class="mt-4 overflow-x-auto rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] shadow-[var(--aph-shadow-sm)]"
    >
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-[var(--aph-border)] bg-[var(--aph-surface-muted)]/90">
          <tr>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">ID</th>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">标题</th>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">状态</th>
            <th class="px-4 py-3 font-semibold text-[var(--aph-text)]">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in list"
            :key="p.id"
            class="border-b border-[var(--aph-border)] transition-colors duration-[var(--aph-duration-fast)] hover:bg-[var(--aph-surface-muted)]/70"
          >
            <td class="px-4 py-3 font-mono text-xs text-[var(--aph-text-muted)]">{{ p.id }}</td>
            <td class="px-4 py-3">
              <RouterLink
                :to="{ name: 'prompt-detail', params: { id: p.id } }"
                class="font-medium text-[var(--aph-primary)] underline-offset-2 hover:underline"
              >
                {{ p.title }}
              </RouterLink>
            </td>
            <td class="px-4 py-3 text-[var(--aph-text-muted)]">{{ p.status }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="st in ['published', 'pending', 'rejected', 'archived']"
                  :key="st"
                  type="button"
                  class="rounded-[var(--aph-radius-sm)] border border-[var(--aph-border)] bg-[var(--aph-surface)] px-2 py-1 text-xs transition-colors hover:bg-[var(--aph-primary-soft)] disabled:opacity-45"
                  :disabled="busyId === p.id"
                  @click="setStatus(p.id, st as PromptStatus)"
                >
                  {{ st }}
                </button>
                <button
                  type="button"
                  class="rounded-[var(--aph-radius-sm)] border border-red-200 bg-[var(--aph-danger-soft)] px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
                  :disabled="busyId === p.id"
                  @click="remove(p.id)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationBar v-if="pagination.total > 0" :pagination="pagination" :loading="loading" @change="(p) => { page = p; load(); }" />
  </div>
</template>
