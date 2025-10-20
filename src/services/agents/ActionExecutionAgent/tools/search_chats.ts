import type { Tool } from '../types'
import { searchChatsByVector } from '../../../dexie/collections/chat'

export const searchChatsTool: Tool = {
  name: 'search_chats',
  description: 'Semantic search across chats and return top matches.',
  inputSchema: '{ "query": string, "top?": number }',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { query, top } = typeof input === 'object' && input ? (input as any) : {}
    const q = (query || '').toString().trim()
    if (!q) return 'Invalid input: query is required.'
    const items = await searchChatsByVector(q)
    const res = items
      .slice(0, Math.max(1, Number(top) || 5))
      .map(c => `@${c.username}: ${c.message}`)
      .join('\n')
    return res || 'No chat matches found.'
  }
}
