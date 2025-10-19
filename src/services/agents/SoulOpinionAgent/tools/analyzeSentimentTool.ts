import { DynamicTool } from '@langchain/core/tools'

export const analyzeSentimentTool = new DynamicTool({
  name: 'analyze_sentiment',
  description: 'Analyze the sentiment and emotion of a chat message.',
  func: async (input: string) => {
    // Basic keyword-based fallback
    const lower = input.toLowerCase()
    if (lower.includes('angry') || lower.includes('hate')) return 'Sentiment: Negative 😡'
    if (lower.includes('love') || lower.includes('happy')) return 'Sentiment: Positive 😊'
    if (lower.includes('ok') || lower.includes('fine')) return 'Sentiment: Neutral 😐'

    // If no keywords, ask LLM
    // @ts-expect-error Chrome LanguageModel API
    const session = await window.LanguageModel.create()
    const res = await session.prompt(`Analyze sentiment of this message: "${input}"`)
    session.destroy()
    return res
  }
})
