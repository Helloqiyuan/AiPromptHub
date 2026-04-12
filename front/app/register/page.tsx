"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { GridBackground } from "@/components/ui/grid-background";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { registerRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * 注册页：创建账号后跳转登录
 */
export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const passwordConfirm = String(fd.get("passwordConfirm") ?? "");
    if (username.length < 2) {
      setError("用户名至少 2 个字符");
      return;
    }
    if (!email) {
      setError("请填写邮箱");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (password !== passwordConfirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    try {
      await registerRequest({
        username,
        email,
        password,
        passwordConfirm,
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
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
          注册
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-500">
          已有账号？{" "}
          <Link href="/login" className="text-violet-600 hover:underline dark:text-violet-400">
            登录
          </Link>
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-400"
            >
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              minLength={2}
              maxLength={50}
              className={cn(
                "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100",
              )}
              required
              disabled={loading}
            />
          </div>
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
              required
              className={cn(
                "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100",
              )}
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
              autoComplete="new-password"
              minLength={6}
              maxLength={32}
              className={cn(
                "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-violet-500/30 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100",
              )}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-400"
            >
              确认密码
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              minLength={6}
              maxLength={32}
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
            注册
          </button>
        </form>
        <LoadingOverlay show={loading} label="提交中" />
      </div>
    </div>
  );
}
