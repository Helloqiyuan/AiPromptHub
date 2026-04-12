<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as userApi from '@/api/users';
import PromptCard from '@/components/PromptCard.vue';
import PaginationBar from '@/components/PaginationBar.vue';
import UiPageHeader from '@/components/ui/UiPageHeader.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { Prompt } from '@/types/models';

const { showToast } = useToast();

const loading = ref(false);
const list = ref<Prompt[]>([]);
const page = ref(1);
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await userApi.getMyFavorites({ page: page.value, pageSize: 10 });
    list.value = res.list;
    pagination.value = res.pagination;
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number): void {
  page.value = p;
  load();
}

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <UiPageHeader title="我的收藏" description="你标记为收藏的已发布 Prompt。" />
    <UiSkeleton v-if="loading" :lines="4" />
    <ul v-else-if="list.length" class="mt-2 grid list-none gap-4 p-0">
      <li v-for="(p, idx) in list" :key="p.id" :class="idx < 8 ? 'list-stagger-item' : ''">
        <PromptCard :prompt="p" />
      </li>
    </ul>
    <p v-else class="mt-4 rounded-[var(--aph-radius-xl)] border border-dashed border-[var(--aph-border-strong)] bg-[var(--aph-surface)]/60 p-8 text-center text-[var(--aph-text-muted)]">
      暂无收藏。
    </p>
    <PaginationBar v-if="pagination.total > 0" :pagination="pagination" :loading="loading" @change="onPageChange" />
  </div>
</template>
