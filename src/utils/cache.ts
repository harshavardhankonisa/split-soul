import { LRUCache } from 'lru-cache'

export const createLRU = (opts?: { max?: number; ttl?: number }) => {
  const { max = 1000, ttl = 1000 * 60 * 10 } = opts || {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new LRUCache<string, any>({
    max,
    ttl
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LRUInstance = any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cacheGet = (cache: LRUInstance, key: string): any => cache.get(key)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cacheSet = (cache: LRUInstance, key: string, value: any): void => {
  cache.set(key, value)
}
export const cacheDel = (cache: LRUInstance, key: string): boolean => cache.delete(key)
export const cacheHas = (cache: LRUInstance, key: string): boolean => cache.has(key)

export default createLRU
