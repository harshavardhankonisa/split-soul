import { TranslatorAPI } from '../../../services/API/translator'

class TranslatorHandler {
  constructor() {
    this.setupMessageListener()
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'TRANSLATE_REQUEST') {
        Promise.resolve(TranslatorAPI.translate(message.text, message.options))
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

export const translatorHandler = new TranslatorHandler()
