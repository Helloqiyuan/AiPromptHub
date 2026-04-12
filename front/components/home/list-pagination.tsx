import { ChevronLeft, ChevronRight } from "lucide-react";

import { PendingLink } from "@/components/ui/pending-link";

type ListPaginationProps = {
  page: number;
  totalPages: number;
  /** 生成「第 n 页」链接时保留的查询参数 */
  query: Record<string, string | undefined>;
};

/**
 * 简单分页条：上一页 / 下一页 + 页码信息（与 Civitai 列表底部分页类似）
 */
export function ListPagination({
  page,
  totalPages,
  query,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  function href(p: number): string {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/?${s}` : "/";
  }

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="flex items-center justify-center gap-4 py-8"
      aria-label="分页"
    >
      {prev != null ? (
        <PendingLink
          href={href(prev)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:border-violet-500/50 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          上一页
        </PendingLink>
      ) : (
        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          上一页
        </span>
      )}
      <span className="text-sm text-zinc-600 dark:text-zinc-500">
        第 {page} / {totalPages} 页
      </span>
      {next != null ? (
        <PendingLink
          href={href(next)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:border-violet-500/50 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
        >
          下一页
          <ChevronRight className="h-4 w-4" aria-hidden />
        </PendingLink>
      ) : (
        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
          下一页
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
