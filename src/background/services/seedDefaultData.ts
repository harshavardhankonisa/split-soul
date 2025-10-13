import type { User } from '../../interface/database'
import { createUser } from '../../services/dexie/collections/user'

export const seedDefaultData = async () => {
  const defaultUsers: Omit<User, 'id'>[] = [
    {
      username: 'Main Body',
      description: 'The primary user of the extension',
      avatarUrl: '',
      isActive: true,
      vector: []
    },
    {
      username: 'Main Soul',
      description: 'The primary agent that manages and observes activity patterns',
      avatarUrl: '',
      isActive: true,
      vector: []
    }
  ]
  for (const user of defaultUsers) {
    await createUser(user)
  }
}
