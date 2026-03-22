import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Bus, Corridor, RouteVariant } from '../types'
import { CORRIDORS, MOCK_BUSES } from '../data/mockData'

// ─── Context shape ─────────────────────────────────────────────────────────────

interface BusTrackingContextValue {
  // Corridor + variant
  corridors: Corridor[]
  selectedCorridor: Corridor
  selectedVariant: RouteVariant
  color: string
  selectCorridor: (corridor: Corridor) => void
  selectVariant: (variant: RouteVariant) => void
  /** Atomically select both corridor and a specific variant — use from Routes page */
  selectCorridorAndVariant: (corridor: Corridor, variant: RouteVariant) => void

  // Stop
  selectedStopIndex: number
  setSelectedStopIndex: (index: number) => void

  // Buses
  buses: Bus[]
  trackedBus: Bus | null
  trackBus: (bus: Bus) => void
  untrackBus: () => void

  // ETA countdown
  etaCount: number
}

// ─── Context ───────────────────────────────────────────────────────────────────

const BusTrackingContext = createContext<BusTrackingContextValue | null>(null)

// ─── Simulated bus movement ────────────────────────────────────────────────────
// Moves buses along their route every 15 seconds so the map feels live.
// When the real WebSocket is connected, this entire block is replaced by
// a socket.on('bus:update') listener in services/socket.ts.

function simulateBusMovement(buses: Bus[]): Bus[] {
  return buses.map((bus) => {
    // Only move buses that are on-time and moving
    if (bus.status === 'delayed' || bus.speed === 0) return bus

    // Randomly advance ETA by 1 minute (simulate movement)
    const newEta = Math.max(1, bus.eta - 1)

    // If ETA hits 1, wrap back to a longer ETA (bus "arrived", next one coming)
    const wrapped = newEta === 1
    return {
      ...bus,
      eta: wrapped ? bus.eta + 8 : newEta,
      stopIndex: wrapped
        ? Math.max(0, bus.stopIndex - 1)
        : bus.stopIndex,
      lastUpdated: new Date().toISOString(),
    }
  })
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function BusTrackingProvider({ children }: { children: ReactNode }) {
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>(CORRIDORS[0])
  const [selectedVariant, setSelectedVariant]   = useState<RouteVariant>(CORRIDORS[0].variants[0])
  const [selectedStopIndex, setSelectedStopIndex] = useState(0)
  const [trackedBus, setTrackedBus]             = useState<Bus | null>(null)
  const [etaCount, setEtaCount]                 = useState(0)
  const [buses, setBuses]                       = useState<Bus[]>(MOCK_BUSES)

  // ── Simulate live bus movement every 15 seconds ──
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prev) => simulateBusMovement(prev))
    }, 15_000)
    return () => clearInterval(interval)
  }, [])

  // ── Keep trackedBus in sync when buses array updates ──
  useEffect(() => {
    if (!trackedBus) return
    const updated = buses.find((b) => b.id === trackedBus.id)
    if (updated) setTrackedBus(updated)
  }, [buses]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── ETA countdown — ticks every real minute, resets when trackedBus changes ──
  useEffect(() => {
    if (!trackedBus) return
    setEtaCount(trackedBus.eta)

    const interval = setInterval(() => {
      setEtaCount((prev) => (prev > 1 ? prev - 1 : trackedBus.eta))
    }, 60_000)

    return () => clearInterval(interval)
  }, [trackedBus?.id]) // only reset when the tracked bus changes, not every re-render

  // ── Actions ──────────────────────────────────────────────────────────────────

  const selectCorridor = useCallback((corridor: Corridor) => {
    setSelectedCorridor(corridor)
    setSelectedVariant(corridor.variants[0])
    setTrackedBus(null)
    setSelectedStopIndex(0)
  }, [])

  const selectVariant = useCallback((variant: RouteVariant) => {
    setSelectedVariant(variant)
    setTrackedBus(null)
    setSelectedStopIndex(0)
  }, [])

  // Sets corridor + exact variant in one state flush — avoids the
  // intermediate render where corridor is updated but variant still
  // points to the previous corridor's first variant.
  const selectCorridorAndVariant = useCallback(
    (corridor: Corridor, variant: RouteVariant) => {
      setSelectedCorridor(corridor)
      setSelectedVariant(variant)
      setTrackedBus(null)
      setSelectedStopIndex(0)
    },
    []
  )
  const trackBus = useCallback((bus: Bus) => {
    setTrackedBus(bus)
    setEtaCount(bus.eta)
  }, [])

  const untrackBus = useCallback(() => {
    setTrackedBus(null)
  }, [])

  // Buses filtered to the selected variant
  const variantBuses = buses.filter((b) => b.variantId === selectedVariant.id)

  return (
    <BusTrackingContext.Provider
      value={{
        corridors: CORRIDORS,
        selectedCorridor,
        selectedVariant,
        color: selectedCorridor.color,
        selectCorridor,
        selectVariant,
        selectCorridorAndVariant,
        selectedStopIndex,
        setSelectedStopIndex,
        buses: variantBuses,
        trackedBus,
        trackBus,
        untrackBus,
        etaCount,
      }}
    >
      {children}
    </BusTrackingContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useBusTracking — consume live bus state anywhere in the tree.
 *
 * @example
 * const { buses, trackedBus, trackBus, color } = useBusTracking()
 */
export function useBusTracking(): BusTrackingContextValue {
  const ctx = useContext(BusTrackingContext)
  if (!ctx) {
    throw new Error('useBusTracking must be used inside <BusTrackingProvider>')
  }
  return ctx
}