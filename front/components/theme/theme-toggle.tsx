"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * 顶栏主题切换：在浅色与深色之间切换（默认深色，与历史版本一致）
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-2.5 transition",
        "border-zinc-300 bg-white text-zinc-800 hover:border-violet-400 hover:bg-zinc-50",
        "dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/80",
      )}
      aria-label={isDark ? "切换为浅色模式" : "切换为深色模式"}
      title={isDark ? "浅色模式" : "深色模式"}
    >
      {!mounted ? (
        <span className="inline-block h-4 w-4" aria-hidden />
      ) : isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
