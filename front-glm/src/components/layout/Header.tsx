import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, Search, User, LogIn } from 'lucide-react'
import SearchInput from '../ui/SearchInput'

interface HeaderProps {
  searchValue: string
  onSearchChange: (value: string) => void
}

export default function Header({ searchValue, onSearchChange }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-xl border-b border-beige-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-warm-500 to-warm-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-h3 font-bold text-warm-900 hidden sm:block tracking-tight">
            AI Prompt <span className="text-warm-600">Hub</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-lg hidden md:block">
          <SearchInput value={searchValue} onChange={onSearchChange} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">登录</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-beige-300 to-beige-400 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <User className="w-4.5 h-4.5 text-warm-800" />
          </button>
        </div>
      </div>
    </header>
  )
}
