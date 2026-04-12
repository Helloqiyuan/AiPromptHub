import type { Category } from '../types'

export interface CategoryTree {
  root: Category
  level2: Category[]
  level3Map: Map<number, Category[]>
}

/**
 * 将扁平分类列表构建为三级树形结构
 * AIGC大类(id=1, parentId=-1) → 二级分类(parentId=1) → 三级分类(parentId=二级id)
 */
export function buildCategoryTree(categoryList: Category[]): CategoryTree {
  const root = categoryList.find(c => c.parentId === -1)!
  const level2 = categoryList.filter(c => c.parentId === root.id).sort((a, b) => a.sort - b.sort)
  const level3Map = new Map<number, Category[]>()

  for (const l2 of level2) {
    const children = categoryList
      .filter(c => c.parentId === l2.id)
      .sort((a, b) => a.sort - b.sort)
    level3Map.set(l2.id, children)
  }

  return { root, level2, level3Map }
}

/**
 * 根据分类 ID 获取所属的二级分类 ID
 */
export function getParentCategoryId(categoryId: number, tree: CategoryTree): number | null {
  for (const [l2Id, l3List] of tree.level3Map) {
    if (l3List.some(c => c.id === categoryId)) {
      return l2Id
    }
  }
  // 如果本身就是二级分类
  if (tree.level2.some(c => c.id === categoryId)) {
    return categoryId
  }
  return null
}
