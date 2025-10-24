import type { Priority } from './common'

// Souls + (Main Soul, Main Body)(default)
export interface User {
  id: number // unique
  username: string // unique
  description: string
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
  startTime: number // timestamp in milliseconds
  endTime: number // timestamp in milliseconds
  lastActivityTime: number // timestamp in milliseconds
  activeDuration: number
  createdAt: number // timestamp in milliseconds
  updatedAt: number // timestamp in milliseconds
  vector: number[]
}

// Chat Fields
export interface Chat {
  id: number
  username: string // username
  message: string
  createdAt: number // timestamp in milliseconds
  vector: number[]
}

// Action Fields
export interface Action {
  id: number
  description: string
  createdAt: number // timestamp in milliseconds
  priority: Priority
  isCompleted: boolean
  vector: number[]
}
