import type { Tool } from '../types'
import { db } from '../../../dexie/client'
import { updateAction } from '../../../dexie/collections/action'

export const completeActionTool: Tool = {
  name: 'complete_action',
  description: 'Mark an action as completed by id or description match.',
  inputSchema: '{ "id?": number, "descriptionContains?": string } // Provide id or a substring to match',
  async execute(input: unknown): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { id, descriptionContains } = typeof input === 'object' && input ? (input as any) : {}

    if (typeof id === 'number') {
      const existing = await db.actions.get(id)
      if (!existing) return `Action #${id} not found.`
      await updateAction(id, { isCompleted: true })
      return `Marked action #${id} as completed.`
    }

    if (descriptionContains && typeof descriptionContains === 'string') {
      const candidates = await db.actions.toArray()
      const match = candidates.find(a => a.description.toLowerCase().includes(descriptionContains.toLowerCase()))
      if (!match) return `No action matching "${descriptionContains}".`
      await updateAction(match.id, { isCompleted: true })
      return `Marked action #${match.id} as completed.`
    }

    return 'Invalid input: provide id or descriptionContains.'
  }
}
