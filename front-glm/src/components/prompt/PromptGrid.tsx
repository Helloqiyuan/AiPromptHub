import React from 'react'
import type { Prompt } from '../../types'
import PromptCard from './PromptCard'

interface PromptGridProps {
  prompts: Prompt[]
}

export default function PromptGrid({ prompts }: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-beige-200/70 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-h3 font-semibold text-warm-800 mb-2">没有找到相关 Prompt</h3>
        <p className="text-body text-beige-700">试试调整筛选条件或搜索关键词吧</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {prompts.map(prompt => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  )
}
