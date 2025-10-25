import { db } from '../client'
import type { User } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU, { cacheDel, cacheGet, cacheSet } from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vectorSearch'

const CACHE_TTL_MS = 1000 * 60 * 5
const allUsersCache = createLRU<User[]>({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForUser() {
  cacheDel(allUsersCache, 'all')
}

async function withUserEmbedding(user: User): Promise<User> {
  const textForEmbedding = `user ${user.username} | status: ${user.isActive ? 'active' : 'inactive'} | ${user.description}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...user, vector }
}

// CREATE USER
export async function createUser(user: Omit<User, 'id'>) {
  try {
    const userWithVector = await withUserEmbedding(user as User)
    invalidateCachesForUser()
    return await db.users.add(userWithVector)
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

// UPDATE USER BY ID
export async function updateUser(id: number, changes: Partial<User>) {
  try {
    const existing = await db.users.get(id)
    if (!existing) return null
    const updated = { ...existing, ...changes }
    const updatedWithVector = await withUserEmbedding(updated as User)
    invalidateCachesForUser()
    return await db.users.put(updatedWithVector)
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error)
    throw new Error('Failed to update user')
  }
}

// READ USER BY ID
export async function getUser(id: number) {
  try {
    return await db.users.get(id)
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error)
    throw new Error('Failed to fetch user')
  }
}

// DELETE USER BY ID
export async function deleteUser(id: number) {
  try {
    invalidateCachesForUser()
    return await db.users.delete(id)
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error)
    throw new Error('Failed to delete user')
  }
}

// GET ALL USERS
export async function getAllUsers() {
  const cached = cacheGet(allUsersCache, 'all')
  if (cached) return cached
  try {
    const users = await db.users.toArray()
    cacheSet(allUsersCache, 'all', users)
    return users
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw new Error('Failed to fetch users')
  }
}

// VECTOR SEARCH
export async function searchUsersByVector(query: string) {
  try {
    const users = await getAllUsers()
    if (!users.length) return []
    const queryVector = await getEmbeddingFromText(query)
    const results = semanticSimilaritySearch<User>(users, queryVector)
    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching users by vector:', error)
    throw new Error('Failed to search users by vector')
  }
}
