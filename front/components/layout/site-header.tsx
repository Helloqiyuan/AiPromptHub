"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FilePlus2, LogIn, LogOut, Sparkles, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { PendingLink } from "@/components/ui/pending-link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { fetchCurrentUser } from "@/lib/api";
import {
  AUTH_CHANGE_EVENT,
  clearStoredToken,
  getStoredToken,
  getStoredUsername,
  setStoredUsername,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * 全站顶栏：Civitai 式 Logo + 搜索 + 登录态（token 存 localStorage）
 */
export function SiteHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    function syncFromStorage() {
      const t = getStoredToken();
      setToken(t);
      if (!t) {
        setUsername(null);
        return;
      }
      const cached = getStoredUsername();
      if (cached) setUsername(cached);
      fetchCurrentUser(t)
        .then((u) => {
          setUsername(u.username);
          setStoredUsername(u.username);
        })
        .catch(() => {
          if (!cached) setUsername(null);
        });
    }
    syncFromStorage();
    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_CHANGE_EVENT, syncFromStorage);
      return () =>
        window.removeEventListener(AUTH_CHANGE_EVENT, syncFromStorage);
    }
  }, []);

  const keyword = searchParams.get("keyword") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const tagId = searchParams.get("tagId") ?? "";

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setUsername(null);
    router.refresh();
  }

  return (
    <FloatingNavbar>
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
      >
        <Sparkles className="h-6 w-6 text-violet-400" aria-hidden />
        <span>AiPromptHub</span>
      </Link>

      <form
        action="/"
        method="get"
        className="mx-auto flex max-w-xl flex-1 items-center gap-2"
        role="search"
      >
        {categoryId ? (
          <input type="hidden" name="categoryId" value={categoryId} />
        ) : null}
        {tagId ? <input type="hidden" name="tagId" value={tagId} /> : null}
        <label htmlFor="global-search" className="sr-only">
          搜索 Prompt
        </label>
        <input
          id="global-search"
          name="keyword"
          type="search"
          placeholder="搜索标题、摘要或正文…"
          defaultValue={keyword}
          className={cn(
            "w-full rounded-lg border border-zinc-300 bg-white/90 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500",
            "outline-none ring-violet-500/40 focus:border-violet-500 focus:ring-2",
            "dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-100",
          )}
          autoComplete="off"
        />
      </form>

      <nav
        className="flex shrink-0 items-center gap-2 sm:gap-3"
        aria-label="用户"
      >
        <ThemeToggle />
        {token ? (
          <>
            <PendingLink
              href="/prompt/new"
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-500/20 dark:border-violet-500/40 dark:text-violet-200 dark:hover:bg-violet-950/50"
            >
              <FilePlus2 className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">发布</span>
            </PendingLink>
            <span
              className="max-w-[7rem] truncate text-right text-xs font-medium text-zinc-800 dark:text-zinc-100 sm:max-w-[12rem] sm:text-sm"
              title={username ?? undefined}
            >
              {username ?? "…"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/80"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">退出</span>
            </button>
          </>
        ) : (
          <>
            <PendingLink
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 transition hover:border-violet-500/60 hover:bg-violet-100/80 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-violet-950/40"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">登录</span>
            </PendingLink>
            <PendingLink
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">注册</span>
            </PendingLink>
          </>
        )}
      </nav>
    </FloatingNavbar>
  );
}
