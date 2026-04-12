import { ApiException } from '@/api/client';

/** 将未知错误转为用户可读文案 */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiException) return e.message;
  if (e instanceof Error) return e.message;
  return '未知错误';
}
