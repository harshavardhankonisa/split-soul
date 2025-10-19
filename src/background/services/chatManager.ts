import type { Chat } from '../../interface/database'
import { createChat, getAllChats } from '../../services/dexie/collections/chat'

export class ChatManager {
  public addChat(chat: Omit<Chat, 'id' | 'createdAt' | 'vector'>): void {
    createChat(chat)
  }

  public async getActiveChats(): Promise<Chat[]> {
    const chats = await getAllChats()
    return chats
  }
}

export const chatManager = new ChatManager()
