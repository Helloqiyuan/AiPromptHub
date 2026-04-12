import { deleteData, getData, patchData } from './client';
import type { AdminStats, PaginatedResult, Prompt, PromptStatus, User } from '@/types/models';

/** 管理端 Prompt 列表查询 */
export interface AdminPromptListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  modelId?: number;
  userId?: number;
  status?: PromptStatus;
}

/** 仪表盘统计 */
export function getAdminStats(): Promise<AdminStats> {
  return getData('/api/admin/stats');
}

/** Prompt 列表（管理员可见多状态） */
export function listAdminPrompts(params: AdminPromptListQuery): Promise<PaginatedResult<Prompt>> {
  return getData('/api/admin/prompts', { params });
}

/** 审核 Prompt 状态 */
export function reviewPrompt(id: number, status: PromptStatus): Promise<Prompt> {
  return patchData(`/api/admin/prompts/${id}/status`, { status });
}

/** 管理员删除 Prompt */
export function adminDeletePrompt(id: number): Promise<{ id: number }> {
  return deleteData(`/api/admin/prompts/${id}`);
}

/** 用户列表 */
export function listAdminUsers(params: Record<string, unknown>): Promise<PaginatedResult<User>> {
  return getData('/api/admin/users', { params });
}

/** 更新用户角色（仅 super_admin） */
export function adminUpdateUserRole(userId: number, role: string): Promise<User> {
  return patchData(`/api/admin/users/${userId}/role`, { role });
}

/** 更新用户状态 */
export function adminUpdateUserStatus(userId: number, status: string): Promise<User> {
  return patchData(`/api/admin/users/${userId}/status`, { status });
}
