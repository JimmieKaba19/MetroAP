import { useTheme } from '../../context/ThemeContext'
import { useResponsive } from '../../hooks/useResponsive'
import PulsingDot from '../ui/PulsingDot'
import type { RouteVariant, Bus } from '../../types'

interface RouteMapProps {
  variant: RouteVariant
  color: string
  trackedBus: Bus | null
  selectedStopIndex: number
  etaCount: number
}

export default function RouteMap({ variant, color, trackedBus, selectedStopIndex, etaCount }: RouteMapProps) {
  const { tokens: T, isDark } = useTheme()
  const R = useResponsive()
  const stops = variant.stops

  const directionLabel =
    variant.label === 'Express' ? '⚡ Express'
    : variant.direction === 'out' ? '→ Outbound'
    : '← Inbound'

  return (
    <div style={{ background: isDark ? '#0D1424' : '#E8EEF8', borderRadius: R.cardRadius, border: `1px solid ${T.border}`, padding: R.cardPadding, position: 'relative', overflow: 'hidden' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 25}%`, height: 1, background: T.border + '55' }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 2 }}>LIVE ROUTE MAP</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: R.labelSize, padding: '2px 8px', borderRadius: 20, background: color + '22', color, border: `1px solid ${color}44`, fontWeight: 600 }}>
              {directionLabel}
            </span>
            {trackedBus && <PulsingDot color={color} size={4} />}
          </div>
        </div>

        {/* Stop dots + lines */}
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 8 }}>
          {stops.map((stop, i) => {
            const isBusHere = trackedBus?.stopIndex === i
            const isPassed  = trackedBus != null && i < trackedBus.stopIndex
            const isMyStop  = i === selectedStopIndex
            const dotSize   = isMyStop ? R.mapStopSize + 3 : R.mapStopSize

            return (
              <div key={stop.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {isBusHere
                    ? <PulsingDot color={color} size={R.mapStopSize - 1} />
                    : <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: isPassed ? color + '55' : isMyStop ? color + '33' : T.border, border: `2px solid ${isMyStop ? color : isPassed ? color + '66' : T.border}`, flexShrink: 0 }} />
                  }
                  <span style={{ fontSize: R.mapStopFontSize, marginTop: 4, whiteSpace: 'nowrap', maxWidth: 44, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', color: isBusHere ? color : isMyStop ? color : T.textMuted, fontWeight: isBusHere || isMyStop ? 700 : 400 }}>
                    {stop.name}
                  </span>
                </div>
                {i < stops.length - 1 && (
                  <div style={{ width: R.mapLineWidth, height: 2, background: isPassed ? color + '55' : T.border, margin: '0 2px', marginBottom: 18, flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Status row */}
        {!trackedBus ? (
          <p style={{ textAlign: 'center', fontSize: R.subSize, color: T.textMuted, marginTop: 4 }}>
            Tap a bus below to track it live
          </p>
        ) : (
          <div style={{ marginTop: 6, padding: '6px 10px', background: color + '11', border: `1px solid ${color}33`, borderRadius: 8, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
            <span style={{ fontSize: R.subSize, color: T.textSub }}>🚌 {trackedBus.id} · {trackedBus.speed} km/h</span>
            <span style={{ fontSize: R.subSize, color, fontWeight: 600 }}>{etaCount}m to {stops[selectedStopIndex]?.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}