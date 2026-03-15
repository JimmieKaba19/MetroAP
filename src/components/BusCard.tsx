import { useTheme } from '../context/ThemeContext'
import { useResponsive } from '../hooks/useResponsive'
import Card from './ui/Card'
import Badge from './ui/Badge'
import OccupancyBar from './ui/OccupancyBar'
import type { Bus, FeedbackReport, RouteVariant } from '../types'
import { FEEDBACK_TYPES } from '../data/mockData'

interface BusCardProps {
  bus: Bus
  variant: RouteVariant
  color: string
  isTracked: boolean
  onTrack: (bus: Bus) => void
  stopFeedback: FeedbackReport[]
}

export default function BusCard({ bus, variant, color, isTracked, onTrack, stopFeedback }: BusCardProps) {
  const { tokens: T } = useTheme()
  const R = useResponsive()

  const isDelayed  = bus.status === 'delayed'
  const isOffline  = bus.status === 'offline'
  const currentStop = variant.stops[bus.stopIndex]
  const nextStop    = variant.stops[bus.stopIndex + 1]

  return (
    <Card accentColor={isTracked ? color : undefined} shimmer={isTracked} onClick={() => onTrack(bus)}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: R.busIdFontSize, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>
              {bus.id}
            </span>
            {isOffline
              ? <Badge variant="ghost">offline</Badge>
              : isDelayed
              ? <Badge variant="danger">+{bus.delay}m delay</Badge>
              : <Badge variant="success">on time</Badge>
            }
          </div>
          <div style={{ fontSize: R.subSize, color: T.textSub }}>
            At: <span style={{ color: T.text }}>{currentStop?.name ?? '—'}</span>
            {' → '}
            <span style={{ color }}>{nextStop?.name ?? 'Terminal'}</span>
          </div>
        </div>

        {/* ETA */}
        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 8 }}>
          <div style={{ fontSize: R.tier === 'compact' ? '1.5rem' : '1.8rem', fontWeight: 700, color: isDelayed ? '#FF6B6B' : color, lineHeight: 1, fontFamily: 'monospace' }}>
            {bus.eta}
          </div>
          <div style={{ fontSize: R.subSize, color: T.textMuted }}>min away</div>
        </div>
      </div>

      {/* Occupancy */}
      <div style={{ marginBottom: stopFeedback.length > 0 ? '0.6rem' : 0 }}>
        <OccupancyBar passengers={bus.passengers} capacity={bus.capacity} accentColor={color} />
      </div>

      {/* Feedback badges */}
      {stopFeedback.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {stopFeedback.slice(0, R.tier === 'compact' ? 1 : 3).map(f => {
            const ft = FEEDBACK_TYPES.find(x => x.id === f.type)
            return <Badge key={f.id} variant="warning">{ft?.icon} {ft?.label}</Badge>
          })}
        </div>
      )}
    </Card>
  )
}