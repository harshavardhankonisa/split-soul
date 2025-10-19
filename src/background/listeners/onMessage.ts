import { activityTracker } from '../services/activityTracker'
import { mainSoulAgent } from '../services/mainSoulAgent'

export const setupOnMessage = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ACTIVITY_TRACKER') {
      activityTracker.handleUserActivity(sender)
      mainSoulAgent.receiveActivityHeartBeat()
    }

    if (message.type === 'GET_CURRENT_TAB_INFO') {
      sendResponse(sender.tab)
    }

    return true
  })
}
