import Link from "next/link";

/**
 * 全局 404：与暗色主题一致
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col items-center justify-center px-4">
      <p className="text-6xl font-bold text-zinc-400 dark:text-zinc-700">404</p>
      <h1 className="mt-4 text-xl font-medium text-zinc-800 dark:text-zinc-200">
        页面不存在
      </h1>
      <Link
        href="/"
        className="mt-6 text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
      >
        返回首页
      </Link>
    </div>
  );
}
