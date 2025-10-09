import type { Priority } from './common'

// Souls, Main Soul, Main Body
export interface User {
  id: number
  username: string
  description: string
  avatarUrl: string
  createdAt: Date
  modifiedAt: Date
  isActive: boolean
  isEditable: boolean
  vector: number[]
}

// Activity Fields
export interface ActivityTag {
  id: number
  name: string
}

export interface ActivityTypes {
  id: number
  name: string
}

export interface ActivityActions {
  id: number
  name: string
}

export interface Activity {
  id: number
  type: ActivityTypes
  action: ActivityActions
  tags: ActivityTag[]
  createdAt: Date
  createdBy: string
  description: string
  vector: number[]
}

// Chat Fields
export interface Chat {
  id: number
  user: User
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

// Task Fields
export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  dueDate: Date | null
  createdAt: Date
  modifiedAt: Date
  vector: number[]
}

// Voting Fields
export interface Vote {
  id: number
  title: string
  description: string
  votes: {
    user: User
    vote: 'yes' | 'no' | 'abstain'
  }[]
  status: 'open' | 'closed'
  createdAt: Date
}
