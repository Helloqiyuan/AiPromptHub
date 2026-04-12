/** 后端统一成功响应 */
export type ApiSuccess<T> = {
  code: 0;
  message: string;
  data: T;
};

/** 后端错误响应（见 back/src/middlewares/errorHandler.js） */
export type ApiFailure = {
  code: number;
  message: string;
  data: unknown;
};

export type UserLite = {
  id: number;
  username: string;
  avatar: string | null;
  role?: string;
};

export type Category = {
  id: number;
  name: string;
  description: string | null;
  parentId: number;
  sort: number;
};

export type Tag = {
  id: number;
  name: string;
};

/** 列表项中的 Prompt（与 Sequelize normalize 后字段一致） */
export type PromptListItem = {
  id: number;
  title: string;
  summary: string | null;
  /** 封面图 URL，无则前端用渐变占位 */
  image: string | null;
  userId: number;
  categoryId: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  status: string;
  createTime: string;
  updateTime: string;
  author?: UserLite;
  category?: Category | null;
  tags: Tag[];
  tag: Tag | null;
  liked?: boolean;
  favorited?: boolean;
};

/** 详情含正文 */
export type PromptDetail = PromptListItem & {
  content: string;
  usageScenario: string | null;
  exampleInput: string | null;
  exampleOutput: string | null;
  models: unknown[];
};

/** 创建 Prompt 请求体（与后端 POST /prompts 校验一致） */
export type CreatePromptPayload = {
  title: string;
  content: string;
  summary?: string | null;
  image?: string | null;
  usageScenario?: string | null;
  exampleInput?: string | null;
  exampleOutput?: string | null;
  categoryId?: number;
  tagIds?: number[];
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PromptListData = {
  list: PromptListItem[];
  pagination: Pagination;
};

export type LoginData = {
  token: string;
  user: UserLite & {
    email?: string | null;
    phone?: string | null;
    bio?: string | null;
    status?: string;
  };
};

/** 评论树节点（与后端 buildCommentTree 结构一致） */
export type CommentTreeNode = {
  id: number;
  promptId: number;
  userId: number;
  parentId: number;
  content: string;
  createTime: string;
  author?: UserLite | null;
  replyUser?: UserLite | null;
  children?: CommentTreeNode[];
};
