import { deleteData, getData, postData, putData } from './client';
import type { PaginatedResult, Prompt, PromptStatus } from '@/types/models';

/** 列表查询参数（与 promptService.listPrompts 对齐） */
export interface PromptListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  modelId?: number;
  userId?: number;
  mine?: boolean | number;
  status?: PromptStatus;
}

/** Prompt 创建体 */
export interface CreatePromptBody {
  title: string;
  content: string;
  summary?: string | null;
  usageScenario?: string | null;
  categoryId?: number;
  tagIds?: number[];
  tags?: string[];
  modelIds?: number[];
  modelNames?: string[];
}

/** Prompt 更新体 */
export type UpdatePromptBody = Partial<CreatePromptBody> & {
  exampleInput?: string | null;
  exampleOutput?: string | null;
  status?: PromptStatus;
};

/** 分页列表 */
export function listPrompts(params: PromptListQuery): Promise<PaginatedResult<Prompt>> {
  const q: Record<string, string | number | boolean | undefined> = { ...params };
  if (params.mine === true) q.mine = 1;
  return getData('/api/prompts', { params: q });
}

/** 详情 */
export function getPrompt(id: number): Promise<Prompt> {
  return getData(`/api/prompts/${id}`);
}

/** 创建 */
export function createPrompt(body: CreatePromptBody): Promise<Prompt> {
  return postData('/api/prompts', body);
}

/** 更新 */
export function updatePrompt(id: number, body: UpdatePromptBody): Promise<Prompt> {
  return putData(`/api/prompts/${id}`, body);
}

/** 删除 */
export function deletePrompt(id: number): Promise<{ id: number }> {
  return deleteData(`/api/prompts/${id}`);
}

/** 点赞切换 */
export function toggleLike(id: number): Promise<{ liked: boolean; likeCount: number }> {
  return postData(`/api/prompts/${id}/likes/toggle`);
}

/** 收藏切换 */
export function toggleFavorite(id: number): Promise<{ favorited: boolean; favoriteCount: number }> {
  return postData(`/api/prompts/${id}/favorites/toggle`);
}
