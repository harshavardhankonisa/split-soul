import { LRUCache } from 'lru-cache'

export const createLRU = <T extends object>(opts?: { max?: number; ttl?: number }) => {
  const { max = 1000, ttl = 1000 * 60 * 10 } = opts || {}
  return new LRUCache<string, T>({
    max,
    ttl
  })
}

export type LRUInstance<T extends object> = LRUCache<string, T>

export const cacheGet = <T extends object>(cache: LRUInstance<T>, key: string): T | undefined => cache.get(key)

export const cacheSet = <T extends object>(cache: LRUInstance<T>, key: string, value: T): void => {
  cache.set(key, value)
}

export const cacheDel = <T extends object>(cache: LRUInstance<T>, key: string): boolean => cache.delete(key)

export const cacheHas = <T extends object>(cache: LRUInstance<T>, key: string): boolean => cache.has(key)

export default createLRU
