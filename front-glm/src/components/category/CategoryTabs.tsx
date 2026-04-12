import React from 'react'
import type { Category } from '../../types'

// 二级分类图标映射
const categoryIcons: Record<number, string> = {
  2: '✍️', // 文本生成
  3: '🎨', // 图像生成
  4: '🎵', // 音频生成
  5: '🎬', // 视频生成
  6: '💻', // 代码生成
}

interface CategoryTabsProps {
  categories: Category[]
  activeId: number | null
  onSelect: (id: number | null) => void
}

export default function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-body-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
          activeId === null
            ? 'bg-warm-500 text-white shadow-sm shadow-warm-500/25'
            : 'text-warm-700 hover:bg-beige-200/70'
        }`}
      >
        全部
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-body-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
            activeId === cat.id
              ? 'bg-warm-500 text-white shadow-sm shadow-warm-500/25'
              : 'text-warm-700 hover:bg-beige-200/70'
          }`}
        >
          <span className="text-base">{categoryIcons[cat.id] || '📌'}</span>
          {cat.name}
        </button>
      ))}
    </div>
  )
}
