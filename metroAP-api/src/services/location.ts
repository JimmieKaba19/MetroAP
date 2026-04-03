import db from '../db/client.js'
import { redis, channels, keys } from '../redis/client.js'
import { snapToRoad, matchStopIndex, estimateEtaMinutes } from './osrm.js'
import { config } from '../config.js'
import type { LiveBusState, EtaMap, GpsPingPayload } from '../types/index.js'

// ─── Location Service ──────────────────────────────────────────────────────────
// Called every time a conductor app sends a GPS ping.
// Pipeline:
//   1. Snap coords to road (OSRM)
//   2. Match to nearest stop on variant
//   3. Calculate ETAs for all remaining stops
//   4. Write live state to Redis
//   5. Publish update so WebSocket server fans it out to passengers
//   6. Persist raw ping to database for analytics

export async function processGpsPing(
  shiftId: string,
  payload: GpsPingPayload
): Promise<void> {
  // ── Load shift with bus, variant, and stops ──────────────────────────────
  const shift = await db.shift.findUnique({
    where: { id: shiftId },
    include: {
      bus: true,
      variant: {
        include: {
          stops: {
            include: { stop: true },
            orderBy: { stopOrder: 'asc' },
          },
        },
      },
    },
  })

  if (!shift || shift.status !== 'ACTIVE') return

  const stops = shift.variant.stops.map((vs) => ({
    id:    vs.stop.id,
    name:  vs.stop.name,
    lat:   vs.stop.lat,
    lng:   vs.stop.lng,
    order: vs.stopOrder,
  }))

  // ── Get current stop index from Redis (default 0) ────────────────────────
  const cached = await redis.get(keys.busPosition(shiftId))
  const prev   = cached ? (JSON.parse(cached) as LiveBusState) : null
  const currentStopIndex = prev?.stopIndex ?? 0

  // ── Snap to road ─────────────────────────────────────────────────────────
  const snapped = await snapToRoad(payload.lat, payload.lng)

  // ── Match to nearest stop ─────────────────────────────────────────────────
  const stopIndex = matchStopIndex(
    snapped.lat,
    snapped.lng,
    stops,
    currentStopIndex
  )

  // ── Detect delay (stopped for > GPS_PING_INTERVAL * 3 and not at terminal) ─
  const isStopped   = payload.speed < 2
  const notTerminal = stopIndex < stops.length - 1
  const wasDelayed  = prev?.status === 'delayed'
  const status: LiveBusState['status'] =
    isStopped && notTerminal && wasDelayed ? 'delayed' : 'on-time'

  // ── Build live state ──────────────────────────────────────────────────────
  const liveState: LiveBusState = {
    shiftId,
    busId:       shift.bus.id,
    variantId:   shift.variantId,
    fleetNumber: shift.bus.fleetNumber,
    lat:         snapped.lat,
    lng:         snapped.lng,
    speed:       payload.speed,
    heading:     payload.heading,
    stopIndex,
    status,
    passengers:  prev?.passengers ?? 0,
    capacity:    shift.bus.capacity,
    updatedAt:   new Date().toISOString(),
  }

  // ── Calculate ETAs for all remaining stops ────────────────────────────────
  const etaMap: EtaMap = {}
  for (let i = stopIndex; i < stops.length; i++) {
    etaMap[i] = estimateEtaMinutes(
      snapped.lat,
      snapped.lng,
      stops[i],
      payload.speed
    )
  }

  // ── Write to Redis ────────────────────────────────────────────────────────
  const ttl = Math.ceil((config.gpsPingIntervalMs * 3) / 1000) // 3 missed pings = offline
  await Promise.all([
    redis.setex(keys.busPosition(shiftId), ttl, JSON.stringify(liveState)),
    redis.setex(keys.variantEta(shift.variantId), ttl, JSON.stringify(etaMap)),
  ])

  // ── Publish to WebSocket server ───────────────────────────────────────────
  await redis.publish(
    channels.busUpdate(shift.variantId),
    JSON.stringify({ type: 'BUS_UPDATE', data: liveState })
  )

  // ── Persist ping to database ──────────────────────────────────────────────
  await db.gpsPing.create({
    data: {
      shiftId,
      lat:       snapped.lat,
      lng:       snapped.lng,
      speed:     payload.speed,
      heading:   payload.heading,
      accuracy:  payload.accuracy,
      stopIndex,
    },
  })

  // ── Check geofence for stop arrival notifications ─────────────────────────
  await checkGeofence(liveState, stops)
}

// ─── Geofence check ────────────────────────────────────────────────────────────
// If the bus just entered a stop's radius, publish an arrival alert.

async function checkGeofence(
  bus: LiveBusState,
  stops: Array<{ id: string; name: string; lat: number; lng: number; order: number }>
): Promise<void> {
  const currentStop = stops[bus.stopIndex]
  if (!currentStop) return

  // Calculate distance to current stop
  const R  = 6_371_000
  const φ1 = (bus.lat * Math.PI) / 180
  const φ2 = (currentStop.lat * Math.PI) / 180
  const Δφ = ((currentStop.lat - bus.lat) * Math.PI) / 180
  const Δλ = ((currentStop.lng - bus.lng) * Math.PI) / 180
  const a  =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  if (dist <= config.geofenceRadiusM) {
    // Use Redis to avoid firing the same arrival multiple times
    const key    = `geofence:${bus.shiftId}:${bus.stopIndex}`
    const alreadyFired = await redis.get(key)
    if (alreadyFired) return

    await redis.setex(key, 120, '1') // suppress for 2 minutes

    await redis.publish(
      channels.alert(bus.variantId),
      JSON.stringify({
        type: 'ALERT',
        data: {
          id:        `geo-${bus.shiftId}-${bus.stopIndex}`,
          variantId: bus.variantId,
          alertType: 'ARRIVAL',
          source:    'SYSTEM',
          message:   `${bus.fleetNumber} is arriving at ${currentStop.name}`,
          createdAt: new Date().toISOString(),
        },
      })
    )
  }
}
