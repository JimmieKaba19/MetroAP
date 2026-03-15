import { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../context/NotificationsContext'
import { useResponsive } from '../hooks/useResponsive'
import { ALL_VARIANTS } from '../data/mockData'
import type { Alert } from '../types'

export default function Notifications() {
  const { tokens: T } = useTheme()
  const R = useResponsive()
  const { alerts, markAllRead } = useNotifications()

  useEffect(() => { markAllRead() }, [markAllRead])

  const getAccent = (source: string, variantId: number) => {
    if (source === 'passenger') return '#FFB800'
    if (source === 'conductor') return '#FF6B6B'
    return ALL_VARIANTS.find(v => v.id === variantId)?.color ?? '#4D9FFF'
  }

  const getSourceLabel = (source: string) => {
    if (source === 'passenger') return '👥 PASSENGER'
    if (source === 'conductor') return '⚠ CONDUCTOR'
    return '📍 SYSTEM'
  }

  return (
    <div style={{ animation: 'slideUp 0.35s ease' }}>
      <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: '0.85rem' }}>
        ALERTS & UPDATES
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: 'center', color: T.textSub, padding: '3rem 0', fontSize: R.bodySize }}>
          No notifications yet
        </div>
      ) : alerts.map((alert: Alert) => {
        const accent  = getAccent(alert.source, alert.variantId)
        const variant = ALL_VARIANTS.find(v => v.id === alert.variantId)
        return (
          <div key={alert.id} style={{ background: T.surface, border: `1px solid ${accent}33`, borderRadius: R.cardRadius, padding: R.cardPadding, marginBottom: '0.6rem', borderLeft: `3px solid ${accent}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: R.subSize, padding: '2px 7px', borderRadius: 20, background: accent + '22', color: accent, fontWeight: 600, border: `1px solid ${accent}44` }}>
                {getSourceLabel(alert.source)}
              </span>
              <span style={{ fontSize: R.subSize, color: T.textMuted }}>{alert.time}</span>
            </div>
            <div style={{ fontSize: R.bodySize, color: T.text, marginBottom: 4 }}>{alert.msg}</div>
            <div style={{ fontSize: R.subSize, color: T.textMuted, fontFamily: 'monospace' }}>
              Bus {alert.busId}{variant ? ` · ${variant.short}` : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}