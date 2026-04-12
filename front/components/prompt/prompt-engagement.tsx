"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Star, Trash2 } from "lucide-react";

import {
  ApiRequestError,
  createCommentRequest,
  deleteCommentRequest,
  fetchCommentTree,
  fetchCurrentUser,
  fetchPromptDetail,
  toggleFavoriteRequest,
  toggleLikeRequest,
} from "@/lib/api";
import type { CommentTreeNode, PromptDetail } from "@/lib/types";
import {
  AUTH_CHANGE_EVENT,
  AUTH_TOKEN_KEY,
  getStoredToken,
} from "@/lib/auth-client";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { cn } from "@/lib/utils";

type PromptEngagementProps = {
  /** 服务端传入的初始 Prompt，客户端再按需带 token 合并 */
  initialPrompt: PromptDetail;
};

/**
 * 详情页：点赞、收藏、评论列表与发表（需登录的操作会提示去登录页）
 */
export function PromptEngagement({ initialPrompt }: PromptEngagementProps) {
  const [prompt, setPrompt] = useState<PromptDetail>(initialPrompt);
  const [meId, setMeId] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentTreeNode[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<CommentTreeNode | null>(null);
  /** 点赞请求中 */
  const [pendingLike, setPendingLike] = useState(false);
  /** 收藏请求中 */
  const [pendingFavorite, setPendingFavorite] = useState(false);
  /** 发表评论并刷新列表/详情期间 */
  const [pendingComment, setPendingComment] = useState(false);
  /** 正在删除的评论 id，仅该行显示蒙层 */
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  /** 仅未登录时展示「登录后可…」提示（避免已有 token 仍显示） */
  const [showLoginHint, setShowLoginHint] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const tree = await fetchCommentTree(initialPrompt.id);
      setComments(tree);
    } catch {
      setComments([]);
    }
  }, [initialPrompt.id]);

  // 挂载时读 token、当前用户 id；同步是否展示登录引导文案
  useEffect(() => {
    const t = getStoredToken();
    setShowLoginHint(!t);
    if (!t) {
      setMeId(null);
      return;
    }
    fetchCurrentUser(t)
      .then((u) => setMeId(u.id))
      .catch(() => setMeId(null));
  }, []);

  useEffect(() => {
    function syncHint() {
      setShowLoginHint(!getStoredToken());
    }
    function onStorage(e: StorageEvent) {
      if (e.key === AUTH_TOKEN_KEY || e.key === null) {
        syncHint();
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CHANGE_EVENT, syncHint);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncHint);
    };
  }, []);

  // 有 token 时再拉一次详情，拿到真实的 liked / favorited
  useEffect(() => {
    const t = getStoredToken();
    if (!t) return;
    fetchPromptDetail(initialPrompt.id, t)
      .then(setPrompt)
      .catch(() => {
        /* 忽略，保留 SSR 数据 */
      });
  }, [initialPrompt.id]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const statsBusy = pendingLike || pendingFavorite;

  async function onToggleLike() {
    const t = getStoredToken();
    if (!t) {
      setErr("请先登录后再点赞");
      return;
    }
    setPendingLike(true);
    setErr(null);
    try {
      const r = await toggleLikeRequest(initialPrompt.id, t);
      setPrompt((prev) => ({
        ...prev,
        liked: r.liked,
        likeCount: r.likeCount,
      }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "操作失败");
    } finally {
      setPendingLike(false);
    }
  }

  async function onToggleFavorite() {
    const t = getStoredToken();
    if (!t) {
      setErr("请先登录后再收藏");
      return;
    }
    setPendingFavorite(true);
    setErr(null);
    try {
      const r = await toggleFavoriteRequest(initialPrompt.id, t);
      setPrompt((prev) => ({
        ...prev,
        favorited: r.favorited,
        favoriteCount: r.favoriteCount,
      }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "操作失败");
    } finally {
      setPendingFavorite(false);
    }
  }

  async function onSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    const t = getStoredToken();
    if (!t) {
      setErr("请先登录后再评论");
      return;
    }
    const content = text.trim();
    if (!content) return;
    setPendingComment(true);
    setErr(null);
    try {
      await createCommentRequest(
        {
          promptId: initialPrompt.id,
          content,
          ...(replyTo ? { parentId: replyTo.id } : {}),
        },
        t,
      );
      setText("");
      setReplyTo(null);
      await loadComments();
      const detail = await fetchPromptDetail(initialPrompt.id, t);
      setPrompt(detail);
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        setErr("登录已过期，请重新登录");
      } else {
        setErr(e instanceof Error ? e.message : "发表失败");
      }
    } finally {
      setPendingComment(false);
    }
  }

  async function onDeleteComment(id: number) {
    const t = getStoredToken();
    if (!t) return;
    setDeletingId(id);
    setErr(null);
    try {
      await deleteCommentRequest(id, t);
      await loadComments();
      const detail = await fetchPromptDetail(initialPrompt.id, t);
      setPrompt(detail);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-8 space-y-8" aria-label="互动与评论">
      {/* 点赞 / 收藏 / 评论数：异步时整行蒙层，按钮内不再替换为 Spinner */}
      <div
        className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl"
        aria-busy={statsBusy}
      >
        <button
          type="button"
          disabled={statsBusy}
          onClick={() => void onToggleLike()}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60",
            prompt.liked
              ? "border-rose-500/60 bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-zinc-600",
          )}
        >
          <Heart
            className={cn("h-4 w-4", prompt.liked && "fill-current")}
            aria-hidden
          />
          <span>点赞</span>
          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
            {prompt.likeCount ?? 0}
          </span>
        </button>

        <button
          type="button"
          disabled={statsBusy}
          onClick={() => void onToggleFavorite()}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60",
            prompt.favorited
              ? "border-amber-500/60 bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:border-zinc-600",
          )}
        >
          <Star
            className={cn("h-4 w-4", prompt.favorited && "fill-current")}
            aria-hidden
          />
          <span>收藏</span>
          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
            {prompt.favoriteCount ?? 0}
          </span>
        </button>

        <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span>评论</span>
          <span className="tabular-nums">{prompt.commentCount ?? 0}</span>
        </div>

        {showLoginHint ? (
          <Link
            href="/login"
            className="text-xs text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
          >
            登录后可点赞、收藏与评论
          </Link>
        ) : null}
        <LoadingOverlay
          show={statsBusy}
          label="处理中"
          spinnerClassName="h-6 w-6"
        />
      </div>

      {err ? (
        <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
          {err}
        </p>
      ) : null}

      {/* 评论表单 + 列表：提交与刷新期间整块蒙层 */}
      <div
        className="relative space-y-8 overflow-hidden rounded-xl"
        aria-busy={pendingComment}
      >
        <form onSubmit={onSubmitComment} className="space-y-2">
          {replyTo ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-500">
              回复 @{replyTo.author?.username ?? "用户"}{" "}
              <button
                type="button"
                className="text-violet-600 hover:underline dark:text-violet-400"
                onClick={() => setReplyTo(null)}
                disabled={pendingComment}
              >
                取消
              </button>
            </p>
          ) : null}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="写下你的看法…"
            disabled={pendingComment}
            className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-200 dark:placeholder:text-zinc-600"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pendingComment || !text.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              发表评论
            </button>
          </div>
        </form>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-300">
            全部评论
          </h3>
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-500">
              还没有评论，来抢沙发吧。
            </p>
          ) : (
            <ul className="space-y-2">
              {comments.map((node) => (
                <CommentItem
                  key={node.id}
                  node={node}
                  depth={0}
                  meId={meId}
                  deletingId={deletingId}
                  onReply={setReplyTo}
                  onDelete={onDeleteComment}
                />
              ))}
            </ul>
          )}
        </div>
        <LoadingOverlay show={pendingComment} label="提交中" />
      </div>
    </section>
  );
}

