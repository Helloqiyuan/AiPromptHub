import { getData, postData } from './client';
import type { AiModel, Category, Tag } from '@/types/models';

/** 分类列表 */
export function listCategories(): Promise<Category[]> {
  return getData('/api/catalog/categories');
}

/** 标签列表 */
export function listTags(): Promise<Tag[]> {
  return getData('/api/catalog/tags');
}

/** 模型列表 */
export function listModels(): Promise<AiModel[]> {
  return getData('/api/catalog/models');
}

/** 管理员：新建分类 */
export function createCategory(body: { name: string; description?: string | null; sort?: number }): Promise<Category> {
  return postData('/api/catalog/categories', body);
}
