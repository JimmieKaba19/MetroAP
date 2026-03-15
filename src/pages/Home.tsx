import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useBusTracking } from '../context/BusTrackingContext'
import { useNotifications } from '../context/NotificationsContext'
import { useResponsive } from '../hooks/useResponsive'
import RouteMap from '../components/map/RouteMap'
import BusCard from '../components/BusCard'
import FeedbackPanel from '../components/FeedbackPanel'
import type { FeedbackTypeId } from '../types'

export default function Home() {
  const { tokens: T } = useTheme()
  const R = useResponsive()
  const [showCorridorMenu, setShowCorridorMenu] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const {
    corridors, selectedCorridor, selectedVariant, color,
    selectCorridor, selectVariant,
    selectedStopIndex, setSelectedStopIndex,
    buses, trackedBus, trackBus, untrackBus, etaCount,
  } = useBusTracking()

  const { feedbackList, submitFeedback, voteFeedback } = useNotifications()
  const stops = selectedVariant.stops

  const handleTrackToggle = (bus: typeof buses[number]) => {
    trackedBus?.id === bus.id ? untrackBus() : trackBus(bus)
  }

  const handleFeedbackSubmit = (type: FeedbackTypeId, text: string) => {
    submitFeedback(selectedVariant.id, stops[selectedStopIndex]?.name ?? '', type, text, trackedBus?.id)
  }

  if (showFeedback) {
    return (
      <FeedbackPanel
        variant={selectedVariant} color={color}
        selectedStopIndex={selectedStopIndex}
        feedbackList={feedbackList}
        onSubmit={handleFeedbackSubmit}
        onClose={() => setShowFeedback(false)}
        onVote={voteFeedback}
      />
    )
  }

  const label = (text: string) => (
    <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: '0.5rem' }}>
      {text}
    </div>
  )

  return (
    <div style={{ animation: 'slideUp 0.35s ease' }}>

      {/* ── Corridor selector ── */}
      <div style={{ marginBottom: R.sectionGap }}>
        {label('ROUTE CORRIDOR')}
        <button
          onClick={() => setShowCorridorMenu(v => !v)}
          style={{ width: '100%', background: T.surface, border: `1px solid ${color}55`, borderRadius: R.cardRadius, padding: R.cardPadding, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: R.bodySize, fontWeight: 600, color: T.text }}>{selectedCorridor.name}</div>
              <div style={{ fontSize: R.subSize, color: T.textSub }}>{selectedCorridor.variants.length} variants available</div>
            </div>
          </div>
          <span style={{ color: T.textSub, fontSize: R.subSize }}>{showCorridorMenu ? '▲' : '▼'}</span>
        </button>

        {showCorridorMenu && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: R.cardRadius, marginTop: 4, overflow: 'hidden', animation: 'slideUp 0.2s ease' }}>
            {corridors.map(c => (
              <button key={c.id} onClick={() => { selectCorridor(c); setShowCorridorMenu(false) }}
                style={{ width: '100%', padding: `0.7rem ${R.cardPadding}`, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10, background: c.id === selectedCorridor.id ? c.color + '11' : 'transparent', cursor: 'pointer', border: 'none', textAlign: 'left' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: R.bodySize, color: c.id === selectedCorridor.id ? c.color : T.textSub, fontWeight: c.id === selectedCorridor.id ? 600 : 400 }}>{c.name}</span>
                <span style={{ fontSize: R.subSize, color: T.textMuted, marginLeft: 'auto' }}>{c.variants.length} variants</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Direction pills ── */}
      <div style={{ marginBottom: R.sectionGap }}>
        {label('DIRECTION & TYPE')}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {selectedCorridor.variants.map(v => {
            const isActive = v.id === selectedVariant.id
            const icon = v.label === 'Express' ? '⚡' : v.direction === 'out' ? '→' : '←'
            return (
              <button key={v.id} onClick={() => selectVariant(v)} style={{ padding: `${R.chipPaddingV} ${R.chipPaddingH}`, borderRadius: 20, background: isActive ? color : T.surface, color: isActive ? '#000' : T.textSub, fontSize: R.chipFontSize, fontWeight: isActive ? 700 : 400, border: `1px solid ${isActive ? color : T.border}`, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>
                {icon} {v.label}
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 6, fontSize: R.subSize, color: T.textMuted }}>{selectedVariant.short}</div>
      </div>

      {/* ── Boarding stop chips ── */}
      <div style={{ marginBottom: R.sectionGap }}>
        {label('YOUR BOARDING STOP')}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {stops.slice(0, -1).map((stop, i) => (
            <button key={stop.id} onClick={() => setSelectedStopIndex(i)} style={{ padding: `${R.chipPaddingV} ${R.chipPaddingH}`, borderRadius: 20, whiteSpace: 'nowrap', background: selectedStopIndex === i ? color : T.surface, color: selectedStopIndex === i ? '#000' : T.textSub, fontSize: R.chipFontSize, fontWeight: selectedStopIndex === i ? 600 : 400, border: `1px solid ${selectedStopIndex === i ? color : T.border}`, cursor: 'pointer', transition: 'all 0.15s ease' }}>
              {stop.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Route map ── */}
      <div style={{ marginBottom: R.sectionGap }}>
        <RouteMap variant={selectedVariant} color={color} trackedBus={trackedBus} selectedStopIndex={selectedStopIndex} etaCount={etaCount} />
      </div>

      {/* ── Tracked bus ETA hero ── */}
      {trackedBus && (
        <div style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)`, border: `1px solid ${color}55`, borderRadius: R.cardRadius, padding: R.cardPadding, marginBottom: R.sectionGap, animation: 'slideUp 0.3s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: R.labelSize, color, letterSpacing: 1, marginBottom: 2 }}>TRACKING {trackedBus.id}</div>
            <div style={{ fontSize: R.etaHeroSize, fontWeight: 700, color: T.text, fontFamily: 'monospace', lineHeight: 1 }}>
              {etaCount}<span style={{ fontSize: R.subSize, color: T.textSub, fontWeight: 400 }}> min</span>
            </div>
            <div style={{ fontSize: R.subSize, color: T.textSub, marginTop: 2 }}>to {stops[selectedStopIndex]?.name}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, animation: 'float 2s ease-in-out infinite' }}>🚌</div>
            <div style={{ fontSize: R.subSize, color, marginTop: 4 }}>{trackedBus.speed} km/h</div>
          </div>
        </div>
      )}

      {/* ── Report button ── */}
      <button onClick={() => setShowFeedback(true)} style={{ width: '100%', marginBottom: R.sectionGap, background: T.surface, border: `1px dashed ${color}66`, borderRadius: R.cardRadius, padding: R.cardPadding, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s ease', minHeight: 48 }}>
        <span style={{ fontSize: 16 }}>📢</span>
        <span style={{ fontSize: R.bodySize, color, fontWeight: 600 }}>Report from the road</span>
        {R.tier !== 'compact' && <span style={{ fontSize: R.subSize, color: T.textMuted }}>· ma3route style</span>}
      </button>

      {/* ── Bus cards ── */}
      <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: '0.5rem' }}>
        BUSES ON {selectedVariant.short.toUpperCase()} ({buses.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: R.cardGap }}>
        {buses.length > 0 ? buses.map(bus => (
          <BusCard key={bus.id} bus={bus} variant={selectedVariant} color={color}
            isTracked={trackedBus?.id === bus.id} onTrack={handleTrackToggle}
            stopFeedback={feedbackList.filter(f => f.variantId === selectedVariant.id && f.stopName === stops[bus.stopIndex]?.name)} />
        )) : (
          <div style={{ background: T.surface, borderRadius: R.cardRadius, padding: '2rem', textAlign: 'center', color: T.textSub, fontSize: R.bodySize }}>
            No buses on this variant right now
          </div>
        )}
      </div>
    </div>
  )
}