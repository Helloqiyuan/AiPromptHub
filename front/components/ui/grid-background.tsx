import { cn } from "@/lib/utils";

type GridBackgroundProps = {
  className?: string;
};

/**
 * 细网格背景（Aceternity 常见 pattern）：低对比网格线增强「工具/社区」质感
 */
export function GridBackground({ className }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#d4d4d8_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d8_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_45%,transparent_100%)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] dark:opacity-40",
        className,
      )}
      aria-hidden
    />
  );
}
