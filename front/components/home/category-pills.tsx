"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { PendingLink } from "@/components/ui/pending-link";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

/** 数据里「AIGC 大类」根节点 id，其子级为二级分类（文本/图像…） */
const ROOT_CATEGORY_ID = 1;

type CategoryPillsProps = {
  categories: Category[];
  /** URL 中的 categoryId（多为三级叶子） */
  activeCategoryId: number | null;
  /** URL 中的 parentCategoryId（选中二级但未点叶子时为某二级下「全部」） */
  activeParentCategoryId: number | null;
  /** 保留 URL 中的其它查询（keyword、tagId） */
  preservedQuery: { keyword?: string; tagId?: string };
};

/**
 * 类 Civitai：第一行二级分类；选中某二级后才展示其下三级子类。
 * 无障碍：触控目标约 44px 高；横向可滚动避免小屏折行溢出。
 */
export function CategoryPills({
  categories,
  activeCategoryId,
  activeParentCategoryId,
  preservedQuery,
}: CategoryPillsProps) {
  const reduceMotion = useReducedMotion();

  const secondaryList = categories
    .filter((c) => c.parentId === ROOT_CATEGORY_ID)
    .sort((a, b) => a.sort - b.sort || a.id - b.id);

  /** 当前应高亮的二级 id：来自 URL 或从叶子反推父级 */
  const activeSecondaryId = (() => {
    if (activeParentCategoryId != null) return activeParentCategoryId;
    if (activeCategoryId == null) return null;
    const hit = categories.find((c) => c.id === activeCategoryId);
    if (!hit) return null;
    if (hit.parentId === ROOT_CATEGORY_ID) return hit.id;
    if (hit.parentId > ROOT_CATEGORY_ID) return hit.parentId;
    return null;
  })();

  const tertiaryList = activeSecondaryId
    ? categories
        .filter((c) => c.parentId === activeSecondaryId)
        .sort((a, b) => a.sort - b.sort || a.id - b.id)
    : [];

  function href(opts: {
    categoryId?: number | null;
    parentCategoryId?: number | null;
  }): string {
    const p = new URLSearchParams();
    if (preservedQuery.keyword) p.set("keyword", preservedQuery.keyword);
    if (preservedQuery.tagId) p.set("tagId", preservedQuery.tagId);
    if (opts.categoryId != null) {
      p.set("categoryId", String(opts.categoryId));
    } else if (opts.parentCategoryId != null) {
      p.set("parentCategoryId", String(opts.parentCategoryId));
    }
    const s = p.toString();
    return s ? `/?${s}` : "/";
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 第一行：二级分类 */}
      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
        role="tablist"
        aria-label="内容类型"
      >
        <PendingLink
          href={href({})}
          role="tab"
          aria-selected={activeSecondaryId === null}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
            activeSecondaryId === null
              ? "bg-violet-600 text-white"
              : "bg-zinc-200/90 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-700",
          )}
        >
          全部
        </PendingLink>
        {secondaryList.map((c) => (
          <PendingLink
            key={c.id}
            href={href({ parentCategoryId: c.id })}
            role="tab"
            aria-selected={activeSecondaryId === c.id}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
              activeSecondaryId === c.id
                ? "bg-violet-600 text-white"
                : "bg-zinc-200/90 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-700",
            )}
          >
            {c.name}
          </PendingLink>
        ))}
      </div>

      {/* 第二行：仅当选中某一二级时出现，展示其下三级 */}
      <AnimatePresence initial={false}>
        {activeSecondaryId != null && tertiaryList.length > 0 ? (
          reduceMotion ? (
            <div
              key={activeSecondaryId}
              className="-mx-1 flex flex-col gap-1.5 px-1"
            >
              <SubcategoryRow
                activeSecondaryId={activeSecondaryId}
                tertiaryList={tertiaryList}
                activeCategoryId={activeCategoryId}
                activeParentCategoryId={activeParentCategoryId}
                href={href}
              />
            </div>
          ) : (
            <motion.div
              key={activeSecondaryId}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="-mx-1 flex flex-col gap-1.5 px-1"
            >
              <SubcategoryRow
                activeSecondaryId={activeSecondaryId}
                tertiaryList={tertiaryList}
                activeCategoryId={activeCategoryId}
                activeParentCategoryId={activeParentCategoryId}
                href={href}
              />
            </motion.div>
          )
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type SubRowProps = {
  activeSecondaryId: number;
  tertiaryList: Category[];
  activeCategoryId: number | null;
  activeParentCategoryId: number | null;
  href: (opts: {
    categoryId?: number | null;
    parentCategoryId?: number | null;
  }) => string;
};

/** 第二行子分类列表（拆出便于无动效分支与有动效分支复用） */
function SubcategoryRow({
  activeSecondaryId,
  tertiaryList,
  activeCategoryId,
  activeParentCategoryId,
  href,
}: SubRowProps) {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        子分类
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]"
        role="tablist"
        aria-label="子分类"
      >
        <PendingLink
          href={href({ parentCategoryId: activeSecondaryId })}
          role="tab"
          aria-selected={
            activeParentCategoryId === activeSecondaryId &&
            activeCategoryId === null
          }
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center rounded-lg border px-3 py-2 text-sm transition-colors",
            activeParentCategoryId === activeSecondaryId &&
              activeCategoryId === null
              ? "border-violet-500/70 bg-violet-950/50 text-violet-100"
              : "border-zinc-700/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600",
          )}
        >
          全部
        </PendingLink>
        {tertiaryList.map((t) => (
          <PendingLink
            key={t.id}
            href={href({ categoryId: t.id })}
            role="tab"
            aria-selected={activeCategoryId === t.id}
            className={cn(
              "inline-flex min-h-10 max-w-[220px] shrink-0 items-center rounded-lg border px-3 py-2 text-sm transition-colors",
              activeCategoryId === t.id
                ? "border-violet-500/70 bg-violet-100 text-violet-900 dark:bg-violet-950/50 dark:text-violet-100"
                : "border-zinc-300/90 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-zinc-600",
            )}
            title={t.description ?? t.name}
          >
            <span className="truncate">{t.name}</span>
          </PendingLink>
        ))}
      </div>
    </>
  );
}
