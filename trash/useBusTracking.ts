import { useState, useEffect, useCallback } from 'react'
import type { Bus, Corridor, RouteVariant } from '../types'
import {
  CORRIDORS,
  MOCK_BUSES,
} from '../data/mockData'

// ─── Return shape ──────────────────────────────────────────────────────────────

interface UseBusTrackingReturn {
  // Corridor + variant selection
  corridors: Corridor[]
  selectedCorridor: Corridor
  selectedVariant: RouteVariant
  color: string
  selectCorridor: (corridor: Corridor) => void
  selectVariant: (variant: RouteVariant) => void

  // Stop selection
  selectedStopIndex: number
  setSelectedStopIndex: (index: number) => void

  // Bus data
  buses: Bus[]
  trackedBus: Bus | null
  trackBus: (bus: Bus) => void
  untrackBus: () => void

  // ETA (live countdown from tracked bus)
  etaCount: number
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useBusTracking(): UseBusTrackingReturn {
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>(
    CORRIDORS[0]
  )
  const [selectedVariant, setSelectedVariant] = useState<RouteVariant>(
    CORRIDORS[0].variants[0]
  )
  const [selectedStopIndex, setSelectedStopIndex] = useState(0)
  const [trackedBus, setTrackedBus] = useState<Bus | null>(null)
  const [etaCount, setEtaCount] = useState(0)

  // Filter buses that are running the currently selected variant
  const buses = MOCK_BUSES.filter((b) => b.variantId === selectedVariant.id)

  // Tick the ETA countdown once a second
  useEffect(() => {
    if (!trackedBus) return

    setEtaCount(trackedBus.eta)

    const interval = setInterval(() => {
      setEtaCount((prev) => {
        if (prev <= 1) {
          // Bus has "arrived" — reset to a new cycle
          clearInterval(interval)
          return trackedBus.eta
        }
        return prev - 1
      })
    }, 60_000) // 1 real minute per tick (use 1000ms for demo speed)

    return () => clearInterval(interval)
  }, [trackedBus])

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

  const trackBus = useCallback((bus: Bus) => {
    setTrackedBus(bus)
    setEtaCount(bus.eta)
  }, [])

  const untrackBus = useCallback(() => {
    setTrackedBus(null)
  }, [])

  return {
    corridors: CORRIDORS,
    selectedCorridor,
    selectedVariant,
    color: selectedCorridor.color,
    selectCorridor,
    selectVariant,
    selectedStopIndex,
    setSelectedStopIndex,
    buses,
    trackedBus,
    trackBus,
    untrackBus,
    etaCount,
  }
}