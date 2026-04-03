import { config } from '../config.js'

// ─── OSRM map matching ─────────────────────────────────────────────────────────
// Snaps a raw GPS coordinate to the nearest point on the actual road network.
// This corrects GPS drift — a phone inside a bus can easily report a position
// 20–30m off the road, which confuses stop-matching logic.
//
// OSRM match endpoint: GET /match/v1/driving/{lon},{lat}
// Returns the nearest road coordinate + the name of the road.

interface MatchResult {
  lat: number
  lng: number
  roadName?: string
}

export async function snapToRoad(
  lat: number,
  lng: number
): Promise<MatchResult> {
  try {
    const url = `${config.osrmUrl}/nearest/v1/driving/${lng},${lat}`
    const res  = await fetch(url, { signal: AbortSignal.timeout(3000) })

    if (!res.ok) throw new Error(`OSRM returned ${res.status}`)

    const json = await res.json() as {
      code: string
      waypoints?: Array<{ location: [number, number]; name?: string }>
    }

    if (json.code !== 'Ok' || !json.waypoints?.length) {
      // Fall back to the original coords if OSRM fails
      return { lat, lng }
    }

    const [snappedLng, snappedLat] = json.waypoints[0].location
    return {
      lat: snappedLat,
      lng: snappedLng,
      roadName: json.waypoints[0].name,
    }
  } catch {
    // OSRM is best-effort — never block a GPS ping because of it
    return { lat, lng }
  }
}

// ─── Stop matching ─────────────────────────────────────────────────────────────
// Given a GPS position and an ordered list of stops, find the index of the
// closest stop the bus hasn't passed yet.
// Uses Haversine formula — accurate enough for city-scale distances.

interface StopCoord {
  lat: number
  lng: number
}

function haversineMetres(a: StopCoord, b: StopCoord): number {
  const R  = 6_371_000 // Earth radius in metres
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180

  const x =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function matchStopIndex(
  busLat: number,
  busLng: number,
  stops: StopCoord[],
  currentStopIndex: number
): number {
  let closestIndex = currentStopIndex
  let closestDist  = Infinity

  // Only look at the current stop onwards — buses don't go backwards
  for (let i = currentStopIndex; i < stops.length; i++) {
    const dist = haversineMetres({ lat: busLat, lng: busLng }, stops[i])
    if (dist < closestDist) {
      closestDist  = dist
      closestIndex = i
    }
    // Stop scanning once distances start growing significantly
    if (dist > closestDist + 500) break
  }

  return closestIndex
}

// ─── ETA calculation ───────────────────────────────────────────────────────────
// Rough estimate: remaining distance / current speed.
// More sophisticated: use OSRM route duration between bus position and stop.

export function estimateEtaMinutes(
  busLat: number,
  busLng: number,
  targetStop: StopCoord,
  speedKmh: number
): number {
  if (speedKmh < 2) return 99  // bus is stopped — can't estimate

  const distMetres = haversineMetres(
    { lat: busLat, lng: busLng },
    targetStop
  )
  const distKm   = distMetres / 1000
  const timeHours = distKm / speedKmh
  const timeMins  = Math.round(timeHours * 60)

  return Math.max(1, timeMins)
}
