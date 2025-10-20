/**
 * AIAPIBridge - Communicates with content script to use AI API
 * Background script can't access window.Summarizer, so we delegate to content script
 */

import ActivityUtils from '../../utils/activity'

export class AiApiBridge {
  private static instance: AiApiBridge

  static getInstance(): AiApiBridge {
    if (!AiApiBridge.instance) {
      AiApiBridge.instance = new AiApiBridge()
    }
    return AiApiBridge.instance
  }

  private async getUsableTab(): Promise<chrome.tabs.Tab> {
    const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
    let tab: chrome.tabs.Tab | undefined = active
    if (!tab || !ActivityUtils.shouldTrackUrl(tab.url || '')) {
      const allTabs = await chrome.tabs.query({})
      tab = allTabs.find(t => ActivityUtils.shouldTrackUrl(t.url || ''))
    }
    if (!tab || !tab.id) throw new Error('No suitable tab found for AI request')
    return tab
  }

  private async sendToContent<T = unknown>(type: string, payload: Record<string, unknown>): Promise<T> {
    const tab = await this.getUsableTab()

    return new Promise<T>((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id!, { type, ...payload }, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
          return
        }
        if (response && response.success) {
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
    const resp = await this.sendToContent<{ success: true; summary: string }>('SUMMARIZE_REQUEST', { text, options })
    return resp.summary
  }

  // Prompt
  async prompt(text: string, options?: Record<string, unknown>): Promise<string> {
    const resp = await this.sendToContent<{ success: true; response: string }>('PROMPT_REQUEST', { text, options })
    return resp.response
  }

  // Proofreader
  async proofread(text: string, options?: Record<string, unknown>): Promise<unknown> {
    const resp = await this.sendToContent<{ success: true; result: unknown }>('PROOFREAD_REQUEST', { text, options })
    return resp.result
  }

  // Translator
  async translate(text: string, options: { sourceLanguage: string; targetLanguage: string }): Promise<string> {
    const resp = await this.sendToContent<{ success: true; result: string }>('TRANSLATE_REQUEST', { text, options })
    return resp.result
  }

  // Writer
  async write(text: string, options?: Record<string, unknown>): Promise<string> {
    const resp = await this.sendToContent<{ success: true; content: string }>('WRITE_REQUEST', { text, options })
    return resp.content
  }

  // Rewriter
  async rewrite(text: string, options?: Record<string, unknown>): Promise<string> {
    const resp = await this.sendToContent<{ success: true; result: string }>('REWRITE_REQUEST', { text, options })
    return resp.result
  }
}

export const aiBridge = AiApiBridge.getInstance()
