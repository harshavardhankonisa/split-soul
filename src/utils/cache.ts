import { LRUCache } from 'lru-cache'

export const createLRU = (opts?: { max?: number; ttl?: number }) => {
  const { max = 1000, ttl = 1000 * 60 * 10 } = opts || {}
  return new LRUCache<string, any>({
    max,
    ttl
  })
}

export type LRUInstance = any

export const cacheGet = (cache: LRUInstance, key: string): any => cache.get(key)
export const cacheSet = (cache: LRUInstance, key: string, value: any): void => {
  cache.set(key, value)
}
export const cacheDel = (cache: LRUInstance, key: string): boolean => cache.delete(key)

export default createLRU
