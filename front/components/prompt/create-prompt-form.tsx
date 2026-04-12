"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { GridBackground } from "@/components/ui/grid-background";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PendingLink } from "@/components/ui/pending-link";
import { createPromptRequest } from "@/lib/api";
import {
  AUTH_CHANGE_EVENT,
  getStoredToken,
} from "@/lib/auth-client";
import type { Category, Tag } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  /** 分类下拉数据（服务端预取） */
  categories: Category[];
  /** 标签多选数据（服务端预取） */
  tags: Tag[];
};

/**
 * 已登录用户发布 Prompt：标题/正文必填，其余与后端 POST /prompts 对齐
 */
export function CreatePromptForm({ categories, tags }: Props) {
  const router = useRouter();
  /** 当前 token，与顶栏同步监听 AUTH_CHANGE_EVENT */
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 多选标签 id */
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name)),
    [categories],
  );
  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags],
  );

  useEffect(() => {
    function readToken() {
      setToken(getStoredToken());
    }
    readToken();
    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_CHANGE_EVENT, readToken);
      return () =>
        window.removeEventListener(AUTH_CHANGE_EVENT, readToken);
    }
  }, []);

  function toggleTag(id: number) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const t = getStoredToken();
    if (!t) {
      setError("请先登录后再发布");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const content = String(fd.get("content") ?? "").trim();
    if (!title || !content) {
      setError("请填写标题与正文");
      return;
    }
    const summary = String(fd.get("summary") ?? "").trim();
    const image = String(fd.get("image") ?? "").trim();
    const usageScenario = String(fd.get("usageScenario") ?? "").trim();
    const exampleInput = String(fd.get("exampleInput") ?? "").trim();
    const exampleOutput = String(fd.get("exampleOutput") ?? "").trim();
    const categoryRaw = String(fd.get("categoryId") ?? "").trim();
    const categoryId =
      categoryRaw === "" ? undefined : Number.parseInt(categoryRaw, 10);
    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) || categoryId < 1)
    ) {
      setError("分类选择不合法");
      return;
    }

    setLoading(true);
    try {
      const payload: Parameters<typeof createPromptRequest>[0] = {
        title,
        content,
      };
      if (summary) payload.summary = summary;
      if (image) payload.image = image;
      if (usageScenario) payload.usageScenario = usageScenario;
      if (exampleInput) payload.exampleInput = exampleInput;
      if (exampleOutput) payload.exampleOutput = exampleOutput;
      if (categoryId !== undefined) payload.categoryId = categoryId;
      if (selectedTagIds.length > 0) payload.tagIds = selectedTagIds;

      const created = await createPromptRequest(payload, t);
      router.push(`/prompt/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = cn(
    "w-full rounded-lg border border-zinc-300 bg-white/90 px-3 py-2 text-sm text-zinc-900",
    "outline-none ring-violet-500/40 focus:border-violet-500 focus:ring-2",
    "dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-zinc-100",
  );

  if (!token) {
    return (
      <div className="relative min-h-[calc(100dvh-57px)]">
        <BackgroundGradient className="opacity-70" />
        <GridBackground />
        <div className="relative z-10 mx-auto max-w-lg px-3 py-16 text-center sm:px-4">
          <p className="text-zinc-700 dark:text-zinc-300">
            发布 Prompt 需要先登录账号。
          </p>
          <PendingLink
            href="/login?redirect=/prompt/new"
            className="mt-6 inline-flex rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            去登录
          </PendingLink>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-57px)]">
      <BackgroundGradient className="opacity-70" />
      <GridBackground />

      <div className="relative z-10 mx-auto max-w-3xl px-3 py-8 sm:px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            发布 Prompt
          </h1>
          <PendingLink
            href="/"
            className="text-sm text-violet-600 hover:text-violet-500 dark:text-violet-400"
          >
            返回首页
          </PendingLink>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative overflow-hidden space-y-5 rounded-xl border border-zinc-200/90 bg-white/80 p-5 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60 sm:p-6"
          aria-busy={loading}
        >
          {error ? (
            <p
              className="rounded-lg border border-red-300/80 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={150}
              className={inputClass}
              placeholder="简短清晰的标题"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="summary" className="mb-1 block text-sm font-medium">
              摘要
            </label>
            <input
              id="summary"
              name="summary"
              maxLength={255}
              className={inputClass}
              placeholder="可选，列表卡片展示用"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-medium">
              正文 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              className={cn(inputClass, "min-h-[200px] resize-y font-mono text-xs sm:text-sm")}
              placeholder="粘贴完整 Prompt 内容…"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-medium">
              封面图 URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              maxLength={512}
              className={inputClass}
              placeholder="https://…"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="mb-1 block text-sm font-medium"
            >
              分类
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className={inputClass}
              defaultValue=""
              disabled={loading}
            >
              <option value="">默认分类（由系统分配）</option>
              {sortedCategories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">标签（多选）</legend>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map((tag) => {
                const checked = selectedTagIds.includes(tag.id);
                return (
                  <label
                    key={tag.id}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1 text-xs transition",
                      checked
                        ? "border-violet-500 bg-violet-500/15 text-violet-900 dark:text-violet-100"
                        : "border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/50",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleTag(tag.id)}
                      disabled={loading}
                    />
                    {tag.name}
                  </label>
                );
              })}
            </div>
            {sortedTags.length === 0 ? (
              <p className="text-xs text-zinc-500">暂无可用标签</p>
            ) : null}
          </fieldset>

          <div>
            <label
              htmlFor="usageScenario"
              className="mb-1 block text-sm font-medium"
            >
              使用场景
            </label>
            <input
              id="usageScenario"
              name="usageScenario"
              maxLength={255}
              className={inputClass}
              placeholder="例如：代码审查、文案润色"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="exampleInput"
              className="mb-1 block text-sm font-medium"
            >
              示例输入
            </label>
            <textarea
              id="exampleInput"
              name="exampleInput"
              rows={3}
              className={cn(inputClass, "resize-y font-mono text-xs")}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="exampleOutput"
              className="mb-1 block text-sm font-medium"
            >
              示例输出
            </label>
            <textarea
              id="exampleOutput"
              name="exampleOutput"
              rows={3}
              className={cn(inputClass, "resize-y font-mono text-xs")}
              disabled={loading}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-w-[7rem] items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-60"
            >
              发布
            </button>
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              取消
            </Link>
          </div>
          <LoadingOverlay show={loading} label="发布中" />
        </form>
      </div>
    </div>
  );
}
