export interface RewriterOptions {
  tone?: 'more-formal' | 'as-is' | 'more-casual'
  format?: 'as-is' | 'markdown' | 'plain-text'
  length?: 'shorter' | 'as-is' | 'longer'
  sharedContext?: string
}

export const RewriterAPI = {
  async checkAvailability(): Promise<'available' | 'downloading' | 'unavailable'> {
    // @ts-expect-error - Chrome Rewriter API
    return await window.Rewriter?.availability?.()
  },

  async create(): Promise<void> {
    // @ts-expect-error - Chrome Rewriter API
    await window.Rewriter?.create?.({})
  },

  async rewrite(text: string, options?: RewriterOptions & { context?: string }): Promise<string> {
    // @ts-expect-error - Chrome Rewriter API
    const rewriter = await window.Rewriter?.create?.({
      tone: options?.tone,
      format: options?.format,
      length: options?.length,
      sharedContext: options?.sharedContext
    })
    const result = await rewriter.rewrite(text, { context: options?.context })
    rewriter.destroy()
    return result
  }
}
