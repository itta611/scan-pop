import { createClient } from 'redis'

async function connectRedis() {
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 5000, reconnectStrategy: false },
  })
  client.on('error', (error) => console.error('Redis connection failed', error))
  await client.connect()
  return client
}

let connection: ReturnType<typeof connectRedis> | undefined

export function getRedis() {
  if (!process.env.REDIS_URL) throw new Error('REDIS_URL is not configured')
  return connection ??= connectRedis().catch((error) => {
    connection = undefined
    throw error
  })
}
