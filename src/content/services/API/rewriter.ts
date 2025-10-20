import { RewriterAPI } from '../../../services/API/rewriter'

class RewriterHandler {
  constructor() {
    this.setupMessageListener()
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'REWRITE_REQUEST') {
        Promise.resolve(RewriterAPI.rewrite(message.text, message.options))
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

export const rewriterHandler = new RewriterHandler()
