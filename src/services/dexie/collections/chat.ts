import { db } from '../client'
import type { Chat } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU, { cacheDel, cacheGet, cacheSet } from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vectorSearch'

const CACHE_TTL_MS = 1000 * 60 * 5
const allChatsCache = createLRU<Chat[]>({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForChat() {
  cacheDel(allChatsCache, 'all')
}

async function withChatEmbedding(chat: Chat): Promise<Chat> {
  // TODO: add necesary items here to store vectors not only username and description
  const textForEmbedding = `${chat.user} ${chat.message}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...chat, vector }
}

// CREATE CHAT
export async function createChat(chat: Chat) {
  try {
    const chatWithVector = await withChatEmbedding(chat)
    invalidateCachesForChat()
    return await db.chats.add(chatWithVector)
  } catch (error) {
    console.error('Error creating chat:', error)
    throw new Error('Failed to create chat')
  }
}

// UPDATE CHAT BY ID
export async function updateChat(id: number, changes: Partial<Chat>) {
  try {
    const existing = await db.chats.get(id)
    if (!existing) return null
    const updated = { ...existing, ...changes }
    const updatedWithVector = await withChatEmbedding(updated as Chat)
    invalidateCachesForChat()
    return await db.chats.put(updatedWithVector)
  } catch (error) {
    console.error(`Error updating chat with ID ${id}:`, error)
    throw new Error('Failed to update chat')
  }
}

// READ CHAT BY ID
export async function getChat(id: number) {
  try {
    return await db.chats.get(id)
  } catch (error) {
    console.error(`Error fetching chat with ID ${id}:`, error)
    throw new Error('Failed to fetch chat')
  }
}

// DELETE CHAT BY ID
export async function deleteChat(id: number) {
  try {
    invalidateCachesForChat()
    return await db.chats.delete(id)
  } catch (error) {
    console.error(`Error deleting chat with ID ${id}:`, error)
    throw new Error('Failed to delete chat')
  }
}

// GET ALL CHATS
export async function getAllChats() {
  const cached = cacheGet(allChatsCache, 'all')
  if (cached) return cached
  try {
    const chats = await db.chats.toArray()
    cacheSet(allChatsCache, 'all', chats)
    return chats
  } catch (error) {
    console.error('Error fetching all chats:', error)
    throw new Error('Failed to fetch chats')
  }
}

// VECTOR SEARCH
export async function searchChatsByVector(query: string) {
  try {
    const chats = await getAllChats()
    if (!chats.length) return []
    const queryVector = await getEmbeddingFromText(query)
    const results = semanticSimilaritySearch<Chat>(chats, queryVector)
    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching chats by vector:', error)
    throw new Error('Failed to search chats by vector')
  }
}
