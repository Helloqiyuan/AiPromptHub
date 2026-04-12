/** 与后端 user.role 对齐 */
export type UserRole = 'user' | 'admin' | 'super_admin';

/** 与后端 user.status 对齐 */
export type UserStatus = 'active' | 'disabled';

/** 用户信息（列表/详情通用字段） */
export interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  createTime?: string;
  updateTime?: string;
  stats?: {
    promptCount: number;
    favoriteCount: number;
    commentCount: number;
  };
}

/** Prompt 状态 */
export type PromptStatus = 'published' | 'pending' | 'rejected' | 'archived';

/** 分类 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  /** 父级分类 id，-1 表示根节点 */
  parentId: number;
  sort: number;
}

/** 标签 */
export interface Tag {
  id: number;
  name: string;
}

/** AI 模型目录项 */
export interface AiModel {
  id: number;
  name: string;
  vendor: string | null;
  description: string | null;
}

/** Prompt 列表/详情主体 */
export interface Prompt {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  usageScenario: string | null;
  exampleInput: string | null;
  exampleOutput: string | null;
  userId: number;
  categoryId: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  status: PromptStatus;
  createTime?: string;
  updateTime?: string;
  author?: Pick<User, 'id' | 'username' | 'avatar'>;
  category?: Category;
  tags?: Tag[];
  models?: AiModel[];
  liked?: boolean;
  favorited?: boolean;
}

/** 后端统一分页元数据 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 列表接口返回结构（buildPaginationResult） */
export interface PaginatedResult<T> {
  list: T[];
  pagination: PaginationMeta;
}

/** 评论节点（树由后端 buildCommentTree 生成） */
export interface CommentNode {
  id: number;
  promptId: number;
  userId: number;
  parentId: number;
  replyUserId: number | null;
  content: string;
  createTime?: string;
  updateTime?: string;
  author?: Pick<User, 'id' | 'username' | 'avatar'>;
  replyUser?: Pick<User, 'id' | 'username' | 'avatar'> | null;
  children?: CommentNode[];
}

/** 「我的评论」列表单项（含关联 Prompt） */
export interface MyCommentRow {
  id: number;
  promptId: number;
  userId: number;
  parentId: number;
  content: string;
  createTime?: string;
  prompt?: { id: number; title: string; status: string };
}

/** 管理端仪表盘统计 */
export interface AdminStats {
  userCount: number;
  adminCount: number;
  categoryCount: number;
  tagCount: number;
  modelCount: number;
  promptCount: number;
  commentCount: number;
  favoriteCount: number;
  likeCount: number;
}
