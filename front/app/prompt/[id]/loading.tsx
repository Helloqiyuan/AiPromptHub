/**
 * Prompt 详情页数据加载中的骨架布局（与 page 结构大致对齐）
 */
export default function PromptDetailLoading() {
  return (
    <div className="relative min-h-[calc(100dvh-57px)] px-3 py-8 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 h-5 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-200/90 bg-white/60 dark:border-zinc-800/80 dark:bg-zinc-950/40">
            <div className="aspect-[21/9] max-h-64 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-4 p-6">
              <div className="h-9 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900/80" />
            </div>
          </div>
          <aside className="space-y-4">
            <div className="h-32 animate-pulse rounded-xl border border-zinc-200/90 bg-zinc-100/80 dark:border-zinc-800/80 dark:bg-zinc-900/40" />
            <div className="h-24 animate-pulse rounded-xl border border-zinc-200/90 bg-zinc-100/80 dark:border-zinc-800/80 dark:bg-zinc-900/40" />
          </aside>
        </div>
      </div>
    </div>
  );
}
