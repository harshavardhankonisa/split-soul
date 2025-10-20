/**
 * AIAPIBridge - Communicates with content script to use AI API
 * Background script can't access window.Summarizer, so we delegate to an offscreen document
 */

export class AiApiBridge {
  private static instance: AiApiBridge
  private idleTimer?: number

  static getInstance(): AiApiBridge {
    if (!AiApiBridge.instance) {
      AiApiBridge.instance = new AiApiBridge()
    }
    return AiApiBridge.instance
  }

  private scheduleClose(ms = 30000) {
    if (this.idleTimer) clearTimeout(this.idleTimer as unknown as number)
    this.idleTimer = setTimeout(() => {
      chrome.offscreen?.closeDocument?.()
    }, ms) as unknown as number
  }

  private async ensureOffscreen(): Promise<void> {
    const has = await chrome.offscreen?.hasDocument?.()
    if (!has) {
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('src/offscreen/index.html'),
        reasons: ['DOM_PARSER'],
        justification: 'Run AI APIs in hidden window'
      })
    }
  }

  private async sendToOffscreen<T = unknown>(type: string, payload: Record<string, unknown>): Promise<T> {
    await this.ensureOffscreen()
    return await new Promise<T>((resolve, reject) => {
      chrome.runtime.sendMessage({ type, ...payload }, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (response && response.success) {
          this.scheduleClose()
          resolve(response as T)
        } else {
          reject(new Error(response?.error || 'AI request failed'))
        }
      })
    })
  }

  // Summarizer
  async summarize(
    text: string,
    options?: { type?: string; format?: string; length?: string; context?: string }
  ): Promise<string> {
    const resp = await this.sendToOffscreen<{ success: true; summary: string }>('SUMMARIZE_REQUEST', { text, options })
    return resp.summary
  }

  // Prompt
  async prompt(text: string, options?: Record<string, unknown>): Promise<string> {
    const resp = await this.sendToOffscreen<{ success: true; response: string }>('PROMPT_REQUEST', { text, options })
    return resp.response
  }

  // Proofreader
  async proofread(text: string, options?: Record<string, unknown>): Promise<unknown> {
    const resp = await this.sendToOffscreen<{ success: true; result: unknown }>('PROOFREAD_REQUEST', { text, options })
    return resp.result
  }

  // Translator
  async translate(text: string, options: { sourceLanguage: string; targetLanguage: string }): Promise<string> {
    const resp = await this.sendToOffscreen<{ success: true; result: string }>('TRANSLATE_REQUEST', { text, options })
    return resp.result
  }

  // Writer
  async write(text: string, options?: Record<string, unknown>): Promise<string> {
    const resp = await this.sendToOffscreen<{ success: true; content: string }>('WRITE_REQUEST', { text, options })
    return resp.content
  }

  // Rewriter
  async rewrite(text: string, options?: Record<string, unknown>): Promise<string> {
    const resp = await this.sendToOffscreen<{ success: true; result: string }>('REWRITE_REQUEST', { text, options })
    return resp.result
  }
}

export const aiApiBridge = AiApiBridge.getInstance()
