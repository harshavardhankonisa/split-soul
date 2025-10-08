import { db } from '../client'
import type { User } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vector-search'

const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes

// LRU caches: one for individual users, one for the full users list
const userByIdCache = createLRU({ max: 2000, ttl: CACHE_TTL_MS })
const allUsersCache = createLRU({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForUser(id?: number) {
  allUsersCache.delete('all')
  if (typeof id === 'number') userByIdCache.delete(String(id))
}

async function withUserEmbedding(user: User): Promise<User> {
  const textForEmbedding = `${user.username} ${user.description}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...user, vector, modifiedAt: new Date() }
}

// CREATE USER
export async function createUser(user: User) {
  try {
    const userWithVector = await withUserEmbedding(user)
    const id = await db.users.add(userWithVector)
    invalidateCachesForUser(id as number)
    return id
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
    await db.users.put(updatedWithVector)
    invalidateCachesForUser(id)
    return updatedWithVector
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error)
    throw new Error('Failed to update user')
  }
}

// READ USER BY ID
export async function getUser(id: number) {
  const cached = userByIdCache.get(String(id))
  if (cached) return cached as User
  try {
    const user = await db.users.get(id)
    if (user) userByIdCache.set(String(id), user)
    return user
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error)
    throw new Error('Failed to fetch user')
  }
}

// DELETE USER BY ID
export async function deleteUser(id: number) {
  try {
    const res = await db.users.delete(id)
    invalidateCachesForUser(id)
    return res
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error)
    throw new Error('Failed to delete user')
  }
}

// GET ALL USERS
export async function getAllUsers() {
  const cached = allUsersCache.get('all')
  if (cached) return cached

  try {
    const users = await db.users.toArray()

    const normalized = users.map(u => {
      if (!u.vector || u.vector === null) return u
      return { ...u, vector: u.vector }
    })

    allUsersCache.set('all', normalized)
    for (const u of normalized) if (u.id) userByIdCache.set(String(u.id), u)

    return normalized
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
    const results = semanticSimilaritySearch(users, queryVector)

    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching users by vector:', error)
    throw new Error('Failed to search users by vector')
  }
}
