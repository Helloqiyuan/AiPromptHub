import { Suspense } from "react";

import { CategoryPills } from "@/components/home/category-pills";
import { HomeFeedWithTagTransition } from "@/components/home/home-feed-with-tag-transition";
import { ListPagination } from "@/components/home/list-pagination";
import { PromptCard } from "@/components/prompt/prompt-card";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { GridBackground } from "@/components/ui/grid-background";
import {
  fetchCategories,
  fetchPromptList,
  fetchTags,
} from "@/lib/api";
import type { Category, PromptListData, Tag } from "@/lib/types";

type SearchParams = {
  page?: string | string[];
  keyword?: string | string[];
  categoryId?: string | string[];
  /** 选中二级分类但未选三级叶子时，筛该二级下全部 Prompt */
  parentCategoryId?: string | string[];
  tagId?: string | string[];
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

/**
 * 首页：类 Civitai 信息流 — 筛选 + 卡片栅格 + 分页
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(first(sp.page) ?? "1", 10) || 1);
  const keyword = first(sp.keyword);
  const categoryIdRaw = first(sp.categoryId);
  const parentCategoryIdRaw = first(sp.parentCategoryId);
  const tagIdRaw = first(sp.tagId);
  const categoryId = categoryIdRaw ? parseInt(categoryIdRaw, 10) : undefined;
  const parentCategoryId = parentCategoryIdRaw
    ? parseInt(parentCategoryIdRaw, 10)
    : undefined;
  const tagId = tagIdRaw ? parseInt(tagIdRaw, 10) : undefined;

  let listData: PromptListData;
  let categories: Category[];
  let tags: Tag[];
  let loadError: string | null = null;

  try {
    [listData, categories, tags] = await Promise.all([
      fetchPromptList({
        page,
        pageSize: 20,
        keyword,
        categoryId:
          categoryId !== undefined && !Number.isNaN(categoryId)
            ? categoryId
            : undefined,
        parentCategoryId:
          categoryId !== undefined && !Number.isNaN(categoryId)
            ? undefined
            : parentCategoryId !== undefined && !Number.isNaN(parentCategoryId)
              ? parentCategoryId
              : undefined,
        tagId: tagId && !Number.isNaN(tagId) ? tagId : undefined,
      }),
      fetchCategories(),
      fetchTags(),
    ]);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "加载失败";
    listData = { list: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
    categories = [];
    tags = [];
  }

  const { list, pagination } = listData;
  const activeCategoryId =
    categoryId && !Number.isNaN(categoryId) ? categoryId : null;
  const activeParentCategoryId =
    parentCategoryId && !Number.isNaN(parentCategoryId)
      ? parentCategoryId
      : null;

  const preservedQuery = {
    keyword,
    tagId: tagIdRaw,
  };

  const paginationBase: Record<string, string | undefined> = {};
  if (keyword) paginationBase.keyword = keyword;
  if (categoryIdRaw) paginationBase.categoryId = categoryIdRaw;
  if (parentCategoryIdRaw) {
    paginationBase.parentCategoryId = parentCategoryIdRaw;
  }
  if (tagIdRaw) paginationBase.tagId = tagIdRaw;

  return (
    <div className="relative min-h-[calc(100dvh-57px)]">
      <BackgroundGradient className="opacity-90" />
      <GridBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-3 pb-16 pt-8 sm:px-4">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            探索 Prompt
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            社区分享的提示词，按分类与标签浏览，支持关键词搜索。
          </p>
        </header>

        <Suspense
          fallback={
            <div className="mb-8 h-24 animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80" />
          }
        >
          <HomeFeedWithTagTransition
            tags={tags}
            categoryPills={
              <CategoryPills
                categories={categories}
                activeCategoryId={activeCategoryId}
                activeParentCategoryId={activeParentCategoryId}
                preservedQuery={preservedQuery}
              />
            }
          >
            {loadError ? (
              <div
                className="rounded-xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                无法连接后端：{loadError}。请确认已启动{" "}
                <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-900">back</code>{" "}
                服务（默认{" "}
                <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-900">127.0.0.1:3000</code>
                ）。
              </div>
            ) : null}

            {!loadError && list.length === 0 ? (
              <p className="py-16 text-center text-zinc-600 dark:text-zinc-500">
                暂无符合条件的 Prompt，试试其它关键词或筛选条件。
              </p>
            ) : null}

            {!loadError && list.length > 0 ? (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <li key={p.id} className="min-h-[380px]">
                    <PromptCard prompt={p} />
                  </li>
                ))}
              </ul>
            ) : null}
          </HomeFeedWithTagTransition>
        </Suspense>

        <ListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          query={paginationBase}
        />
      </div>
    </div>
  );
}
