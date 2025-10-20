import { SummarizerAPI } from '../../../services/API/summarizer'

class SummarizerHandler {
  constructor() {
    this.setupMessageListener()
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'SUMMARIZE_REQUEST') {
        Promise.resolve(SummarizerAPI.summarize(message.text, message.options))
          .then(summary => {
            sendResponse({ success: true, summary })
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message })
          })
        return true
      }
    })
  }
}

export const summarizerHandler = new SummarizerHandler()
