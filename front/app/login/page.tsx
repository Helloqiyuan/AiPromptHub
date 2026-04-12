"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { GridBackground } from "@/components/ui/grid-background";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { loginRequest } from "@/lib/api";
import { setStoredToken, setStoredUsername } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/** 仅允许站内相对路径，防止开放重定向 */
function safeRedirectPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  return raw;
}

/**
 * 登录页：提交账号密码，写入 token 后回首页或 ?redirect= 指定页
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterLogin = useMemo(
    () => safeRedirectPath(searchParams.get("redirect")),
    [searchParams],
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      setError("请填写邮箱与密码");
      return;
    }
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      setStoredToken(data.token);
      setStoredUsername(data.user.username);
      router.push(afterLogin ?? "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-57px)] items-center justify-center px-4 py-16">
      <BackgroundGradient className="opacity-80" />
      <GridBackground />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-zinc-200/90 bg-white/90 p-8 shadow-2xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80"
        aria-busy={loading}
      >
        <h1 className="text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          登录
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-500">
          还没有账号？{" "}
          <Link href="/register" className="text-violet-600 hover:underline dark:text-violet-400">
            注册
          </Link>
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-400"
            >
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={cn(
                "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100",
              )}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-400"
            >
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={cn(
                "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100",
              )}
              required
              disabled={loading}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            登录
          </button>
        </form>
        {/* 请求进行中时覆盖整张卡片，加载反馈不在按钮内 */}
        <LoadingOverlay show={loading} label="登录中" />
      </div>
    </div>
  );
}
