import React from 'react'
import type { Category } from '../../types'
import Badge from '../ui/Badge'

interface SubCategoryFilterProps {
  categories: Category[]
  activeId: number | null
  onSelect: (id: number | null) => void
}

export default function SubCategoryFilter({ categories, activeId, onSelect }: SubCategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-body-sm text-beige-700 font-medium mr-1">子分类：</span>
      <button onClick={() => onSelect(null)} className="cursor-pointer">
        <Badge variant={activeId === null ? 'active' : 'default'}>全部</Badge>
      </button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => onSelect(cat.id)} className="cursor-pointer">
          <Badge variant={activeId === cat.id ? 'active' : 'default'}>{cat.name}</Badge>
        </button>
      ))}
    </div>
  )
}
