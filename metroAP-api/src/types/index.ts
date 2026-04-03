// ─── Shared backend types ──────────────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string          // conductorId
  operatorId: string
  type: 'conductor'
}

// ── Live bus state (stored in Redis) ──────────────────────────────────────────

export interface LiveBusState {
  shiftId:    string
  busId:      string
  variantId:  string
  fleetNumber: string
  lat:        number
  lng:        number
  speed:      number
  heading?:   number
  stopIndex:  number   // current matched stop index
  status:     'on-time' | 'delayed' | 'offline'
  delayMins?: number
  passengers: number
  capacity:   number
  updatedAt:  string   // ISO timestamp
}

// ── ETA map (stored in Redis) ──────────────────────────────────────────────────
// Key = stopIndex (as string), Value = minutes until arrival

export type EtaMap = Record<string, number>

// ── GPS ping payload (from conductor app) ─────────────────────────────────────

export interface GpsPingPayload {
  lat:       number
  lng:       number
  speed:     number
  heading?:  number
  accuracy?: number
}

// ── WebSocket event payloads ───────────────────────────────────────────────────

export interface WsBusUpdate {
  type:  'BUS_UPDATE'
  data:  LiveBusState
}

export interface WsEtaUpdate {
  type: 'ETA_UPDATE'
  data: {
    variantId: string
    etaMap:    EtaMap
  }
}

export interface WsAlert {
  type: 'ALERT'
  data: {
    id:        string
    variantId: string
    alertType: string
    source:    string
    message:   string
    delayMins?: number
    createdAt: string
  }
}

export type WsEvent = WsBusUpdate | WsEtaUpdate | WsAlert

// ── API response wrappers ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok:   true
  data: T
}

export interface ApiError {
  ok:      false
  error:   string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
