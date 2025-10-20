import { WriterAPI } from '../../../services/API/writer'

class WriterHandler {
  constructor() {
    this.setupMessageListener()
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'WRITE_REQUEST') {
        Promise.resolve(WriterAPI.write(message.text, message.options))
          .then(content => {
            sendResponse({ success: true, content })
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message })
          })
        return true
      }
    })
  }
}

export const writerHandler = new WriterHandler()
