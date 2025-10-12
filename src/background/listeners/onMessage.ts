import { activityTracker } from '../services/activityTracker'
import { handleActivityAPICall } from '../services/activityAPI'
import { chatAgent } from '../services/chatManager'

export const setupOnMessage = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ACTIVITY_TRACKER') {
      activityTracker.handleUserActivity(sender)
    }

    if (message.type === 'ACTIVITY_API') {
      handleActivityAPICall(message.method, message.params)
        .then((result: unknown) => sendResponse({ success: true, data: result }))
        .catch((error: Error) => sendResponse({ success: false, error: error.message }))
    }

    if (message.type === 'GET_CURRENT_TAB_INFO') {
      sendResponse(sender.tab)
    }

    if (message.type === 'TRIGGER_CHAT_REFRESH') {
      chatAgent.refreshSouls()
    }

    return true
  })
}
