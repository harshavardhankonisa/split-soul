import { activityTracker } from '../services/activityTracker'
import { chatManager } from '../services/chatManager'

export const setupOnMessage = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ACTIVITY_TRACKER') {
      activityTracker.handleUserActivity(sender)
    }

    if (message.type === 'GET_CURRENT_TAB_INFO') {
      sendResponse(sender.tab)
    }

    if (message.type === 'MAIN_BODY_CHAT') {
      chatManager.addChat({
        username: 'Main Body',
        message
      })
    }

    return true
  })
}
