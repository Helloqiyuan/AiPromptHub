export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'disabled';
export type PromptStatus = 'published' | 'pending' | 'rejected' | 'archived';

export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  deleted?: boolean;
  createTime?: string;
  updateTime?: string;
  stats?: {
    promptCount: number;
    favoriteCount: number;
    commentCount: number;
  };
}

export interface PromptAuthor {
  id: number;
  username: string;
  avatar: string | null;
  role: UserRole;
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string | null;
  parentId: number;
  sort: number;
  deleted?: boolean;
}

export interface TagItem {
  id: number;
  name: string;
}

export interface PromptItem {
  id: number;
  title: string;
  summary: string | null;
  image: string | null;
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
  author: PromptAuthor;
  category: CategoryItem | null;
  tag: TagItem | null;
  tags: TagItem[];
  liked: boolean;
  favorited: boolean;
}

export interface PromptFormPayload {
  title: string;
  summary: string;
  image: string;
  content: string;
  usageScenario: string;
  exampleInput: string;
  exampleOutput: string;
  categoryId: number | null;
  tagIds: number[];
}

export interface CommentUser {
  id: number;
  username: string;
  avatar: string | null;
  role?: UserRole;
}

export interface CommentItem {
  id: number;
  promptId: number;
  userId: number;
  parentId: number;
  replyUserId: number | null;
  content: string;
  createTime: string;
  updateTime?: string;
  author: CommentUser | null;
  replyUser: CommentUser | null;
  children: CommentItem[];
  prompt?: {
    id: number;
    title: string;
    status: PromptStatus;
  } | null;
}

export interface AdminStats {
  userCount: number;
  adminCount: number;
  categoryCount: number;
  promptCount: number;
  commentCount: number;
  favoriteCount: number;
  likeCount: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone?: string;
}

export interface LoginResult {
  token: string;
  user: UserProfile;
}
