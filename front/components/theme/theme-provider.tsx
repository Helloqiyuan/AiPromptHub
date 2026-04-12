"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * 为全站提供浅色 / 深色主题（通过 html 上的 .dark class 驱动 Tailwind dark:）
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="ai-prompt-hub-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
