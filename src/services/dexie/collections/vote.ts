import { db } from '../client'
import type { Vote } from '../../../interface/database'
import createLRU from '../../../utils/cache'

const CACHE_TTL_MS = 1000 * 60 * 5 // 5 minutes

// LRU caches: one for individual votes, one for the full votes list
const voteByIdCache = createLRU({ max: 2000, ttl: CACHE_TTL_MS })
const allVotesCache = createLRU({ max: 1, ttl: CACHE_TTL_MS })

function invalidateCachesForVote(id?: number) {
  allVotesCache.delete('all')
  if (typeof id === 'number') voteByIdCache.delete(String(id))
}

// CREATE VOTE
export async function createvote(vote: Vote) {
  try {
    const id = await db.votes.add(vote)
    invalidateCachesForVote(id as number)
    return id
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
    const updated = { ...existing, ...changes }
    await db.votes.put(updated)
    invalidateCachesForVote(id)
    voteByIdCache.set(String(id), updated)
    return updated
  } catch (error) {
    console.error(`Error updating vote with ID ${id}:`, error)
    throw new Error('Failed to update vote')
  }
}

// READ VOTE BY ID
export async function getVote(id: number) {
  const cached = voteByIdCache.get(String(id))
  if (cached) return cached as Vote
  try {
    const vote = await db.votes.get(id)
    if (vote) voteByIdCache.set(String(id), vote)
    return vote
  } catch (error) {
    console.error(`Error fetching vote with ID ${id}:`, error)
    throw new Error('Failed to fetch vote')
  }
}

// DELETE VOTE BY ID
export async function deleteVote(id: number) {
  try {
    const res = await db.votes.delete(id)
    invalidateCachesForVote(id)
    return res
  } catch (error) {
    console.error(`Error deleting vote with ID ${id}:`, error)
    throw new Error('Failed to delete vote')
  }
}

// GET ALL VOTES
export async function getAllVotes() {
  const cached = allVotesCache.get('all')
  if (cached) return cached

  try {
    const votes = await db.votes.toArray()

    allVotesCache.set('all', votes)
    for (const v of votes) if (v.id) voteByIdCache.set(String(v.id), v)

    return votes
  } catch (error) {
    console.error('Error fetching all votes:', error)
    throw new Error('Failed to fetch votes')
  }
}
