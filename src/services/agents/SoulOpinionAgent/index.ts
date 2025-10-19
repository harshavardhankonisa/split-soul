import { LLM } from '@langchain/core/language_models/llms'
import { PromptAPI } from '../../API/prompt'

export class SoulOpinionAgent extends LLM {
  _llmType() {
    return 'chrome-prompt'
  }

  async _call(prompt: string): Promise<string> {
    try {
      const response = await PromptAPI.prompt(prompt)
      return response
    } catch (error) {
      console.error('SoulOpinion failed:', error)
      return 'Chrome LanguageModel API not available or failed'
    }
  }
}
