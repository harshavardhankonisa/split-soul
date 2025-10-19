export interface WriterOptions {
  tone?: 'formal' | 'neutral' | 'casual'
  format?: 'markdown' | 'plain-text'
  length?: 'short' | 'medium' | 'long'
  sharedContext?: string
}

export const WriterAPI = {
  async checkAvailability(): Promise<'available' | 'downloading' | 'unavailable'> {
    // @ts-expect-error - Chrome Writer API
    return await window.Writer?.availability?.()
  },

  async write(prompt: string, options?: WriterOptions): Promise<string> {
    // @ts-expect-error - Chrome Writer API
    const writer = await window.Writer?.create?.(options)
    const content = await writer.write(prompt)
    writer.destroy()
    return content
  }
}
