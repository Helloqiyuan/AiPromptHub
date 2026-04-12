<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as adminApi from '@/api/admin';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { AdminStats } from '@/types/models';

const { showToast } = useToast();

const loading = ref(true);
const stats = ref<AdminStats | null>(null);

const items = [
  { key: 'userCount' as const, label: '用户' },
  { key: 'adminCount' as const, label: '管理员' },
  { key: 'promptCount' as const, label: 'Prompt' },
  { key: 'commentCount' as const, label: '评论' },
  { key: 'categoryCount' as const, label: '分类' },
  { key: 'tagCount' as const, label: '标签' },
  { key: 'modelCount' as const, label: '模型' },
  { key: 'likeCount' as const, label: '点赞次数' },
  { key: 'favoriteCount' as const, label: '收藏次数' },
];

onMounted(async () => {
  try {
    stats.value = await adminApi.getAdminStats();
  } catch (e) {
    showToast(errorMessage(e));
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-[var(--aph-text)]">数据概览</h2>
    <UiSkeleton v-if="loading" class="mt-4" :lines="4" />
    <dl
      v-else-if="stats"
      class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      <div
        v-for="item in items"
        :key="item.key"
        class="list-stagger-item rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-4 shadow-[var(--aph-shadow-sm)] transition-[transform,box-shadow] duration-[var(--aph-duration-fast)] hover:-translate-y-0.5 hover:shadow-[var(--aph-shadow-md)]"
      >
        <dt class="text-xs font-medium text-[var(--aph-text-subtle)]">{{ item.label }}</dt>
        <dd class="mt-1 text-2xl font-semibold tabular-nums text-[var(--aph-text)]">
          {{ stats[item.key] }}
        </dd>
      </div>
    </dl>
  </div>
</template>
