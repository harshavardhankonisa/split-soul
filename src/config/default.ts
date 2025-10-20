import type { User } from '../interface/database'

export const defaultUsers: Omit<User, 'id'>[] = [
  {
    username: 'Main Body',
    description: 'Human user; central persona that drives chats and reviews agent suggestions.',
    avatarUrl: '',
    isActive: true,
    vector: []
  },
  {
    username: 'Main Soul',
    description:
      'Primary agent; posts 5-min updates, tracks activity, merges split-soul opinions, and drafts one agenda.',
    avatarUrl: '',
    isActive: true,
    vector: []
  }
]
