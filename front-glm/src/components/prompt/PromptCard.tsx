import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Star, MessageCircle } from 'lucide-react'
import type { Prompt } from '../../types'
import { formatRelativeTime, formatCount } from '../../utils/format'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

interface PromptCardProps {
  prompt: Prompt
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const navigate = useNavigate()

  return (
    <article
      onClick={() => navigate(`/prompt/${prompt.id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-400 cursor-pointer hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={prompt.image || `https://picsum.photos/seed/aiphub-${prompt.id}/800/500`}
          alt={prompt.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="active" size="sm">{prompt.category?.name || ''}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-h3 font-semibold text-warm-950 mb-2 group-hover:text-warm-700 transition-colors line-clamp-1">
          {prompt.title}
        </h3>

        {/* Summary */}
        <p className="text-body-sm text-beige-700 mb-4 line-clamp-2 leading-relaxed">
          {prompt.summary || prompt.content.replace(/\n/g, ' ').slice(0, 100) + '...'}
        </p>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {prompt.tags.slice(0, 3).map(tag => (
              <Badge key={tag.id} variant="muted" size="sm">{tag.name}</Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-beige-200/60">
          <div className="flex items-center gap-2">
            <Avatar src={prompt.author.avatar} username={prompt.author.username} size="sm" />
            <span className="text-body-sm text-warm-700">{prompt.author.username}</span>
            <span className="text-xs text-beige-600 ml-1">{formatRelativeTime(prompt.createTime)}</span>
          </div>
          <div className="flex items-center gap-3 text-beige-600">
            <span className="flex items-center gap-1 text-body-sm">
              <Heart className="w-4 h-4" />
              {formatCount(prompt.likeCount)}
            </span>
            <span className="flex items-center gap-1 text-body-sm">
              <Star className="w-4 h-4" />
              {formatCount(prompt.favoriteCount)}
            </span>
            <span className="flex items-center gap-1 text-body-sm hidden sm:flex">
              <MessageCircle className="w-4 h-4" />
              {prompt.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
