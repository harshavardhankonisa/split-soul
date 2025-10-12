import { db } from '../client'
import type { Action } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU, { cacheDel, cacheGet, cacheSet } from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vectorSearch'

const CACHE_TTL_MS = 1000 * 60 * 5
const allActionsCache = createLRU<Action[]>({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForAction() {
  cacheDel(allActionsCache, 'all')
}

async function withActionEmbedding(action: Action): Promise<Action> {
  // TODO: add necesary items here to store vectors not only username and description
  const textForEmbedding = `${action.name} ${action.description}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...action, vector }
}

// CREATE ACTION
export async function createAction(action: Omit<Action, 'id'>) {
  try {
    const actionWithVector = await withActionEmbedding(action as Action)
    invalidateCachesForAction()
    return await db.actions.add(actionWithVector)
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
    invalidateCachesForAction()
    return await db.actions.put(updatedWithVector)
  } catch (error) {
    console.error(`Error updating action with ID ${id}:`, error)
    throw new Error('Failed to update action')
  }
}

// READ ACTION BY ID
export async function getAction(id: number) {
  try {
    return await db.actions.get(id)
  } catch (error) {
    console.error(`Error fetching action with ID ${id}:`, error)
    throw new Error('Failed to fetch action')
  }
}

// DELETE ACTION BY ID
export async function deleteAction(id: number) {
  try {
    invalidateCachesForAction()
    return await db.actions.delete(id)
  } catch (error) {
    console.error(`Error deleting action with ID ${id}:`, error)
    throw new Error('Failed to delete action')
  }
}

// GET ALL ACTIONS
export async function getAllActions() {
  const cached = cacheGet(allActionsCache, 'all')
  if (cached) return cached
  try {
    const actions = await db.actions.toArray()
    cacheSet(allActionsCache, 'all', actions)
    return actions
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
    const results = semanticSimilaritySearch<Action>(actions, queryVector)
    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching actions by vector:', error)
    throw new Error('Failed to search actions by vector')
  }
}
