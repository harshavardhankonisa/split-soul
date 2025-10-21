export interface PromptOptions {
  temperature?: number
  topK?: number
  initialPrompts?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  responseConstraint?: Record<string, unknown>
  expectedInputs?: Array<{ type: 'text' | 'image' | 'audio'; languages: string[] }>
  expectedOutputs?: Array<{ type: 'text'; languages: string[] }>
}

export const PromptAPI = {
  async checkAvailability(): Promise<'available' | 'downloading' | 'unavailable'> {
    // @ts-expect-error - Chrome LanguageModel API
    return await window.LanguageModel?.availability?.()
  },

  async create(): Promise<void> {
    // @ts-expect-error - Chrome LanguageModel API
    await window.LanguageModel?.create?.({})
  },

  async prompt(text: string, options?: PromptOptions): Promise<string> {
    const createOptions: Record<string, unknown> = {
      temperature: options?.temperature,
      topK: options?.topK,
      initialPrompts: options?.initialPrompts || []
    }

    if (options?.expectedInputs) {
      createOptions.expectedInputs = options.expectedInputs
    }
    if (options?.expectedOutputs) {
      createOptions.expectedOutputs = options.expectedOutputs
    }

    // @ts-expect-error - Chrome LanguageModel API
    const session = await window.LanguageModel?.create?.(createOptions)
    const result = await session.prompt(text, {
      responseConstraint: options?.responseConstraint
    })
    session.destroy()
    return result
  }
}
