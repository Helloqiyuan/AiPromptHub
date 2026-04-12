import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CopyBlockButton } from "@/components/prompt/copy-block-button";
import { PromptEngagement } from "@/components/prompt/prompt-engagement";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { GridBackground } from "@/components/ui/grid-background";
import { PendingLink } from "@/components/ui/pending-link";
import { ApiRequestError, fetchPromptDetail } from "@/lib/api";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Prompt 详情：主栏正文 + 侧栏元数据（类 Civitai 详情信息架构）
 */
export default async function PromptDetailPage({ params }: PageProps) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num) || num < 1) notFound();

  let prompt;
  try {
    prompt = await fetchPromptDetail(num);
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) notFound();
    throw e;
  }

  const author = prompt.author;

  return (
    <div className="relative min-h-[calc(100dvh-57px)]">
      <BackgroundGradient className="opacity-70" />
      <GridBackground />

      <article className="relative z-10 mx-auto max-w-7xl px-3 py-8 sm:px-4">
        <PendingLink
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回探索
        </PendingLink>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-200/90 bg-white/80 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/60">
            {prompt.image?.trim() ? (
              <div className="relative aspect-[21/9] w-full max-h-64 overflow-hidden border-b border-zinc-200/90 dark:border-zinc-800/80">
                {/* eslint-disable-next-line @next/next/no-img-element -- 外链封面 */}
                <img
                  src={prompt.image.trim()}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {prompt.title}
            </h1>
            {prompt.summary ? (
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{prompt.summary}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CopyBlockButton text={prompt.content} />
            </div>

            <section className="mt-8" aria-labelledby="prompt-body">
              <h2 id="prompt-body" className="sr-only">
                正文
              </h2>
              <pre className="whitespace-pre-wrap break-words rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                {prompt.content}
              </pre>
            </section>

            {prompt.usageScenario ? (
              <section className="mt-8">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                  适用场景
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {prompt.usageScenario}
                </p>
              </section>
            ) : null}

            {(prompt.exampleInput || prompt.exampleOutput) && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {prompt.exampleInput ? (
                  <section>
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                      示例输入
                    </h3>
                    <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                      {prompt.exampleInput}
                    </pre>
                  </section>
                ) : null}
                {prompt.exampleOutput ? (
                  <section>
                    <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
                      示例输出
                    </h3>
                    <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                      {prompt.exampleOutput}
                    </pre>
                  </section>
                ) : null}
              </div>
            )}

            <PromptEngagement initialPrompt={prompt} />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-zinc-200/90 bg-white/85 p-4 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                作者
              </h2>
              <div className="mt-3 flex items-center gap-3">
                {author?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={author.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
                    {(author?.username ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                    {author?.username ?? "未知用户"}
                  </p>
                </div>
              </div>
            </div>

            {prompt.tags && prompt.tags.length > 0 ? (
              <div className="rounded-xl border border-zinc-200/90 bg-white/85 p-4 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
                <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  标签
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {prompt.tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-md bg-zinc-200/90 px-2 py-0.5 text-xs text-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-300"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-zinc-200/90 bg-white/85 p-4 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
              <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                分类
              </h2>
              {prompt.category?.name ? (
                <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-300">
                  {prompt.category.name}
                </p>
              ) : (
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-600">
                  未分类
                </p>
              )}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
