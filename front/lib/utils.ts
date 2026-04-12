import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind 类名：先 clsx 再 tailwind-merge，避免样式冲突（Aceternity / shadcn 常用模式）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
