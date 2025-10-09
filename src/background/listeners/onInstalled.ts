import { db } from '../../services/dexie/client'

export const setupOnInstalled = () => {
  chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed → Initializing DB...')
    try {
      await db.open()
      console.log('Dexie DB initialized successfully')
    } catch (err) {
      console.error('Failed to initialize Dexie DB', err)
    }
    try {
      // TODO: seed default values into db
    } catch (err) {
      console.error('', err)
    }
    console.log('DB seeded successfully')
  })
}
