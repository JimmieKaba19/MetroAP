import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useResponsive } from '../hooks/useResponsive'
import Card from './ui/Card'
import type { FeedbackReport, RouteVariant, FeedbackTypeId } from '../types'
import { FEEDBACK_TYPES } from '../data/mockData'

interface FeedbackPanelProps {
  variant: RouteVariant
  color: string
  selectedStopIndex: number
  feedbackList: FeedbackReport[]
  onSubmit: (type: FeedbackTypeId, text: string) => void
  onClose: () => void
  onVote: (id: number) => void
}

export default function FeedbackPanel({ variant, color, selectedStopIndex, feedbackList, onSubmit, onClose, onVote }: FeedbackPanelProps) {
  const { tokens: T } = useTheme()
  const R = useResponsive()
  const [feedbackType, setFeedbackType] = useState<FeedbackTypeId | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const stopName = variant.stops[selectedStopIndex]?.name ?? ''
  const relevantFeedback = feedbackList.filter(f => f.variantId === variant.id)

  const handleSubmit = () => {
    if (!feedbackType) return
    onSubmit(feedbackType, feedbackText)
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setFeedbackType(null); setFeedbackText(''); onClose() }, 2000)
  }

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <Card style={{ marginBottom: '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: R.bodySize, fontWeight: 700, color: T.text }}>Report from the road</div>
            <div style={{ fontSize: R.subSize, color: T.textSub, marginTop: 2 }}>At: {stopName} · {variant.short}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textSub, fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ color: '#00C896', fontWeight: 600, fontSize: R.bodySize }}>Thanks! Report sent.</div>
            <div style={{ color: T.textSub, fontSize: R.subSize, marginTop: 4 }}>Helps other passengers nearby</div>
          </div>
        ) : (
          <>
            {/* Quick-select grid — 2 cols on compact, 2 cols always (screen is narrow) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: '0.75rem' }}>
              {FEEDBACK_TYPES.map(f => {
                const isActive = feedbackType === f.id
                return (
                  <button key={f.id} onClick={() => setFeedbackType(f.id)} style={{ padding: `${R.chipPaddingV} 0.75rem`, borderRadius: 12, background: isActive ? color + '22' : T.surface2, border: `1px solid ${isActive ? color + '77' : T.border}`, fontSize: R.subSize, color: isActive ? color : T.text, fontWeight: isActive ? 600 : 400, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 44 }}>
                    {f.icon} {f.label}
                  </button>
                )
              })}
            </div>

            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Add more detail… (optional)"
              rows={3}
              style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0.75rem', color: T.text, fontSize: R.subSize, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
            />

            <button onClick={handleSubmit} disabled={!feedbackType} style={{ width: '100%', marginTop: '0.6rem', background: feedbackType ? color : T.border, color: feedbackType ? '#000' : T.textMuted, border: 'none', borderRadius: 12, padding: '0.85rem', fontSize: R.bodySize, fontWeight: 700, cursor: feedbackType ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', minHeight: 48 }}>
              Submit Report
            </button>
          </>
        )}
      </Card>

      {/* Community feed */}
      {relevantFeedback.length > 0 && (
        <div>
          <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: '0.6rem' }}>
            RECENT REPORTS · {variant.short.toUpperCase()}
          </div>
          {relevantFeedback.map(f => {
            const ft = FEEDBACK_TYPES.find(x => x.id === f.type)
            return (
              <div key={f.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: R.cardRadius, padding: `0.75rem ${R.cardPadding}`, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: R.bodySize, color: T.text, marginBottom: f.text ? 2 : 0 }}>{ft?.icon} {ft?.label}</div>
                  {f.text && <div style={{ fontSize: R.subSize, color: T.textSub }}>{f.text}</div>}
                  <div style={{ fontSize: R.subSize, color: T.textMuted, marginTop: 2 }}>📍 {f.stopName} · {f.time}</div>
                </div>
                <button onClick={() => onVote(f.id)} style={{ textAlign: 'center', cursor: 'pointer', padding: '6px 12px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, flexShrink: 0, minWidth: 44, minHeight: 44 }}>
                  <div style={{ fontSize: 14 }}>👍</div>
                  <div style={{ fontSize: R.subSize, color, fontWeight: 600 }}>{f.votes}</div>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}