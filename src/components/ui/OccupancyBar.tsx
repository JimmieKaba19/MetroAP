import { useTheme } from '../../context/ThemeContext'
import { useResponsive } from '../../hooks/useResponsive'

interface OccupancyBarProps {
  passengers: number
  capacity: number
  accentColor: string
}

export default function OccupancyBar({ passengers, capacity, accentColor }: OccupancyBarProps) {
  const { tokens: T } = useTheme()
  const R = useResponsive()
  const pct = Math.min(100, Math.round((passengers / capacity) * 100))
  const isCrowded = pct > 80
  const fillColor = isCrowded ? '#FF6B6B' : accentColor

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: R.occupancyLabelSize, color: T.textMuted }}>occupancy</span>
        <span style={{ fontSize: R.occupancyLabelSize, color: isCrowded ? '#FF6B6B' : T.textSub }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: fillColor, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}