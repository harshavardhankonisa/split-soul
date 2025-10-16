import { defaultUsers } from '../../config/default'
import { createUser } from '../../services/dexie/collections/user'

export const seedDefaultData = async () => {
  for (const user of defaultUsers) {
    await createUser(user)
  }
}
