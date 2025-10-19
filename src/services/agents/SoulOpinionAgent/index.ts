import { LLM } from '@langchain/core/language_models/llms'

export class SoulOpinionAgent extends LLM {
  _llmType() {
    return 'chrome-prompt'
  }

  async _call(prompt: string): Promise<string> {
    try {
      // @ts-expect-error - Chrome LanguageModel API
      const availability = await window.LanguageModel?.availability?.()
      if (availability === 'unavailable') {
        return 'Chrome LanguageModel not available on this device'
      }

      // @ts-expect-error - Chrome LanguageModel API
      const session = await window.LanguageModel.create()
      const response = await session.prompt(prompt)
      session.destroy()
      return response
    } catch (error) {
      console.error('SoulOpinion failed:', error)
      return 'Chrome LanguageModel API not available or failed'
    }
  }
}
