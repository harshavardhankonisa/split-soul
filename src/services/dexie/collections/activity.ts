import { db } from '../client'
import type { Activity } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU, { cacheDel, cacheGet, cacheSet } from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vectorSearch'

const CACHE_TTL_MS = 1000 * 60 * 5
const allActivitysCache = createLRU<Activity[]>({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForActivity() {
  cacheDel(allActivitysCache, 'all')
}

async function withActivityEmbedding(activity: Activity): Promise<Activity> {
  // TODO: add necesary items here to store vectors not only username and description
  const textForEmbedding = `${activity.websiteTitle} ${activity.websiteUrl} ${activity.activeDuration}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...activity, vector }
}

// CREATE ACTIVITY
export async function createActivity(activity: Activity) {
  try {
    const activityWithVector = await withActivityEmbedding(activity)
    invalidateCachesForActivity()
    return await db.activities.add(activityWithVector)
  } catch (error) {
    console.error('Error creating activity:', error)
    throw new Error('Failed to create activity')
  }
}

// UPDATE ACTIVITY BY ID
export async function updateActivity(id: number, changes: Partial<Activity>) {
  try {
    const existing = await db.activities.get(id)
    if (!existing) return null
    const updated = { ...existing, ...changes }
    const updatedWithVector = await withActivityEmbedding(updated as Activity)
    invalidateCachesForActivity()
    return await db.activities.put(updatedWithVector)
  } catch (error) {
    console.error(`Error updating activity with ID ${id}:`, error)
    throw new Error('Failed to update activity')
  }
}

// READ ACTIVITY BY ID
export async function getActivity(id: number) {
  try {
    return await db.activities.get(id)
  } catch (error) {
    console.error(`Error fetching activity with ID ${id}:`, error)
    throw new Error('Failed to fetch activity')
  }
}

// DELETE ACTIVITY BY ID
export async function deleteActivity(id: number) {
  try {
    invalidateCachesForActivity()
    return await db.activities.delete(id)
  } catch (error) {
    console.error(`Error deleting activity with ID ${id}:`, error)
    throw new Error('Failed to delete activity')
  }
}

// GET ALL ACTIVITIES
export async function getAllActivitys() {
  const cached = cacheGet(allActivitysCache, 'all')
  if (cached) return cached
  try {
    const activities = await db.activities.toArray()
    cacheSet(allActivitysCache, 'all', activities)
    return activities
  } catch (error) {
    console.error('Error fetching all activities:', error)
    throw new Error('Failed to fetch activities')
  }
}

// VECTOR SEARCH
export async function searchActivitysByVector(query: string) {
  try {
    const activities = await getAllActivitys()
    if (!activities.length) return []
    const queryVector = await getEmbeddingFromText(query)
    const results = semanticSimilaritySearch<Activity>(activities, queryVector)
    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching activities by vector:', error)
    throw new Error('Failed to search activities by vector')
  }
}
