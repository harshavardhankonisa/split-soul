import Dexie from 'dexie'
import type { User, Activity, Chat, Action } from '../../interface/database'

export class SplitSoulDB extends Dexie {
  users!: Dexie.Table<User, number>
  activities!: Dexie.Table<Activity, number>
  chats!: Dexie.Table<Chat, number>
  actions!: Dexie.Table<Action, number>

  constructor() {
    super('split_soul_db')
    this.version(1).stores({
      users: '++id, &username, description, avatarUrl, isActive, vector',
      activities:
        '++id, tabId, websiteTitle, websiteUrl, isActive, startTime, endTime, lastActivityTime, activeDuration, createdAt, updatedAt, vector',
      chats: '++id, username, message, createdAt, vector',
      actions: '++id, description, createdAt, priority, isCompleted, vector'
    })
  }
}

export const db = new SplitSoulDB()
