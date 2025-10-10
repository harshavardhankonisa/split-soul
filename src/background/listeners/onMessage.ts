import { activityTracker } from '../services/activityTracker'
import { handleActivityAPICall } from '../services/activityAPI'

export const setupOnMessage = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'USER_ACTIVITY') {
      if (sender.tab?.id) {
        activityTracker.handleUserActivity(sender.tab.id)
      }
    }

    if (message.type === 'ACTIVITY_API') {
      handleActivityAPICall(message.method, message.params)
        .then((result: unknown) => sendResponse({ success: true, data: result }))
        .catch((error: Error) => sendResponse({ success: false, error: error.message }))
    }

    return true
  })
}
