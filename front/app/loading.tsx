/**
 * 首页等根级路由在 RSC 数据就绪前的占位（骨架 + 脉动）
 */
export default function RootLoading() {
  return (
    <div className="relative min-h-[calc(100dvh-57px)] px-3 pb-16 pt-8 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-10 max-w-md animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mb-8 h-24 animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80" />
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="min-h-[380px]">
              <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-100/80 dark:border-zinc-800/80 dark:bg-zinc-900/50">
                <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="mt-auto h-10 rounded border-t border-zinc-200 pt-2 dark:border-zinc-800" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
