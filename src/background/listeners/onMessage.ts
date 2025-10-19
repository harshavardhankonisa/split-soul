import { activityTracker } from '../services/activityTracker'
import { chatAgent } from '../services/chatManager'

export const setupOnMessage = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ACTIVITY_TRACKER') {
      activityTracker.handleUserActivity(sender)
      chatAgent.receiveActivityHeartBeat()
    }

    if (message.type === 'GET_CURRENT_TAB_INFO') {
      sendResponse(sender.tab)
    }

    return true
  })
}
