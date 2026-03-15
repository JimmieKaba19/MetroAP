// ─── Types ─────────────────────────────────────────────────────────────────────

interface PulsingDotProps {
  color?: string
  size?: number
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PulsingDot({
  color = '#00C896',
  size = 10,
}: PulsingDotProps) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size * 2.5,
        height: size * 2.5,
        flexShrink: 0,
      }}
    >
      {/* Expanding ring */}
      <span
        style={{
          position: 'absolute',
          width: size * 2.2,
          height: size * 2.2,
          borderRadius: '50%',
          background: color + '33',
          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />
      {/* Solid dot */}
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          display: 'block',
          flexShrink: 0,
        }}
      />
    </span>
  )
}