type CommentItemProps = {
  node: CommentTreeNode;
  depth: number;
  meId: number | null;
  deletingId: number | null;
  onReply: (n: CommentTreeNode) => void;
  onDelete: (id: number) => void | Promise<void>;
};

function CommentItem({
  node,
  depth,
  meId,
  deletingId,
  onReply,
  onDelete,
}: CommentItemProps) {
  const canDelete = meId !== null && Number(node.userId) === meId;
  const isDeleting = deletingId === node.id;

  return (
    <li
      className="relative overflow-hidden rounded-lg border border-zinc-200/90 bg-zinc-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/30"
      style={{ marginLeft: depth ? Math.min(depth * 12, 48) : 0 }}
      aria-busy={isDeleting}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-zinc-600 dark:text-zinc-500">
            <span className="font-medium text-zinc-800 dark:text-zinc-300">
              {node.author?.username ?? "用户"}
            </span>
            <span className="ml-2">
              {new Date(node.createTime).toLocaleString()}
            </span>
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-800 dark:text-zinc-300">
            {node.content}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={isDeleting}
            className="rounded px-2 py-1 text-xs text-violet-600 hover:bg-zinc-200 dark:text-violet-400 dark:hover:bg-zinc-800"
            onClick={() => onReply(node)}
          >
            回复
          </button>
          {canDelete ? (
            <button
              type="button"
              disabled={isDeleting}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-200 hover:text-rose-600 dark:hover:bg-zinc-800 dark:hover:text-rose-400"
              title="删除"
              onClick={() => void onDelete(node.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      {node.children?.length ? (
        <ul className="mt-2 space-y-2 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {node.children.map((ch) => (
            <CommentItem
              key={ch.id}
              node={ch}
              depth={depth + 1}
              meId={meId}
              deletingId={deletingId}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}
      {/* 蒙层置于 li 末尾，覆盖本条含子回复整块区域 */}
      <LoadingOverlay
        show={isDeleting}
        label="删除中"
        spinnerClassName="h-5 w-5"
      />
    </li>
  );
}
