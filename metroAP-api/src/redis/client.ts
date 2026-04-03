import Redis from 'ioredis'
import { config } from '../config.js'

// ─── Redis clients ─────────────────────────────────────────────────────────────
// We need TWO separate Redis connections:
//   redis    — standard commands (GET, SET, PUBLISH, etc.)
//   redisSub — dedicated subscriber (a subscribed client can ONLY subscribe)

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

export const redisSub = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

redis.on('error', (err) => console.error('[Redis]', err.message))
redisSub.on('error', (err) => console.error('[Redis:sub]', err.message))

// ─── Key helpers ───────────────────────────────────────────────────────────────
// Centralise all Redis key names so they never drift out of sync.

export const keys = {
  // Live bus position + ETA — TTL 60s
  busPosition: (shiftId: string) => `bus:position:${shiftId}`,

  // Latest ETA map for a variant: stopIndex → minutes
  variantEta: (variantId: string) => `variant:eta:${variantId}`,

  // Active shift ID for a bus
  busShift: (busId: string) => `bus:shift:${busId}`,

  // Passengers subscribed to a variant (for geofence notifications)
  variantSubs: (variantId: string) => `variant:subs:${variantId}`,
}

// ─── Channel names (Pub/Sub) ───────────────────────────────────────────────────

export const channels = {
  // Published by Location Service after processing a GPS ping
  busUpdate: (variantId: string) => `bus:update:${variantId}`,

  // Published by Alert Service when a conductor files a report
  alert: (variantId: string) => `alert:${variantId}`,
}

// ─── Connect both clients ──────────────────────────────────────────────────────

export async function connectRedis(): Promise<void> {
  await Promise.all([redis.connect(), redisSub.connect()])
  console.log('[Redis] connected')
}
