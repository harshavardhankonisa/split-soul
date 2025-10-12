import type { User } from '../../interface/database'
import { createUser } from '../../services/dexie/collections/user'

export const seedDefaultData = async () => {
  const defaultUsers: Omit<User, 'id'>[] = [
    {
      username: 'Main Body',
      description: 'The primary user of the extension',
      avatarUrl: '',
      createdAt: new Date(),
      modifiedAt: new Date(),
      isActive: true,
      isEditable: false,
      vector: []
    },
    {
      username: 'Main Soul',
      description: 'The primary agent that manages and observes activity patterns',
      avatarUrl: '',
      createdAt: new Date(),
      modifiedAt: new Date(),
      isActive: true,
      isEditable: false,
      vector: []
    }
  ]
  for (const user of defaultUsers) {
    await createUser(user)
  }
}
