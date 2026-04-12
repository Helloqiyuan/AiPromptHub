"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FloatingNavbarProps = {
  children: ReactNode;
  className?: string;
};

/**
 * 顶栏容器：仿 Aceternity Floating Dock / Navbar 的悬浮条视觉（毛玻璃 + 细边框）
 */
export function FloatingNavbar({ children, className }: FloatingNavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-zinc-200/90 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:supports-[backdrop-filter]:bg-zinc-950/60",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-3 py-3 sm:px-4">
        {children}
      </div>
    </header>
  );
}
