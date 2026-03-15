import type {
  Corridor,
  Bus,
  Alert,
  FeedbackReport,
  FeedbackType,
} from '../types'

// ─── Feedback type definitions ──────────────────────────────────────────────────

export const FEEDBACK_TYPES: FeedbackType[] = [
  { id: 'full',     label: 'Bus is full',       icon: '👥' },
  { id: 'delayed',  label: 'Seems delayed',      icon: '⏳' },
  { id: 'arrived',  label: 'Bus arrived',        icon: '✅' },
  { id: 'skipped',  label: 'Skipped stop',       icon: '⚠️' },
  { id: 'accident', label: 'Accident on road',   icon: '🚨' },
  { id: 'smooth',   label: 'Traffic is smooth',  icon: '🟢' },
]

// ─── Corridors & route variants ─────────────────────────────────────────────────
//
// Stop coords are real approximate GPS positions for Nairobi landmarks.
// These will be replaced by the ops-dashboard-managed stop list once
// the backend is live.

export const CORRIDORS: Corridor[] = [
  {
    id: 'TH',
    name: 'Thika Road',
    color: '#00C896',
    variants: [
      {
        id: 1,
        code: 'TH-01-OUT',
        label: 'Outbound',
        direction: 'out',
        short: 'CBD → Thika',
        stops: [
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
          { id: 'globe',            name: 'Globe Roundabout', coords: { lat: -1.2796, lng: 36.8251 } },
          { id: 'pangani',          name: 'Pangani',          coords: { lat: -1.2689, lng: 36.8312 } },
          { id: 'muthaiga',         name: 'Muthaiga',         coords: { lat: -1.2534, lng: 36.8401 } },
          { id: 'roysambu',         name: 'Roysambu',         coords: { lat: -1.2201, lng: 36.8710 } },
          { id: 'kahawa_west',      name: 'Kahawa West',      coords: { lat: -1.1876, lng: 36.9012 } },
          { id: 'thika_town',       name: 'Thika Town',       coords: { lat: -1.0332, lng: 37.0693 } },
          { id: 'makongenig',       name: 'Makongeni',       coords: { lat: -1.0332, lng: 37.0693 } }
        ],
      },
      {
        id: 2,
        code: 'TH-01-IN',
        label: 'Inbound',
        direction: 'in',
        short: 'Thika → CBD',
        stops: [
          { id: 'thika_town',       name: 'Thika Town',       coords: { lat: -1.0332, lng: 37.0693 } },
          { id: 'kahawa_west',      name: 'Kahawa West',      coords: { lat: -1.1876, lng: 36.9012 } },
          { id: 'roysambu',         name: 'Roysambu',         coords: { lat: -1.2201, lng: 36.8710 } },
          { id: 'muthaiga',         name: 'Muthaiga',         coords: { lat: -1.2534, lng: 36.8401 } },
          { id: 'pangani',          name: 'Pangani',          coords: { lat: -1.2689, lng: 36.8312 } },
          { id: 'globe',            name: 'Globe Roundabout', coords: { lat: -1.2796, lng: 36.8251 } },
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
        ],
      },
      {
        id: 3,
        code: 'TH-01-EXP',
        label: 'Express',
        direction: 'out',
        short: 'CBD → Thika (Exp)',
        stops: [
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
          { id: 'roysambu',         name: 'Roysambu',         coords: { lat: -1.2201, lng: 36.8710 } },
          { id: 'thika_town',       name: 'Thika Town',       coords: { lat: -1.0332, lng: 37.0693 } },
        ],
      },
    ],
  },
  {
    id: 'WL',
    name: 'Westlands',
    color: '#4D9FFF',
    variants: [
      {
        id: 4,
        code: 'WL-02-OUT',
        label: 'Outbound',
        direction: 'out',
        short: 'CBD → Westlands',
        stops: [
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
          { id: 'university_way',   name: 'University Way',   coords: { lat: -1.2792, lng: 36.8128 } },
          { id: 'museum_hill',      name: 'Museum Hill',      coords: { lat: -1.2735, lng: 36.8082 } },
          { id: 'westlands',        name: 'Westlands',        coords: { lat: -1.2636, lng: 36.8065 } },
          { id: 'sarit',            name: 'Sarit Centre',     coords: { lat: -1.2601, lng: 36.8030 } },
        ],
      },
      {
        id: 5,
        code: 'WL-02-IN',
        label: 'Inbound',
        direction: 'in',
        short: 'Westlands → CBD',
        stops: [
          { id: 'sarit',            name: 'Sarit Centre',     coords: { lat: -1.2601, lng: 36.8030 } },
          { id: 'westlands',        name: 'Westlands',        coords: { lat: -1.2636, lng: 36.8065 } },
          { id: 'museum_hill',      name: 'Museum Hill',      coords: { lat: -1.2735, lng: 36.8082 } },
          { id: 'university_way',   name: 'University Way',   coords: { lat: -1.2792, lng: 36.8128 } },
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
        ],
      },
    ],
  },
  {
    id: 'NG',
    name: 'Ngong Road',
    color: '#FFB800',
    variants: [
      {
        id: 6,
        code: 'NG-03-OUT',
        label: 'Outbound',
        direction: 'out',
        short: 'CBD → Ngong',
        stops: [
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
          { id: 'upperhill',        name: 'Upperhill',        coords: { lat: -1.2966, lng: 36.8183 } },
          { id: 'kilimani',         name: 'Kilimani',         coords: { lat: -1.2934, lng: 36.7871 } },
          { id: 'dagoretti',        name: 'Dagoretti',        coords: { lat: -1.3012, lng: 36.7512 } },
          { id: 'ngong',            name: 'Ngong',            coords: { lat: -1.3590, lng: 36.6600 } },
        ],
      },
      {
        id: 7,
        code: 'NG-03-IN',
        label: 'Inbound',
        direction: 'in',
        short: 'Ngong → CBD',
        stops: [
          { id: 'ngong',            name: 'Ngong',            coords: { lat: -1.3590, lng: 36.6600 } },
          { id: 'dagoretti',        name: 'Dagoretti',        coords: { lat: -1.3012, lng: 36.7512 } },
          { id: 'kilimani',         name: 'Kilimani',         coords: { lat: -1.2934, lng: 36.7871 } },
          { id: 'upperhill',        name: 'Upperhill',        coords: { lat: -1.2966, lng: 36.8183 } },
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
        ],
      },
    ],
  },
  {
    id: 'EL',
    name: 'Eastlands',
    color: '#FF6B6B',
    variants: [
      {
        id: 8,
        code: 'EL-04-OUT',
        label: 'Outbound',
        direction: 'out',
        short: 'CBD → Kayole',
        stops: [
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
          { id: 'bus_station',      name: 'Bus Station',      coords: { lat: -1.2921, lng: 36.8290 } },
          { id: 'pumwani',          name: 'Pumwani',          coords: { lat: -1.2801, lng: 36.8432 } },
          { id: 'jogoo_road',       name: 'Jogoo Road',       coords: { lat: -1.2876, lng: 36.8598 } },
          { id: 'umoja',            name: 'Umoja',            coords: { lat: -1.2832, lng: 36.8921 } },
          { id: 'kayole',           name: 'Kayole',           coords: { lat: -1.2712, lng: 36.9112 } },
        ],
      },
      {
        id: 9,
        code: 'EL-04-IN',
        label: 'Inbound',
        direction: 'in',
        short: 'Kayole → CBD',
        stops: [
          { id: 'kayole',           name: 'Kayole',           coords: { lat: -1.2712, lng: 36.9112 } },
          { id: 'umoja',            name: 'Umoja',            coords: { lat: -1.2832, lng: 36.8921 } },
          { id: 'jogoo_road',       name: 'Jogoo Road',       coords: { lat: -1.2876, lng: 36.8598 } },
          { id: 'pumwani',          name: 'Pumwani',          coords: { lat: -1.2801, lng: 36.8432 } },
          { id: 'bus_station',      name: 'Bus Station',      coords: { lat: -1.2921, lng: 36.8290 } },
          { id: 'archives',         name: 'Archives',         coords: { lat: -1.2833, lng: 36.8167 } },
        ],
      },
    ],
  },
]

