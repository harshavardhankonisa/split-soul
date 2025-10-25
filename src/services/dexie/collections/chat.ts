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
  const createdAtIso = chat.createdAt ? new Date(chat.createdAt).toISOString() : ''
  const textForEmbedding = `chat from ${chat.username} at ${createdAtIso}: ${chat.message}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...chat, vector }
}

// CREATE CHAT
export async function createChat(chat: Omit<Chat, 'id' | 'createdAt' | 'vector'>) {
  try {
    const chatWithVector = await withChatEmbedding({ ...chat, createdAt: Date.now() } as unknown as Chat)
    invalidateCachesForChat()
    return await db.chats.add(chatWithVector)
  } catch (error) {
    console.error('Error creating chat:', error)
    throw new Error('Failed to create chat')
  }
}

// GET ALL CHATS
export async function getAllChats(options?: { sortByTime?: boolean; limit?: number }) {
  const cached = cacheGet(allChatsCache, 'all')
  const shouldUseCache = cached && !options?.sortByTime && !options?.limit
  if (shouldUseCache) return cached
  try {
    let chats: Chat[]
    const sortByTime = options?.sortByTime ?? false
    const limit = options?.limit && options.limit > 0 ? options.limit : undefined
    if (sortByTime) {
      let query = db.chats.orderBy('createdAt').reverse()
      if (limit) query = query.limit(limit)
      chats = await query.toArray()
    } else if (limit) {
      chats = await db.chats.toCollection().limit(limit).toArray()
    } else {
      chats = await db.chats.toArray()
    }
    if (!options?.sortByTime && !options?.limit) {
      cacheSet(allChatsCache, 'all', chats)
    }
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
