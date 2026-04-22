import { apiRequest } from '@/lib/api';
import type { CategoryItem, TagItem } from '@/shared/types/domain';

export function fetchCategories() {
  return apiRequest<CategoryItem[]>('/catalog/categories');
}

export function fetchTags() {
  return apiRequest<TagItem[]>('/catalog/tags');
}

export function createCategory(
  token: string,
  payload: {
    name: string;
    description?: string;
    parentId?: number;
    sort?: number;
  },
) {
  return apiRequest<CategoryItem>('/catalog/categories', {
    method: 'POST',
    token,
    body: payload,
  });
}