// ─── Flat variant lookup ────────────────────────────────────────────────────────
// Useful when you have a variantId and need the full object + color

export const ALL_VARIANTS = CORRIDORS.flatMap((c) =>
  c.variants.map((v) => ({ ...v, color: c.color, corridorName: c.name }))
)

export const getVariantById = (id: number) =>
  ALL_VARIANTS.find((v) => v.id === id) ?? null

export const getCorridorById = (id: string) =>
  CORRIDORS.find((c) => c.id === id) ?? null

// ─── Mock buses ────────────────────────────────────────────────────────────────
//
// In production these come from the WebSocket / REST API.
// The coords here match the stop positions so the map renders correctly
// without a real GPS feed.

export const MOCK_BUSES: Bus[] = [
  {
    id: 'SM-047',
    variantId: 1,
    stopIndex: 2,
    eta: 4,
    speed: 28,
    status: 'on-time',
    passengers: 32,
    capacity: 50,
    coords: { lat: -1.2689, lng: 36.8312 }, // at Pangani
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'SM-112',
    variantId: 1,
    stopIndex: 4,
    eta: 14,
    speed: 0,
    status: 'delayed',
    delay: 7,
    passengers: 45,
    capacity: 50,
    coords: { lat: -1.2201, lng: 36.8710 }, // at Roysambu
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'SM-031',
    variantId: 2,
    stopIndex: 1,
    eta: 8,
    speed: 30,
    status: 'on-time',
    passengers: 22,
    capacity: 50,
    coords: { lat: -1.1876, lng: 36.9012 }, // Kahawa West (inbound)
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'SM-067',
    variantId: 3,
    stopIndex: 1,
    eta: 3,
    speed: 55,
    status: 'on-time',
    passengers: 12,
    capacity: 50,
    coords: { lat: -1.2201, lng: 36.8710 }, // Express at Roysambu
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'SM-023',
    variantId: 4,
    stopIndex: 1,
    eta: 6,
    speed: 35,
    status: 'on-time',
    passengers: 18,
    capacity: 50,
    coords: { lat: -1.2792, lng: 36.8128 }, // University Way
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'SM-089',
    variantId: 6,
    stopIndex: 2,
    eta: 9,
    speed: 22,
    status: 'on-time',
    passengers: 28,
    capacity: 50,
    coords: { lat: -1.2934, lng: 36.7871 }, // Kilimani
    lastUpdated: new Date().toISOString(),
  },
]

// ─── Mock alerts ───────────────────────────────────────────────────────────────

export const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    busId: 'SM-112',
    variantId: 1,
    msg: 'Jammed at Muthaiga junction, ~7 min delay',
    time: '2 min ago',
    type: 'delay',
    source: 'conductor',
  },
  {
    id: 2,
    busId: 'SM-047',
    variantId: 1,
    msg: 'Approaching Globe Roundabout stop',
    time: 'just now',
    type: 'arrival',
    source: 'system',
  },
  {
    id: 3,
    busId: 'SM-023',
    variantId: 4,
    msg: 'Bus very full, standing room only',
    time: '5 min ago',
    type: 'crowdsource',
    source: 'passenger',
  },
]

// ─── Mock feedback reports ─────────────────────────────────────────────────────

export const MOCK_FEEDBACK: FeedbackReport[] = [
  {
    id: 1,
    variantId: 1,
    stopName: 'Pangani',
    type: 'full',
    text: '',
    time: '3 min ago',
    votes: 4,
  },
  {
    id: 2,
    variantId: 1,
    stopName: 'Muthaiga',
    type: 'delayed',
    text: 'Been waiting 15 mins',
    time: '8 min ago',
    votes: 7,
  },
]