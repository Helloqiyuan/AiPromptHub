<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import * as userApi from '@/api/users';
import PaginationBar from '@/components/PaginationBar.vue';
import UiPageHeader from '@/components/ui/UiPageHeader.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import { useToast } from '@/composables/useToast';
import { errorMessage } from '@/utils/error';
import type { MyCommentRow } from '@/types/models';

const { showToast } = useToast();

const loading = ref(false);
const list = ref<MyCommentRow[]>([]);
const page = ref(1);
const pagination = ref({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await userApi.getMyComments({ page: page.value, pageSize: 10 });
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
    <UiPageHeader title="我的评论" description="你在各 Prompt 下发表的评论记录。" />
    <UiSkeleton v-if="loading" :lines="4" />
    <ul v-else-if="list.length" class="mt-2 list-none space-y-3 p-0">
      <li
        v-for="(c, idx) in list"
        :key="c.id"
        class="rounded-[var(--aph-radius-xl)] border border-[var(--aph-border)] bg-[var(--aph-surface)] p-4 shadow-[var(--aph-shadow-sm)] transition-shadow duration-[var(--aph-duration-fast)] hover:shadow-[var(--aph-shadow-md)]"
        :class="idx < 8 ? 'list-stagger-item' : ''"
      >
        <p class="whitespace-pre-wrap text-sm leading-relaxed text-[var(--aph-text)]">{{ c.content }}</p>
        <div class="mt-2 flex flex-wrap gap-2 text-xs text-[var(--aph-text-subtle)]">
          <time v-if="c.createTime">{{ c.createTime }}</time>
          <RouterLink
            v-if="c.prompt"
            :to="{ name: 'prompt-detail', params: { id: c.prompt.id } }"
            class="font-medium text-[var(--aph-primary)] underline-offset-2 hover:underline"
          >
            《{{ c.prompt.title }}》
          </RouterLink>
        </div>
      </li>
    </ul>
    <p v-else class="mt-4 rounded-[var(--aph-radius-xl)] border border-dashed border-[var(--aph-border-strong)] bg-[var(--aph-surface)]/60 p-8 text-center text-[var(--aph-text-muted)]">
      暂无评论记录。
    </p>
    <PaginationBar v-if="pagination.total > 0" :pagination="pagination" :loading="loading" @change="onPageChange" />
  </div>
</template>
