import { useTheme } from '../context/ThemeContext'
import { useResponsive } from '../hooks/useResponsive'
import { CORRIDORS } from '../data/mockData'
import { useNavigate } from 'react-router-dom'

export default function RoutesPage() {
  const { tokens: T } = useTheme()
  const R = useResponsive()
  const navigate = useNavigate()

  return (
    <div style={{ animation: 'slideUp 0.35s ease' }}>
      <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: '0.85rem' }}>
        ALL CORRIDORS & VARIANTS
      </div>

      {CORRIDORS.map(corridor => (
        <div key={corridor.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: R.cardRadius, padding: R.cardPadding, marginBottom: R.sectionGap, borderLeft: `3px solid ${corridor.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: corridor.color }} />
            <span style={{ fontSize: R.bodySize + 1, fontWeight: 700, color: T.text }}>{corridor.name}</span>
            <span style={{ fontSize: R.subSize, color: T.textMuted, marginLeft: 'auto' }}>{corridor.variants.length} variants</span>
          </div>

          {corridor.variants.map(v => {
            const icon = v.label === 'Express' ? '⚡' : v.direction === 'out' ? '→' : '←'
            return (
              <button key={v.id} onClick={() => navigate('/')}
                style={{ width: '100%', padding: `0.65rem 0.75rem`, borderRadius: 10, background: T.surface2, marginBottom: 6, cursor: 'pointer', border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', transition: 'all 0.15s ease', minHeight: 48 }}>
                <div>
                  <div style={{ fontSize: R.bodySize, color: corridor.color, fontWeight: 600, marginBottom: 2 }}>{icon} {v.label}</div>
                  <div style={{ fontSize: R.subSize, color: T.textSub }}>{v.stops[0].name} → {v.stops[v.stops.length - 1].name}</div>
                  <div style={{ fontSize: R.subSize, color: T.textMuted, marginTop: 1 }}>{v.stops.length} stops</div>
                </div>
                <span style={{ fontSize: R.subSize, color: T.textMuted, fontFamily: 'monospace', flexShrink: 0, paddingLeft: 8 }}>{v.code}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}