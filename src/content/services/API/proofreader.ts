import { ProofreaderAPI } from '../../../services/API/proofreader'

class ProofreaderHandler {
  constructor() {
    this.setupMessageListener()
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'PROOFREAD_REQUEST') {
        Promise.resolve(ProofreaderAPI.proofread(message.text, message.options))
          .then(result => {
            sendResponse({ success: true, result })
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message })
          })
        return true
      }
    })
  }
}

export const proofreaderHandler = new ProofreaderHandler()
