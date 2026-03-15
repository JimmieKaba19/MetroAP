import type { CSSProperties, ReactNode } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ghost'
type BadgeSize    = 'sm' | 'md'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  /** Override accent colour — used for per-corridor colour badges */
  color?: string
  style?: CSSProperties
  className?: string
}

// ─── Variant tokens ────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: '#1E2A4022', text: '#8A9BBB', border: '#1E2A4066' },
  success: { bg: '#00C89622', text: '#00C896', border: '#00C89644' },
  warning: { bg: '#FFB80022', text: '#FFB800', border: '#FFB80044' },
  danger:  { bg: '#FF6B6B22', text: '#FF6B6B', border: '#FF6B6B44' },
  info:    { bg: '#4D9FFF22', text: '#4D9FFF', border: '#4D9FFF44' },
  ghost:   { bg: 'transparent', text: '#6A7899', border: '#1E2A40' },
}

const SIZE_STYLES: Record<BadgeSize, { fontSize: number; padding: string; borderRadius: number }> = {
  sm: { fontSize: 10, padding: '2px 7px',  borderRadius: 20 },
  md: { fontSize: 12, padding: '4px 10px', borderRadius: 20 },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  color,
  style,
}: BadgeProps) {
  // If a custom colour is passed, derive the bg/border from it
  const v = color
    ? { bg: color + '22', text: color, border: color + '44' }
    : VARIANT_STYLES[variant]

  const s = SIZE_STYLES[size]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 600,
        letterSpacing: 0.3,
        background: v.bg,
        color: v.text,
        border: `1px solid ${v.border}`,
        fontSize: s.fontSize,
        padding: s.padding,
        borderRadius: s.borderRadius,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}