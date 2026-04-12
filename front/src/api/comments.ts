import { deleteData, getData, postData } from './client';
import type { CommentNode } from '@/types/models';

/** 发表评论 */
export interface CreateCommentBody {
  promptId: number;
  content: string;
  parentId?: number;
}

/** 评论树 */
export function getCommentTree(promptId: number): Promise<CommentNode[]> {
  return getData('/api/comments/tree', { params: { promptId } });
}

/** 新增评论 */
export function createComment(body: CreateCommentBody): Promise<CommentNode> {
  return postData('/api/comments', body);
}

/** 删除评论（含子树由后端处理） */
export function deleteComment(id: number): Promise<{ deletedIds: number[] }> {
  return deleteData(`/api/comments/${id}`);
}
