import type {
  ApiFailure,
  ApiSuccess,
  Category,
  CommentTreeNode,
  CreatePromptPayload,
  LoginData,
  PromptDetail,
  PromptListData,
  Tag,
} from "./types";

/** 服务端与客户端共用的 API 根路径（需在 .env.local 配置） */
export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:3000/api";
}

/** 带 HTTP 状态的请求错误，便于页面层区分 404 等 */
export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

/**
 * 通用 GET 请求：解析 { code, data }，失败时抛出 ApiRequestError
 * @param path 以 / 开头的相对路径，如 /prompts
 */
export async function apiGet<T>(
  path: string,
  options?: RequestInit & { token?: string | null },
): Promise<T> {
  const { token, ...init } = options ?? {};
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const isBrowser =
    typeof globalThis !== "undefined" && "window" in globalThis;
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers,
    ...(isBrowser
      ? { cache: init.cache ?? ("no-store" as RequestCache) }
      : { next: init.next ?? { revalidate: 15 } }),
  });
  const json = (await res.json()) as ApiSuccess<T> | ApiFailure;
  if (!res.ok || json.code !== 0) {
    const msg =
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : `请求失败 ${res.status}`;
    throw new ApiRequestError(msg, res.status);
  }
  return (json as ApiSuccess<T>).data;
}

/** Prompt 分页列表查询参数 */
export type PromptListQuery = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  /** 叶子分类 id（与 parentCategoryId 互斥，优先于 parentCategoryId） */
  categoryId?: number;
  /** 父分类 id：筛选其下所有直接子分类对应的 Prompt */
  parentCategoryId?: number;
  tagId?: number;
};

export function buildPromptListQuery(q: PromptListQuery): string {
  const p = new URLSearchParams();
  if (q.page) p.set("page", String(q.page));
  if (q.pageSize) p.set("pageSize", String(q.pageSize));
  if (q.keyword?.trim()) p.set("keyword", q.keyword.trim());
  if (q.categoryId) p.set("categoryId", String(q.categoryId));
  if (q.parentCategoryId) {
    p.set("parentCategoryId", String(q.parentCategoryId));
  }
  if (q.tagId) p.set("tagId", String(q.tagId));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function fetchPromptList(
  q: PromptListQuery,
  token?: string | null,
): Promise<PromptListData> {
  const query = buildPromptListQuery(q);
  return apiGet<PromptListData>(`/prompts${query}`, { token });
}

export async function fetchPromptDetail(
  id: number,
  token?: string | null,
): Promise<PromptDetail> {
  return apiGet<PromptDetail>(`/prompts/${id}`, { token });
}

export async function fetchCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/catalog/categories");
}

export async function fetchTags(): Promise<Tag[]> {
  return apiGet<Tag[]>("/catalog/tags");
}

/** 登录（客户端调用，邮箱 + 密码） */
export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginData> {
  const res = await fetch(`${getApiBase()}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json()) as ApiSuccess<LoginData> | ApiFailure;
  if (!res.ok || json.code !== 0) {
    const msg =
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : "登录失败";
    throw new Error(msg);
  }
  return (json as ApiSuccess<LoginData>).data;
}

/** 注册（客户端调用） */
export async function registerRequest(payload: {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): Promise<{ userId: number }> {
  const res = await fetch(`${getApiBase()}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiSuccess<{ userId: number }> | ApiFailure;
  if (!res.ok || json.code !== 0) {
    const msg =
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : "注册失败";
    throw new Error(msg);
  }
  return (json as ApiSuccess<{ userId: number }>).data;
}

/** POST JSON，用于点赞/收藏/评论等需登录接口 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: { token?: string | null },
): Promise<T> {
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as ApiSuccess<T> | ApiFailure;
  if (!res.ok || json.code !== 0) {
    const msg =
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : `请求失败 ${res.status}`;
    throw new ApiRequestError(msg, res.status);
  }
  return (json as ApiSuccess<T>).data;
}

/** DELETE，用于删除评论等 */
export async function apiDelete<T>(
  path: string,
  options?: { token?: string | null },
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });
  const json = (await res.json()) as ApiSuccess<T> | ApiFailure;
  if (!res.ok || json.code !== 0) {
    const msg =
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : `请求失败 ${res.status}`;
    throw new ApiRequestError(msg, res.status);
  }
  return (json as ApiSuccess<T>).data;
}

/** 切换点赞（需登录） */
export async function toggleLikeRequest(
  promptId: number,
  token: string,
): Promise<{ liked: boolean; likeCount: number }> {
  return apiPost<{ liked: boolean; likeCount: number }>(
    `/prompts/${promptId}/likes/toggle`,
    {},
    { token },
  );
}

/** 切换收藏（需登录） */
export async function toggleFavoriteRequest(
  promptId: number,
  token: string,
): Promise<{ favorited: boolean; favoriteCount: number }> {
  return apiPost<{ favorited: boolean; favoriteCount: number }>(
    `/prompts/${promptId}/favorites/toggle`,
    {},
    { token },
  );
}

/** 当前登录用户（需 token） */
export async function fetchCurrentUser(
  token: string,
): Promise<LoginData["user"]> {
  return apiGet<LoginData["user"]>("/users/me", { token });
}

/** 评论树 */
export async function fetchCommentTree(
  promptId: number,
): Promise<CommentTreeNode[]> {
  return apiGet<CommentTreeNode[]>(`/comments/tree?promptId=${promptId}`);
}

/** 发表评论 */
export async function createCommentRequest(
  payload: { promptId: number; content: string; parentId?: number },
  token: string,
): Promise<unknown> {
  return apiPost("/comments", payload, { token });
}

/** 删除评论 */
export async function deleteCommentRequest(
  commentId: number,
  token: string,
): Promise<{ deletedIds: number[] }> {
  return apiDelete<{ deletedIds: number[] }>(`/comments/${commentId}`, {
    token,
  });
}

/** 创建 Prompt（需登录，Bearer token） */
export async function createPromptRequest(
  payload: CreatePromptPayload,
  token: string,
): Promise<PromptDetail> {
  return apiPost<PromptDetail>("/prompts", payload, { token });
}
