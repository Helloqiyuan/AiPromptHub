import { apiRequest } from '@/lib/api';
import type { LoginPayload, LoginResult, RegisterPayload, UserProfile } from '@/shared/types/domain';

export function login(payload: LoginPayload) {
  return apiRequest<LoginResult>('/users/login', {
    method: 'POST',
    body: payload,
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<{ userId: number }>('/users/register', {
    method: 'POST',
    body: payload,
  });
}

export function fetchMe(token: string) {
  return apiRequest<UserProfile>('/users/me', {
    token,
  });
}

export function updateMe(
  token: string,
  payload: Pick<UserProfile, 'username' | 'email' | 'phone' | 'avatar' | 'bio'>,
) {
  return apiRequest<UserProfile>('/users/me', {
    method: 'PUT',
    token,
    body: payload,
  });
}
