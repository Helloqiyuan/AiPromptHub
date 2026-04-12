import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type SpinnerProps = {
  /** 尺寸，如 h-5 w-5 */
  className?: string;
  /** 屏幕阅读器标签 */
  label?: string;
};

/**
 * 环形加载图标（lucide Loader2 + 旋转动画）
 */
export function Spinner({ className, label = "加载中" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
    >
      <Loader2
        className="h-full w-full animate-spin text-violet-600 dark:text-violet-400"
        aria-hidden
      />
    </span>
  );
}
