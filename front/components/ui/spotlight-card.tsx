"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** 卡片外层包裹（如 Link）时传入，保持圆角一致 */
  wrapperClassName?: string;
};

/**
 * 鼠标跟随聚光灯边框（Aceternity Spotlight / Card 常见交互）
 * 用于 Prompt 卡片 hover 时的高亮反馈，替代纯 CSS hover
 */
export function SpotlightCard({
  children,
  className,
  wrapperClassName,
}: SpotlightCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  const background = useMotionTemplate`
    radial-gradient(380px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.18), transparent 55%)
  `;

  return (
    <div
      className={cn("group relative rounded-xl", wrapperClassName)}
      onMouseMove={handleMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div
        className={cn(
          "relative h-full rounded-xl border border-zinc-200/90 bg-white/80 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-0.5 dark:border-zinc-800/80 dark:bg-zinc-950/70",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
