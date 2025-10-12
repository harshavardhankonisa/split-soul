import Dexie from 'dexie'
import type { User, Activity, Chat, Action, Task, Vote } from '../../interface/database'

export class SplitSoulDB extends Dexie {
  users!: Dexie.Table<User, number>
  activities!: Dexie.Table<Activity, number>
  chats!: Dexie.Table<Chat, number>
  actions!: Dexie.Table<Action, number>
  tasks!: Dexie.Table<Task, number>
  votes!: Dexie.Table<Vote, number>

  constructor() {
    super('split_soul_db')
    this.version(1).stores({
      users: '++id, username, createdAt, vector',
      activities:
        '++id, tabId, websiteTitle, websiteUrl, isActive, startTime, endTime, lastActivityTime, activeDuration, createdAt, updatedAt, vector',
      chats: '++id, user.id, createdAt, vector',
      actions: '++id, createdAt, createdBy, vector',
      tasks: '++id, createdAt, modifiedAt, status, vector',
      votes: '++id, createdAt, status'
    })
  }
}

export const db = new SplitSoulDB()
