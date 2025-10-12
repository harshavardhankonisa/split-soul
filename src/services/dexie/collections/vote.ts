import { db } from '../client'
import type { Vote } from '../../../interface/database'
import createLRU, { cacheDel, cacheGet, cacheSet } from '../../../utils/cache'

const CACHE_TTL_MS = 1000 * 60 * 5
const allVotesCache = createLRU<Vote[]>({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForVote() {
  cacheDel(allVotesCache, 'all')
}

// CREATE VOTE
export async function createVote(vote: Omit<Vote, 'id'>) {
  try {
    invalidateCachesForVote()
    return await db.votes.add(vote as Vote)
  } catch (error) {
    console.error('Error creating vote:', error)
    throw new Error('Failed to create vote')
  }
}

// UPDATE VOTE BY ID
export async function updateVote(id: number, changes: Partial<Vote>) {
  try {
    const existing = await db.votes.get(id)
    if (!existing) return null
    invalidateCachesForVote()
    return await db.votes.put({ ...existing, ...changes })
  } catch (error) {
    console.error(`Error updating vote with ID ${id}:`, error)
    throw new Error('Failed to update vote')
  }
}

// READ VOTE BY ID
export async function getVote(id: number) {
  try {
    return await db.votes.get(id)
  } catch (error) {
    console.error(`Error fetching vote with ID ${id}:`, error)
    throw new Error('Failed to fetch vote')
  }
}

// DELETE VOTE BY ID
export async function deleteVote(id: number) {
  try {
    invalidateCachesForVote()
    return await db.votes.delete(id)
  } catch (error) {
    console.error(`Error deleting vote with ID ${id}:`, error)
    throw new Error('Failed to delete vote')
  }
}

// GET ALL VOTES
export async function getAllVotes() {
  const cached = cacheGet(allVotesCache, 'all')
  if (cached) return cached
  try {
    const votes = await db.votes.toArray()
    cacheSet(allVotesCache, 'all', votes)
    return votes
  } catch (error) {
    console.error('Error fetching all votes:', error)
    throw new Error('Failed to fetch votes')
  }
}
