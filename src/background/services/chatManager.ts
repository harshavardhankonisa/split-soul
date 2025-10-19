import type { Chat, User } from '../../interface/database'
import { createChat, getAllChats } from '../../services/dexie/collections/chat'
import { getAllUsers } from '../../services/dexie/collections/user'

export class ChatManager {
  private async soulsOpinions(soul: User, message: string) {
    console.log(soul, message)
  }

  private async triggerMultiSoulOpinions(message: string) {
    const customSouls = (await getAllUsers()).filter(
      u => u.username !== 'Main Soul' && u.username !== 'Main Body' && u.isActive
    )
    for (const soul of customSouls) {
      this.soulsOpinions(soul, message)
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
