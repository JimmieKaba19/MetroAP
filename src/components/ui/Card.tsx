import type { CSSProperties, ReactNode, MouseEventHandler } from 'react'
import { useTheme } from '../../context/ThemeContext'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  /** Highlight the card with a coloured border + tinted background */
  accentColor?: string
  /** Show a top shimmer bar animation (used for actively tracked bus) */
  shimmer?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
  style?: CSSProperties
  padding?: string
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Card({
  children,
  accentColor,
  shimmer = false,
  onClick,
  style,
  padding = '1rem',
}: CardProps) {
  const { tokens: T } = useTheme()

  const isInteractive = Boolean(onClick)

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: accentColor ? accentColor + '14' : T.surface,
        border: `1px solid ${accentColor ? accentColor + '77' : T.border}`,
        borderRadius: 16,
        padding,
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {/* Shimmer bar — sits at the very top of the card */}
      {shimmer && accentColor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            animation: 'shimmer 2s infinite',
          }}
        />
      )}

      {children}
    </div>
  )
}