import { getData, postData, putData } from './client';
import type { MyCommentRow, PaginatedResult, Prompt, User } from '@/types/models';

/** 注册请求体 */
export interface RegisterBody {
  username: string;
  password: string;
  email?: string | null;
  phone?: string | null;
}

/** 登录请求体：用户名或 account（邮箱/手机）二选一 + 密码 */
export interface LoginBody {
  username?: string;
  account?: string;
  password: string;
}

/** 登录响应 */
export interface LoginResult {
  token: string;
  user: User;
}

/** 更新个人资料 */
export interface UpdateProfileBody {
  username?: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
}

/** 注册 */
export function register(body: RegisterBody): Promise<{ userId: number }> {
  return postData('/api/users/register', body);
}

/** 登录 */
export function login(body: LoginBody): Promise<LoginResult> {
  return postData('/api/users/login', body);
}

/** 当前用户详情（含 stats） */
export function getMe(): Promise<User> {
  return getData('/api/users/me');
}

/** 更新当前用户 */
export function updateMe(body: UpdateProfileBody): Promise<User> {
  return putData('/api/users/me', body);
}

/** 我的发布（分页参数与后端 listPrompts 一致，且 mine 由后端强制） */
export function getMyPrompts(params: Record<string, unknown>): Promise<PaginatedResult<Prompt>> {
  return getData('/api/users/me/prompts', { params });
}

/** 我的收藏 */
export function getMyFavorites(params: Record<string, unknown>): Promise<PaginatedResult<Prompt>> {
  return getData('/api/users/me/favorites', { params });
}

/** 我的评论（行内带 prompt 摘要） */
export function getMyComments(params: Record<string, unknown>): Promise<PaginatedResult<MyCommentRow>> {
  return getData('/api/users/me/comments', { params });
}
