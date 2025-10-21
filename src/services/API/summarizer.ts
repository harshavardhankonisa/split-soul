export interface SummarizerOptions {
  type?: 'key-points' | 'tldr' | 'teaser' | 'headline'
  format?: 'markdown' | 'plain-text'
  length?: 'short' | 'medium' | 'long'
  sharedContext?: string
}

export const SummarizerAPI = {
  async checkAvailability(): Promise<'available' | 'downloading' | 'unavailable'> {
    // @ts-expect-error - Chrome Summarizer API
    return await window.Summarizer?.availability?.()
  },

  async create(): Promise<void> {
    // @ts-expect-error - Chrome Summarizer API
    await window.Summarizer?.create?.({})
  },

  async summarize(text: string, options?: SummarizerOptions & { context?: string }): Promise<string> {
    // @ts-expect-error - Chrome Summarizer API
    const summarizer = await window.Summarizer?.create?.({
      type: options?.type || 'key-points',
      format: options?.format || 'markdown',
      length: options?.length || 'medium',
      sharedContext: options?.sharedContext
    })
    const result = await summarizer.summarize(text, { context: options?.context })
    summarizer.destroy()
    return result
  }
}
