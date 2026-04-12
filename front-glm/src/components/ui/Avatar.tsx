import React from 'react'
import { User } from 'lucide-react'

interface AvatarProps {
  src: string | null | undefined
  username: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
}

export default function Avatar({ src, username, size = 'md', className = '' }: AvatarProps) {
  const initial = (username || '?').charAt(0).toUpperCase()
  const colors = [
    'bg-[#D4C4A7]', 'bg-[#A8B5A0]', 'bg-[#B8A090]',
    'bg-[#9BAEC8]', 'bg-[#C4AD9E]', 'bg-[#8FA998]',
  ]
  const colorIndex = (username?.charCodeAt(0) || 0) % colors.length

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-white/80 shadow-sm ${className}`}
      />
    )
  }

  return (
    <div className={`${sizeMap[size]} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold ring-2 ring-white/80 shadow-sm ${className}`}>
      {src ? null : initial}
      {!src && <User className="w-1/2 h-1/2 opacity-50" />}
    </div>
  )
}
