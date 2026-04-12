"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";

import { LoadingOverlay } from "@/components/ui/loading-overlay";
import type { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";

type HomeFeedWithTagTransitionProps = {
  /** 标签下拉数据 */
  tags: Tag[];
  /** 筛选项上半区（如 CategoryPills），与标签同行展示 */
  categoryPills: ReactNode;
  /** 下方列表区：切换标签时在此区域显示蒙层 */
  children: ReactNode;
};

/**
 * 标签筛选与列表共用 useTransition：导航 pending 时蒙层盖在卡片栅格上，而非标签旁 Spinner
 */
export function HomeFeedWithTagTransition({
  tags,
  categoryPills,
  children,
}: HomeFeedWithTagTransitionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const tagValue = searchParams.get("tagId") ?? "";

  return (
    <>
      <section
        className="mb-8 flex flex-col gap-4 border-b border-zinc-200/90 pb-8 dark:border-zinc-800/80"
        aria-label="筛选"
      >
        {categoryPills}
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="shrink-0">标签</span>
          <select
            value={tagValue}
            disabled={isPending}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams.toString());
              const v = e.target.value;
              if (v) next.set("tagId", v);
              else next.delete("tagId");
              next.delete("page");
              const q = next.toString();
              startTransition(() => {
                router.push(q ? `/?${q}` : "/");
              });
            }}
            className={cn(
              "min-w-[8rem] rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-100",
            )}
          >
            <option value="">全部</option>
            {tags.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div
        className="relative min-h-[12rem] overflow-hidden rounded-xl"
        aria-busy={isPending}
      >
        {children}
        <LoadingOverlay show={isPending} label="加载列表" />
      </div>
    </>
  );
}
