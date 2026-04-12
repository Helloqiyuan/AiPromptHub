// ===== 用户相关 =====
export interface User {
  id: number
  username: string
  email: string | null
  phone: string | null
  avatar: string | null
  bio: string | null
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'disabled'
  deleted: boolean
  createTime: string
  updateTime: string
}

export interface UserProfile extends User {
  stats: {
    promptCount: number
    favoriteCount: number
    commentCount: number
  }
}

// ===== 分类 =====
export interface Category {
  id: number
  name: string
  description: string | null
  parentId: number
  sort: number
  deleted: boolean
  createTime: string
  updateTime: string
  children?: Category[]
}

// ===== 标签 =====
export interface Tag {
  id: number
  name: string
  deleted: boolean
  createTime: string
  updateTime: string
}

// ===== 作者摘要 =====
export interface PromptAuthor {
  id: number
  username: string
  avatar: string | null
  role: string | null
}

// ===== Prompt =====
export interface Prompt {
  id: number
  title: string
  summary: string | null
  image: string | null
  content: string
  usageScenario: string | null
  exampleInput: string | null
  exampleOutput: string | null
  userId: number
  categoryId: number
  likeCount: number
  favoriteCount: number
  commentCount: number
  status: 'published' | 'pending' | 'rejected' | 'archived'
  deleted: boolean
  createTime: string
  updateTime: string
  author: PromptAuthor
  category: Category & { parentId: number }
  tag: Tag | null
  tags: Tag[]
  models: never[]
  liked: boolean
  favorited: boolean
}

// ===== 评论 =====
export interface Comment {
  id: number
  promptId: number
  userId: number
  parentId: number
  replyUserId: number | null
  content: string
  deleted: boolean
  createTime: string
  updateTime: string
  author: PromptAuthor
  replyUser: PromptAuthor | null
  children?: Comment[]
}

// ===== API 响应 =====
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginationData<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
