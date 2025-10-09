import { db } from '../client'
import type { Task } from '../../../interface/database'
import { getEmbeddingFromText } from '../../transformers/embedder'
import createLRU, { cacheDel, cacheGet, cacheSet } from '../../../utils/cache'
import { semanticSimilaritySearch } from '../../transformers/vector-search'

const CACHE_TTL_MS = 1000 * 60 * 5
const allTasksCache = createLRU<Task[]>({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForTask() {
  cacheDel(allTasksCache, 'all')
}

async function withTaskEmbedding(task: Task): Promise<Task> {
  // TODO: add necesary items here to store vectors not only username and description
  const textForEmbedding = `${task.title} ${task.description}`
  const vector = await getEmbeddingFromText(textForEmbedding)
  return { ...task, vector }
}

// CREATE TASK
export async function createTask(task: Task) {
  try {
    const taskWithVector = await withTaskEmbedding(task)
    invalidateCachesForTask()
    return await db.tasks.add(taskWithVector)
  } catch (error) {
    console.error('Error creating task:', error)
    throw new Error('Failed to create task')
  }
}

// UPDATE TASK BY ID
export async function updateTask(id: number, changes: Partial<Task>) {
  try {
    const existing = await db.tasks.get(id)
    if (!existing) return null
    const updated = { ...existing, ...changes }
    const updatedWithVector = await withTaskEmbedding(updated as Task)
    invalidateCachesForTask()
    return await db.tasks.put(updatedWithVector)
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error)
    throw new Error('Failed to update task')
  }
}

// READ TASK BY ID
export async function getTask(id: number) {
  try {
    return await db.tasks.get(id)
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error)
    throw new Error('Failed to fetch task')
  }
}

// DELETE TASK BY ID
export async function deleteTask(id: number) {
  try {
    invalidateCachesForTask()
    return await db.tasks.delete(id)
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error)
    throw new Error('Failed to delete task')
  }
}

// GET ALL TASKS
export async function getAllTasks() {
  const cached = cacheGet(allTasksCache, 'all')
  if (cached) return cached
  try {
    const tasks = await db.tasks.toArray()
    cacheSet(allTasksCache, 'all', tasks)
    return tasks
  } catch (error) {
    console.error('Error fetching all tasks:', error)
    throw new Error('Failed to fetch tasks')
  }
}

// VECTOR SEARCH
export async function searchTasksByVector(query: string) {
  try {
    const tasks = await getAllTasks()
    if (!tasks.length) return []
    const queryVector = await getEmbeddingFromText(query)
    const results = semanticSimilaritySearch<Task>(tasks, queryVector)
    return results.map(r => r.item)
  } catch (error) {
    console.error('Error searching tasks by vector:', error)
    throw new Error('Failed to search tasks by vector')
  }
}
