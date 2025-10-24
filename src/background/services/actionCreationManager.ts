import type { Action, User } from '../../interface/database'
import { createAction, getAllActions, updateAction } from '../../services/dexie/collections/action'
import { getAllUsers } from '../../services/dexie/collections/user'
import { aiApiBridge } from './aiApiBridge'
import { getToolsForPrompt } from '../../services/agents/ActionExecutionAgent'

export class ActionCreationManager {
  private async getActiveSplitSouls(): Promise<User[]> {
    const users = await getAllUsers()
    return users.filter(u => u.username !== 'Main Body' && u.username !== 'Main Soul' && u.isActive)
  }

  private async getActionSuggestionsForSoul(soul: User, message: string): Promise<string[]> {
    const toolsManifest = getToolsForPrompt()
    const prompt = `
      You are ${soul.username}. Role: ${soul.description}
      User message: "${message}"

      Available executable tools you can rely on:
      ${toolsManifest}

      Task: Suggest up to 2 concrete, user-facing actions that can be executed using one of the available tools above.
      Guidelines:
      - Ensure each action is practically executable by mapping to at least one tool's capability.
      - Be specific and succinct; include key arguments inline in natural language.
      - Output format: one action per line prefixed with "- ", plain English (no JSON, no tool call syntax).
    `

    const raw = await aiApiBridge.prompt(prompt)
    return raw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('- '))
      .map(l => l.replace(/^-\s+/, '').trim())
      .filter(Boolean)
      .slice(0, 2)
  }

  private async voteOnActions(users: User[], actions: string[]) {
    return Promise.all(
      actions.map(async desc => {
        let votes = 0
        const voters: string[] = []
        for (const user of users) {
          if (user.username === 'Main Body') continue
          const votePrompt = `
            Soul: "${user.username}"
            Soul Description: "${user.description}"
            Action: "${desc}"
            Should this soul vote YES to act on this action now? Answer ONLY "YES" or "NO".
            Response:`
          const resp = await aiApiBridge.prompt(votePrompt)
          if (resp.includes('YES')) {
            votes++
            voters.push(user.username)
          }
        }
        return { description: desc, votes, voters }
      })
    )
  }

  private async isSimilarAction(a: string, b: string): Promise<boolean> {
    const prompt =
      `You are a strict comparator of short action descriptions.\n` +
      `If they represent essentially the same user-facing action (same intent/outcome), answer ONLY "SIMILAR"; otherwise ONLY "DIFFERENT".\n\n` +
      `Action A: "${a}"\nAction B: "${b}"\nAnswer:`
    const resp = await aiApiBridge.prompt(prompt)
    return resp.includes('SIMILAR')
  }

  private async findSimilarExisting(desc: string, existing: Action[]): Promise<Action | null> {
    for (const ex of existing) {
      const similar = await this.isSimilarAction(desc, ex.description)
      if (similar) return ex
    }
    return null
  }

  public async processActionFlow(message: string, notifySuggestion: (username: string, msg: string) => Promise<void>) {
    const souls = await this.getActiveSplitSouls()
    const suggestionsPerSoul = await Promise.all(souls.map(s => this.getActionSuggestionsForSoul(s, message)))
    for (let i = 0; i < souls.length; i++) {
      const list = suggestionsPerSoul[i]
      if (list && list.length > 0) {
        await notifySuggestion(souls[i].username, `Suggestions: ${list.join(' | ')}`)
      }
    }
    const suggestions = Array.from(new Set(suggestionsPerSoul.flat()))
    if (suggestions.length === 0) return
    const voted = await this.voteOnActions(souls, suggestions)
    const existing = await getAllActions()
    for (const v of voted) {
      if (v.votes <= 0) continue
      const similarExisting = await this.findSimilarExisting(v.description, existing)
      if (similarExisting) {
        await updateAction(similarExisting.id, { priority: 'high' })
        continue
      }
      await createAction({
        description: v.description,
        createdAt: Date.now(),
        priority: 'low',
        isCompleted: false,
        vector: []
      })
    }
  }
}

export const actionCreationManager = new ActionCreationManager()
