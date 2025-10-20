/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Tool } from '../types'
import { getAllActions } from '../../../dexie/collections/action'

export const listActionsTool: Tool = {
  name: 'list_actions',
  description: 'List recent actions from the local Dexie database.',
  inputSchema: '{ "limit?": number } // Optional max items to list',
  async execute(input: unknown): Promise<string> {
    const { limit } = typeof input === 'object' && input ? (input as any) : { limit: 10 }
    const actions = await getAllActions()
    const sorted = actions.sort((a, b) => (b.createdAt as any) - (a.createdAt as any))
    const slice = sorted.slice(0, Math.max(1, Number(limit) || 10))
    if (slice.length === 0) return 'No actions found.'
    return slice
      .map(a => `#${a.id} [${a.priority}] ${a.isCompleted ? 'Done' : 'Pending'} - ${a.description}`)
      .join('\n')
  }
}
