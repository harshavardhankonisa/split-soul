import { db } from '../../services/dexie/client'

export const setupOnStartup = () => {
  chrome.runtime.onStartup.addListener(() => {
    db.open()
  })
}
