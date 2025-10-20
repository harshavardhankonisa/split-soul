import type { Chat, User } from '../../interface/database'
import { SoulOpinionAgent } from '../../services/agents/SoulOpinionAgent'
import { createChat, getAllChats } from '../../services/dexie/collections/chat'
import { getAllUsers } from '../../services/dexie/collections/user'
import { agendaManager } from './agendaManager'

export class ChatManager {
  private soulOpinionAgent = new SoulOpinionAgent({})

  private async getSoulOpinion(soul: User, message: string): Promise<string | null> {
    const relevancePrompt = `
      Soul: "${soul.username}"
      Soul Description: "${soul.description}"
      Message: "${message}"
          
      Is this message relevant to this soul's expertise/role? Answer with ONLY "YES" or "NO".
      Response:`

    const relevanceCheck = await this.soulOpinionAgent._call(relevancePrompt)

    if (!relevanceCheck.includes('YES')) {
      console.log(`Message not relevant to ${soul.username}`)
      return null
    }

    const opinionPrompt = `
      You are ${soul.username}. Your role: ${soul.description}
          
      Message to respond to: "${message}"
          
      Provide a brief, relevant opinion or response based on your role. Keep it concise (1-2 sentences).
      Response:`

    const opinion = await this.soulOpinionAgent._call(opinionPrompt)

    await createChat({
      user: soul.username,
      message: opinion
    })

    return opinion
  }

  private async triggerMultiSoulOpinions(message: string) {
    const customSouls = (await getAllUsers()).filter(
      u => u.username !== 'Main Soul' && u.username !== 'Main Body' && u.isActive
    )

    const discussionParts: string[] = [`Main Message: ${message}\n`]

    for (const soul of customSouls) {
      const opinion = await this.getSoulOpinion(soul, message)
      if (opinion) {
        discussionParts.push(`👤 ${soul.username}: ${opinion}`)
      }
    }

    if (discussionParts.length > 1) {
      const discussionDescription = discussionParts.join('\n\n')
      agendaManager.createAgenda(discussionDescription)
    }
  }

  public async addChat(chat: Omit<Chat, 'id' | 'createdAt' | 'vector'>) {
    await createChat(chat)

    if (chat.user === 'Main Soul') {
      await this.triggerMultiSoulOpinions(chat.message)
    }
  }

  public async getActiveChats(): Promise<Chat[]> {
    const chats = await getAllChats()
    return chats
  }
}

export const chatManager = new ChatManager()
