import type { Chat } from '../../interface/database'
import { createChat } from '../../services/dexie/collections/chat'
import { actionCreationManager } from './actionCreationManager'

export class ChatManager {
  private async triggerActionFlow(message: string) {
    await actionCreationManager.processActionFlow(message, async (username, msg) => {
      await this.addChat({ username, message: msg })
    })
  }

  public async addChat(chat: Omit<Chat, 'id' | 'createdAt' | 'vector'>) {
    await createChat(chat)

    if (chat.username === 'Main Soul' || chat.username === 'Main Body') {
      await this.triggerActionFlow(chat.message)
    }
  }
}

export const chatManager = new ChatManager()
