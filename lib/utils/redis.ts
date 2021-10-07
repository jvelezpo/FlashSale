import Redis from 'ioredis'

export const singleton = <T>(id: string, fn: () => T) => {
  if (process.env.NODE_ENV === 'production') {
    return fn()
  } else {
    if (!global[id]) {
      global[id] = fn()
    }
    return global[id] as T
  }
}

export const redis = singleton('redis', () => {
  return new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379')
})
