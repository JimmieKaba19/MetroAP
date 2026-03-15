// ─── Primitives ────────────────────────────────────────────────────────────────

export type Direction = 'out' | 'in'
export type BusStatus = 'on-time' | 'delayed' | 'offline'
export type AlertType = 'delay' | 'arrival' | 'crowdsource' | 'breakdown'
export type AlertSource = 'conductor' | 'system' | 'passenger'
export type FeedbackTypeId =
  | 'full'
  | 'delayed'
  | 'arrived'
  | 'skipped'
  | 'accident'
  | 'smooth'
export type Theme = 'dark' | 'light'
export type Screen = 'home' | 'routes' | 'notifications'

// ─── Geography ─────────────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number
  lng: number
}

export interface Stop {
  id: string        // e.g. "archives", "pangani"
  name: string      // display name
  coords: Coordinates
}

// ─── Routes ────────────────────────────────────────────────────────────────────

export interface RouteVariant {
  id: number
  code: string        // e.g. "TH-01-OUT"
  label: string       // "Outbound" | "Inbound" | "Express"
  direction: Direction
  short: string       // e.g. "CBD → Thika"
  stops: Stop[]
}

export interface Corridor {
  id: string          // e.g. "TH"
  name: string        // e.g. "Thika Road"
  color: string       // hex accent color for this corridor
  variants: RouteVariant[]
}

// ─── Buses ─────────────────────────────────────────────────────────────────────

export interface Bus {
  id: string            // e.g. "SM-047"
  variantId: number
  stopIndex: number     // index into the variant's stops array (current position)
  eta: number           // minutes to the passenger's selected stop
  speed: number         // km/h
  status: BusStatus
  delay?: number        // minutes late, only present when status === 'delayed'
  passengers: number
  capacity: number
  coords: Coordinates   // live GPS position
  lastUpdated: string   // ISO timestamp of last GPS ping
}

// ─── Alerts & Feedback ─────────────────────────────────────────────────────────

export interface Alert {
  id: number
  busId: string
  variantId: number
  msg: string
  time: string          // human-readable e.g. "2 min ago"
  type: AlertType
  source: AlertSource
}

export interface FeedbackType {
  id: FeedbackTypeId
  label: string
  icon: string
}

export interface FeedbackReport {
  id: number
  variantId: number
  stopName: string
  type: FeedbackTypeId
  text: string
  time: string
  votes: number
}

// ─── Theme ─────────────────────────────────────────────────────────────────────

/**
 * All colour tokens used throughout the app.
 * Swap dark/light by changing these values in ThemeContext.
 */
export interface ThemeTokens {
  bg: string
  surface: string
  surface2: string
  border: string
  text: string
  textSub: string
  textMuted: string
  navBg: string
  statusText: string
}