import { useTheme } from '../context/ThemeContext'

interface InstallBannerProps {
  onInstall: () => void
  onDismiss: () => void
}

export default function InstallBanner({ onInstall, onDismiss }: InstallBannerProps) {
  const { tokens: T } = useTheme()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '5.5rem',           // sits above the bottom nav
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2.5rem)',
        maxWidth: 390,
        background: T.surface,
        border: '1px solid #00C89644',
        borderRadius: 16,
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.35s ease',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#00C89622',
          border: '1px solid #00C89644',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        🚌
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
          Add to Home Screen
        </div>
        <div style={{ fontSize: 11, color: T.textSub, marginTop: 1 }}>
          Get live bus updates instantly
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: 12,
            color: T.textSub,
            cursor: 'pointer',
          }}
        >
          Later
        </button>
        <button
          onClick={onInstall}
          style={{
            background: '#00C896',
            border: 'none',
            borderRadius: 8,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 700,
            color: '#000',
            cursor: 'pointer',
          }}
        >
          Install
        </button>
      </div>
    </div>
  )
}