import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { RouteTransitionProvider } from "@/components/layout/route-transition-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AiPromptHub — Prompt 社区",
  description: "发现、分享与收藏高质量 AI Prompt",
};

/**
 * 根布局：主题由用户选择（默认深色）+ 顶栏（useSearchParams 需 Suspense 边界）
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background font-sans antialiased text-foreground`}
      >
        <ThemeProvider>
          <RouteTransitionProvider>
            <Suspense
              fallback={
                <div
                  className="h-[57px] border-b border-zinc-200 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-950/75"
                  aria-hidden
                />
              }
            >
              <SiteHeader />
            </Suspense>
            {children}
          </RouteTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
