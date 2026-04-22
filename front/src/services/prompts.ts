import { apiRequest } from '@/lib/api';
import type { PagedData } from '@/shared/types/api';
import type { CommentItem, PromptFormPayload, PromptItem } from '@/shared/types/domain';

export interface PromptQuery extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number | null;
  parentCategoryId?: number | null;
  tagId?: number | null;
  status?: string;
}

function buildPromptPayload(payload: PromptFormPayload) {
  return {
    title: payload.title,
    summary: payload.summary || null,
    image: payload.image || null,
    content: payload.content,
    usageScenario: payload.usageScenario || null,
    exampleInput: payload.exampleInput || null,
    exampleOutput: payload.exampleOutput || null,
    categoryId: payload.categoryId ?? undefined,
    tagIds: payload.tagIds,
  };
}

export function fetchPrompts(query: PromptQuery, token?: string | null) {
  return apiRequest<PagedData<PromptItem>>('/prompts', {
    token,
    query,
  });
}

export function fetchPromptDetail(promptId: number, token?: string | null) {
  return apiRequest<PromptItem>(`/prompts/${promptId}`, {
    token,
  });
}

export function createPrompt(token: string, payload: PromptFormPayload) {
  return apiRequest<PromptItem>('/prompts', {
    method: 'POST',
    token,
    body: buildPromptPayload(payload),
  });
}

export function updatePrompt(token: string, promptId: number, payload: PromptFormPayload) {
  return apiRequest<PromptItem>(`/prompts/${promptId}`, {
    method: 'PUT',
    token,
    body: buildPromptPayload(payload),
  });
}

export function deletePrompt(token: string, promptId: number) {
  return apiRequest<{ id: number }>(`/prompts/${promptId}`, {
    method: 'DELETE',
    token,
  });
}

export function togglePromptLike(token: string, promptId: number) {
  return apiRequest<{ liked: boolean; likeCount: number }>(`/prompts/${promptId}/likes/toggle`, {
    method: 'POST',
    token,
  });
}

export function togglePromptFavorite(token: string, promptId: number) {
  return apiRequest<{ favorited: boolean; favoriteCount: number }>(`/prompts/${promptId}/favorites/toggle`, {
    method: 'POST',
    token,
  });
}

export function fetchMyPrompts(token: string, query: PromptQuery) {
  return apiRequest<PagedData<PromptItem>>('/users/me/prompts', {
    token,
    query,
  });
}

export function fetchMyFavorites(token: string, query: Pick<PromptQuery, 'page' | 'pageSize'>) {
  return apiRequest<PagedData<PromptItem>>('/users/me/favorites', {
    token,
    query,
  });
}

export function fetchMyComments(token: string, query: Pick<PromptQuery, 'page' | 'pageSize'>) {
  return apiRequest<PagedData<CommentItem>>('/users/me/comments', {
    token,
    query,
  });
}

