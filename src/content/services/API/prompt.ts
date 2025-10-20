import { PromptAPI } from '../../../services/API/prompt'

class PromptHandler {
  constructor() {
    this.setupMessageListener()
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'PROMPT_REQUEST') {
        Promise.resolve(PromptAPI.prompt(message.text, message.options))
          .then(response => {
            sendResponse({ success: true, response })
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message })
          })
        return true
      }
    })
  }
}

export const promptHandler = new PromptHandler()
