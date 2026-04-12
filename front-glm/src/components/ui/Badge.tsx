import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'active' | 'muted'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-all duration-200 cursor-default'

  const variants = {
    default: 'bg-beige-200/70 text-warm-800 border border-beige-300/50',
    active: 'bg-warm-500 text-white shadow-sm',
    muted: 'bg-accent-lavender text-warm-800',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-body-sm',
  }

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}
