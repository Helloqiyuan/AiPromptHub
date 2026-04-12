"use client";

import { cn } from "@/lib/utils";

type BackgroundGradientProps = {
  className?: string;
};

/**
 * 仿 Aceternity「氛围背景」：多层模糊色块营造深度，适合深色社区首页底图
 * 性能：仅 CSS + 静态定位，无 Canvas；可配合 prefers-reduced-motion 在父级减弱动效
 */
export function BackgroundGradient({ className }: BackgroundGradientProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-70 dark:opacity-100",
        className,
      )}
      aria-hidden
    >
      {/* 左上：靛紫光晕（浅色略弱，避免发灰） */}
      <div className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[100px] dark:bg-violet-600/25" />
      {/* 右下：青紫光晕 */}
      <div className="absolute -right-1/4 bottom-0 h-[380px] w-[480px] rounded-full bg-fuchsia-600/12 blur-[110px] dark:bg-fuchsia-600/20" />
      {/* 中间弱光 */}
      <div className="absolute left-1/3 top-1/4 h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[90px] dark:bg-indigo-500/15" />
    </div>
  );
}
