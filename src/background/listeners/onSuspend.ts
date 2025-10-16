import { db } from '../../services/dexie/client'
import { activityTracker } from '../services/activityTracker'

export const setupOnSuspend = () => {
  chrome.runtime.onSuspend.addListener(async () => {
    await activityTracker.shutdown()
    db.close()
  })

  chrome.runtime.onSuspendCanceled.addListener(() => {
    db.open()
  })
}
