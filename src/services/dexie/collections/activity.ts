import { db } from '../client'
import type { Activity } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vector-search'

const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes

// LRU caches: one for individual activities, one for the full activities list
const activityByIdCache = createLRU({ max: 2000, ttl: CACHE_TTL_MS })
const allActivitiesCache = createLRU({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForActivity(id?: number) {
  allActivitiesCache.delete('all')
  if (typeof id === 'number') activityByIdCache.delete(String(id))
}

async function withActivityEmbedding(activity: Activity): Promise<Activity> {
  const textForEmbedding = `${activity.type} ${activity.action} ${activity.description} ${activity.tags}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...activity, vector }
}

// CREATE ACTIVITY
export async function createActivity(activity: Activity) {
  try {
    const activityWithVector = await withActivityEmbedding(activity)
    const id = await db.activities.add(activityWithVector)
    invalidateCachesForActivity(id as number)
    return id
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
    await db.activities.put(updatedWithVector)
    invalidateCachesForActivity(id)
    activityByIdCache.set(String(id), updatedWithVector)
    return updatedWithVector
  } catch (error) {
    console.error(`Error updating activity with ID ${id}:`, error)
    throw new Error('Failed to update activity')
  }
}

// READ ACTIVITY BY ID
export async function getActivity(id: number) {
  const cached = activityByIdCache.get(String(id))
  if (cached) return cached as Activity
  try {
    const activity = await db.activities.get(id)
    if (activity) activityByIdCache.set(String(id), activity)
    return activity
  } catch (error) {
    console.error(`Error fetching activity with ID ${id}:`, error)
    throw new Error('Failed to fetch activity')
  }
}

// DELETE ACTIVITY BY ID
export async function deleteActivity(id: number) {
  try {
    const res = await db.activities.delete(id)
    invalidateCachesForActivity(id)
    return res
  } catch (error) {
    console.error(`Error deleting activity with ID ${id}:`, error)
    throw new Error('Failed to delete activity')
  }
}

// GET ALL ACTIVITIES
export async function getAllActivities() {
  const cached = allActivitiesCache.get('all')
  if (cached) return cached

  try {
    const activities = await db.activities.toArray()

    allActivitiesCache.set('all', activities)
    for (const a of activities) if (a.id) activityByIdCache.set(String(a.id), a)

    return activities
  } catch (error) {
    console.error('Error fetching all activities:', error)
    throw new Error('Failed to fetch activities')
  }
}

// VECTOR SEARCH
export async function searchActivitiesByVector(query: string) {
  try {
    const activities = await getAllActivities()
    if (!activities.length) return []

    const queryVector = await getEmbeddingFromText(query)
    const results = semanticSimilaritySearch(activities, queryVector)

    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching activities by vector:', error)
    throw new Error('Failed to search activities by vector')
  }
}
