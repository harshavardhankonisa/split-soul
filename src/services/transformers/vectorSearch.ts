import { cos_sim, softmax } from '@xenova/transformers'

export interface VectorItem {
  vector: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export function semanticSimilaritySearch<T extends VectorItem>(
  items: T[],
  queryVector: number[]
): { item: T; similarity: number; score: number }[] {
  const minSimilarity = 0.2

  if (!items.length) return []

  const sims: number[] = []
  const results: { item: T; similarity: number }[] = []

  for (const item of items) {
    if (!item.vector || item.vector.length === 0) continue
    const sim = cos_sim(queryVector, item.vector)
    if (sim >= minSimilarity) {
      sims.push(sim)
      results.push({ item, similarity: sim })
    }
  }

  if (!results.length) return []

  const simsOnly = results.map(f => f.similarity)
  const probs = softmax(simsOnly)

  const ranked = results
    .map((f, i) => ({
      item: f.item,
      similarity: Number(f.similarity.toFixed(4)),
      score: Number(probs[i].toFixed(4))
    }))
    .sort((a, b) => b.score - a.score || b.similarity - a.similarity)
  return ranked
}
