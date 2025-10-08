import { db } from '../client'
import type { Action } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vector-search'

const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes

// LRU caches: one for individual actions, one for the full actions list
const actionByIdCache = createLRU({ max: 2000, ttl: CACHE_TTL_MS })
const allActionsCache = createLRU({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForAction(id?: number) {
  allActionsCache.delete('all')
  if (typeof id === 'number') actionByIdCache.delete(String(id))
}

async function withActionEmbedding(action: Action): Promise<Action> {
  const textForEmbedding = `${action.name} ${action.description}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...action, vector }
}

// CREATE ACTION
export async function createAction(action: Action) {
  try {
    const actionWithVector = await withActionEmbedding(action)
    const id = await db.actions.add(actionWithVector)
    invalidateCachesForAction(id as number)
    return id
  } catch (error) {
    console.error('Error creating action:', error)
    throw new Error('Failed to create action')
  }
}

// UPDATE ACTION BY ID
export async function updateAction(id: number, changes: Partial<Action>) {
  try {
    const existing = await db.actions.get(id)
    if (!existing) return null
    const updated = { ...existing, ...changes }
    const updatedWithVector = await withActionEmbedding(updated as Action)
    await db.actions.put(updatedWithVector)
    invalidateCachesForAction(id)
    return updatedWithVector
  } catch (error) {
    console.error(`Error updating action with ID ${id}:`, error)
    throw new Error('Failed to update action')
  }
}

// READ ACTION BY ID
export async function getAction(id: number) {
  const cached = actionByIdCache.get(String(id))
  if (cached) return cached as Action
  try {
    const action = await db.actions.get(id)
    if (action) actionByIdCache.set(String(id), action)
    return action
  } catch (error) {
    console.error(`Error fetching action with ID ${id}:`, error)
    throw new Error('Failed to fetch action')
  }
}

// DELETE ACTION BY ID
export async function deleteAction(id: number) {
  try {
    const res = await db.actions.delete(id)
    invalidateCachesForAction(id)
    return res
  } catch (error) {
    console.error(`Error deleting action with ID ${id}:`, error)
    throw new Error('Failed to delete action')
  }
}

// GET ALL ACTIONS
export async function getAllActions() {
  const cached = allActionsCache.get('all')
  if (cached) return cached

  try {
    const actions = await db.actions.toArray()

    const normalized = actions.map(a => {
      if (!a.vector || a.vector === null) return a
      return a
    })

    allActionsCache.set('all', normalized)
    for (const a of normalized) if (a.id) actionByIdCache.set(String(a.id), a)

    return normalized
  } catch (error) {
    console.error('Error fetching all actions:', error)
    throw new Error('Failed to fetch actions')
  }
}

// VECTOR SEARCH
export async function searchActionsByVector(query: string) {
  try {
    const actions = await getAllActions()
    if (!actions.length) return []

    const queryVector = await getEmbeddingFromText(query)
    const results = semanticSimilaritySearch(actions, queryVector)

    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching actions by vector:', error)
    throw new Error('Failed to search actions by vector')
  }
}
