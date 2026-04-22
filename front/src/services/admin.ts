import { apiRequest } from '@/lib/api';
import type { PagedData } from '@/shared/types/api';
import type { AdminStats, PromptItem, PromptStatus, UserProfile, UserRole, UserStatus } from '@/shared/types/domain';

export function fetchAdminStats(token: string) {
  return apiRequest<AdminStats>('/admin/stats', { token });
}

export function fetchAdminPrompts(
  token: string,
  query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    categoryId?: number | null;
    parentCategoryId?: number | null;
    tagId?: number | null;
    status?: PromptStatus | '';
  },
) {
  return apiRequest<PagedData<PromptItem>>('/admin/prompts', {
    token,
    query,
  });
}

export function updateAdminPromptStatus(token: string, promptId: number, status: PromptStatus) {
  return apiRequest<PromptItem>(`/admin/prompts/${promptId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}

export function deleteAdminPrompt(token: string, promptId: number) {
  return apiRequest<{ id: number }>(`/admin/prompts/${promptId}`, {
    method: 'DELETE',
    token,
  });
}

export function fetchAdminUsers(
  token: string,
  query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    role?: UserRole | '';
    status?: UserStatus | '';
  },
) {
  return apiRequest<PagedData<UserProfile>>('/admin/users', {
    token,
    query,
  });
}

export function updateAdminUserRole(token: string, userId: number, role: UserRole) {
  return apiRequest<UserProfile>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    token,
    body: { role },
  });
}

export function updateAdminUserStatus(token: string, userId: number, status: UserStatus) {
  return apiRequest<UserProfile>(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}
