"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, type ComponentProps, type ReactNode } from "react";

import { RouteTransitionContext } from "@/components/layout/route-transition-provider";
import { cn } from "@/lib/utils";

type PendingLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children" | "onClick">;

/**
 * 客户端导航：loading 由 RouteTransitionProvider 盖在顶栏以下主内容区，不在链接本身上
 */
export function PendingLink({
  href,
  className,
  children,
  ...rest
}: PendingLinkProps) {
  const router = useRouter();
  const routeCtx = useContext(RouteTransitionContext);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey ||
      e.button !== 0
    ) {
      return;
    }
    const target = new URL(href, window.location.origin);
    const next = `${target.pathname}${target.search}`;
    const cur = `${window.location.pathname}${window.location.search}`;
    if (next === cur) return;
    e.preventDefault();
    const run = () => {
      router.push(href);
    };
    if (routeCtx) {
      routeCtx.startRouteTransition(run);
    } else {
      run();
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={cn(className)} {...rest}>
      {children}
    </Link>
  );
}
