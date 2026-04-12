import { cn } from "@/lib/utils";

import { Spinner } from "./spinner";

type LoadingOverlayProps = {
  /** 是否显示蒙层 */
  show: boolean;
  /** 屏幕阅读器读给 Spinner 的标签 */
  label?: string;
  /** 覆盖层额外 class（圆角继承父级时常用 rounded-[inherit]） */
  className?: string;
  /** 中间 Spinner 尺寸，默认 h-9 w-9 */
  spinnerClassName?: string;
};

/**
 * 盖在 relative 容器上的半透明蒙层 + 居中 Spinner（与 PendingLink 视觉一致）
 */
export function LoadingOverlay({
  show,
  label = "加载中",
  className,
  spinnerClassName,
}: LoadingOverlayProps) {
  if (!show) return null;
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-zinc-100/75 backdrop-blur-[1px] dark:bg-zinc-950/55",
        className,
      )}
      aria-hidden
    >
      {/* 居中加载动画 */}
      <Spinner
        className={cn("h-9 w-9", spinnerClassName)}
        label={label}
      />
    </span>
  );
}
