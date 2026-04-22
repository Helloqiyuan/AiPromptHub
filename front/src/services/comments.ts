import { apiRequest } from '@/lib/api';
import type { CommentItem } from '@/shared/types/domain';

export function fetchCommentTree(promptId: number) {
  return apiRequest<CommentItem[]>('/comments/tree', {
    query: { promptId },
  });
}

export function createComment(
  token: string,
  payload: {
    promptId: number;
    content: string;
    parentId?: number;
  },
) {
  return apiRequest<CommentItem>('/comments', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function deleteComment(token: string, commentId: number) {
  return apiRequest<{ deletedIds: number[] }>(`/comments/${commentId}`, {
    method: 'DELETE',
    token,
  });
}
