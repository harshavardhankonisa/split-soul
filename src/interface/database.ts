import type { Priority } from './common'

// Souls + (Main Soul, Main Body)(default)
export interface User {
  id: number // unique
  username: string // unique
  description: string
  avatarUrl: string
  isActive: boolean
  vector: number[]
}

// Activity Fields
export interface Activity {
  id: number
  tabId: number
  websiteTitle: string
  websiteUrl: string
  isActive: boolean
  startTime: Date
  endTime: Date
  lastActivityTime: Date
  activeDuration: number
  createdAt: Date
  updatedAt: Date
  vector: number[]
}

// Chat Fields
export interface Chat {
  id: number
  user: string // user name
  message: string
  createdAt: Date
  vector: number[]
}

// Action Fields
export interface Action {
  id: number
  name: string
  description: string
  createdAt: Date
  createdBy: User
  priority: Priority
  isCompleted: boolean
  vector: number[]
}
