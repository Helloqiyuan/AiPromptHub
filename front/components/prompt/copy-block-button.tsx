"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type CopyBlockButtonProps = {
  text: string;
  className?: string;
};

/**
 * 复制 Prompt 正文到剪贴板，提供明确成功反馈（无障碍：aria-live 可由父级补充）
 */
export function CopyBlockButton({ text, className }: CopyBlockButtonProps) {
  const [done, setDone] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-zinc-400 px-3 py-1.5 text-sm text-zinc-800 transition hover:border-violet-500/60 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800/80",
        className,
      )}
    >
      {done ? (
        <>
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          已复制
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" aria-hidden />
          复制全文
        </>
      )}
    </button>
  );
}
