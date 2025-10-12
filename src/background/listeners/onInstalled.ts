import { db } from '../../services/dexie/client'
import { seedDefaultData } from '../services/seedDefaultData'

export const setupOnInstalled = () => {
  chrome.runtime.onInstalled.addListener(async () => {
    await db.open()
    await seedDefaultData()
  })
}
