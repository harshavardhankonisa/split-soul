import { activityTracker } from '../services/activityTracker'

export const setupOnSuspend = () => {
  chrome.runtime.onSuspend.addListener(async () => {
    console.log('Extension suspending - saving active activities...')
    try {
      await activityTracker.shutdown()
      console.log('Active activities saved successfully')
    } catch (error) {
      console.error('Failed to save activities during suspension:', error)
    }
  })

  chrome.runtime.onSuspendCanceled.addListener(() => {
    console.log('Extension suspension cancelled')
  })
}
