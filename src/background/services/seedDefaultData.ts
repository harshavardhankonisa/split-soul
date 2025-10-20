import { defaultUsers } from '../../config/default'
import { createUser } from '../../services/dexie/collections/user'
import { db } from '../../services/dexie/client'

export const seedDefaultData = async () => {
  for (const user of defaultUsers) {
    const exists = await db.users.where('username').equals(user.username).count()
    if (exists > 0) continue
    await createUser(user)
  }
}
