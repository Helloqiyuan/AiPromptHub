"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
} from "react";

import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { cn } from "@/lib/utils";

type RouteTransitionContextValue = {
  /** 与 React useTransition 一致，用于客户端路由跳转时触发全局主内容区蒙层 */
  startRouteTransition: (fn: () => void) => void;
};

/** 供 PendingLink 等在无 hook 场景读取（避免在未包裹时抛错） */
export const RouteTransitionContext =
  createContext<RouteTransitionContextValue | null>(null);

export function useRouteTransition(): RouteTransitionContextValue {
  const v = useContext(RouteTransitionContext);
  if (!v) {
    throw new Error("useRouteTransition 需在 RouteTransitionProvider 内使用");
  }
  return v;
}

/**
 * 包裹顶栏以下页面：PendingLink 触发的 pending 蒙层盖在主内容区，不盖在链接/按钮本身上
 */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();

  return (
    <RouteTransitionContext.Provider
      value={{ startRouteTransition: startTransition }}
    >
      {children}
      {/* 固定层：与全站 min-h 计算一致，顶栏约 57px */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-[57px] z-30",
          isPending ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-busy={isPending}
      >
        <div className="relative h-full w-full min-h-[120px]">
          <LoadingOverlay
            show={isPending}
            label="页面更新中"
            className="pointer-events-auto z-40"
          />
        </div>
      </div>
    </RouteTransitionContext.Provider>
  );
}
