import { Heart, MessageCircle, Star } from "lucide-react";

import { PendingLink } from "@/components/ui/pending-link";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { PromptListItem } from "@/lib/types";

type PromptCardProps = {
  prompt: PromptListItem;
};

/**
 * 根据分类 id 生成稳定色相，用于无封面图时的渐变占位（类 Civitai 缩略图位）
 */
function categoryHue(categoryId: number): number {
  return (categoryId * 47 + 137) % 360;
}

/**
 * 单张 Prompt 卡片：渐变头图区 + 标题 + 作者 + 互动数据
 */
export function PromptCard({ prompt }: PromptCardProps) {
  const author = prompt.author;
  const cat = prompt.category;
  const hue = categoryHue(prompt.categoryId ?? 1);
  const coverUrl = prompt.image?.trim();

  return (
    <PendingLink
      href={`/prompt/${prompt.id}`}
      className="group/card block h-full rounded-xl"
    >
      <SpotlightCard wrapperClassName="h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-xl">
          {/* 头图：略增高宽比；hover 时封面轻微放大 */}
          <div
            className="relative aspect-[4/3] w-full overflow-hidden"
            style={
              coverUrl
                ? undefined
                : {
                    background: `linear-gradient(135deg, hsl(${hue} 55% 35%) 0%, hsl(${(hue + 40) % 360} 45% 22%) 100%)`,
                  }
            }
          >
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- 外链封面域名不固定，与头像策略一致
              <img
                src={coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover/card:scale-110"
                loading="lazy"
              />
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
            {cat?.name ? (
              <span className="absolute left-2 top-2 z-[1] rounded-md bg-black/35 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {cat.name}
              </span>
            ) : null}
            <p className="absolute bottom-2 left-2 right-2 z-[1] line-clamp-2 text-base font-semibold leading-snug text-white drop-shadow">
              {prompt.title}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 p-4">
            <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {prompt.summary || "暂无摘要"}
            </p>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-200/90 pt-2 dark:border-zinc-800/80">
              <div className="flex min-w-0 items-center gap-2">
                {author?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 头像 URL 来源多样，避免配置大量 remotePatterns
                  <img
                    src={author.avatar}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                    aria-hidden
                  >
                    {(author?.username ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="truncate text-xs text-zinc-700 dark:text-zinc-300">
                  {author?.username ?? "未知用户"}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-600 dark:text-zinc-500">
                <span className="inline-flex items-center gap-0.5" title="点赞">
                  <Heart className="h-3.5 w-3.5" aria-hidden />
                  {prompt.likeCount ?? 0}
                </span>
                <span className="inline-flex items-center gap-0.5" title="收藏">
                  <Star className="h-3.5 w-3.5" aria-hidden />
                  {prompt.favoriteCount ?? 0}
                </span>
                <span className="inline-flex items-center gap-0.5" title="评论">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  {prompt.commentCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </PendingLink>
  );
}
