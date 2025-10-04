/**
 * Reusable vector search utilities.
 * - cosineSimilarity: safe if vectors differ in length (uses min length)
 * - normalizeVector: unit-normalize
 * - topKSimilar: given items and an accessor to embeddings, return top-K matches
 */

export const normalizeVector = (vec: number[]): number[] => {
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
  return vec.map(v => v / mag)
}

export const cosineSimilarity = (a: number[], b: number[], precision = 6): number => {
  if (!a || !b || !a.length || !b.length) return 0
  const len = Math.min(a.length, b.length)
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  // account for remaining magnitude if vectors are longer
  for (let i = len; i < a.length; i++) magA += a[i] * a[i]
  for (let i = len; i < b.length; i++) magB += b[i] * b[i]

  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  if (!denom) return 0
  return parseFloat((dot / denom).toFixed(precision))
}

export type SimilarItem<T> = { item: T; similarity: number }

export function topKSimilar<T>(
  items: T[],
  getEmbedding: (item: T) => number[] | undefined | null,
  queryEmbedding: number[],
  topK: number,
  options?: { normalize?: boolean; minSimilarity?: number }
): SimilarItem<T>[] {
  const normalize = options?.normalize ?? true
  const minSimilarity = options?.minSimilarity ?? -1

  const qEmb = normalize ? normalizeVector(queryEmbedding) : queryEmbedding

  const res: SimilarItem<T>[] = []
  for (const it of items) {
    const emb = getEmbedding(it)
    if (!emb) continue
    const embToUse = normalize ? normalizeVector(emb) : emb
    const sim = cosineSimilarity(qEmb, embToUse)
    if (sim >= minSimilarity) res.push({ item: it, similarity: sim })
  }

  res.sort((a, b) => b.similarity - a.similarity)
  return res.slice(0, topK)
}

export default {
  cosineSimilarity,
  normalizeVector,
  topKSimilar
}
