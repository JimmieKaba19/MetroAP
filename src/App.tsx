import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { NotificationsProvider, useNotifications } from './context/NotificationsContext'
import { BusTrackingProvider } from './context/BusTrackingContext'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { useResponsive } from './hooks/useResponsive'
import InstallBanner from './components/InstallBanner'

import Home from './pages/Home'
import RoutesPage from './pages/Routes'
import Notifications from './pages/Notifications'

const NAV_ITEMS = [
  { to: '/',              icon: '🏠', label: 'Home'   },
  { to: '/routes',        icon: '🗺️', label: 'Routes' },
  { to: '/notifications', icon: '🔔', label: 'Alerts' },
]

// ─── Side nav — tablet/desktop only ──────────────────────────────────────────

function SideNav() {
  const { tokens: T } = useTheme()
  const { unreadCount, markAllRead } = useNotifications()
  const R = useResponsive()

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      flexShrink: 0,
      borderRight: `1px solid ${T.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      height: '100dvh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
    }}>
      <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: 10, color: T.textSub, letterSpacing: 2, marginBottom: 4 }}>MetroAP</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>🚌 MetroAP</div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={item.to === '/notifications' ? markAllRead : undefined} style={{ textDecoration: 'none', display: 'block' }}>
            {({ isActive }) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1.25rem', margin: '2px 0.75rem', borderRadius: 12, background: isActive ? '#00C89618' : 'transparent', transition: 'background 0.15s ease', position: 'relative' }}>
                {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: '#00C896' }} />}
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: R.bodySize, color: isActive ? '#00C896' : T.textSub, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                {item.to === '/notifications' && unreadCount > 0 && (
                  <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#FF6B6B', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {unreadCount}
                  </div>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', display: 'inline-block', boxShadow: '0 0 6px #00C896' }} />
        <span style={{ fontSize: 10, color: '#00C896' }}>LIVE</span>
      </div>
    </aside>
  )
}

// ─── Main layout ──────────────────────────────────────────────────────────────

function AppLayout() {
  const { tokens: T, isDark, toggleTheme } = useTheme()
  const { unreadCount, markAllRead }        = useNotifications()
  const { canInstall, triggerInstall, dismissInstall } = useInstallPrompt()
  const R        = useResponsive()
  const location = useLocation()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning 👋'
    if (hour < 18) return 'Good afternoon 👋'
    return 'Good evening 👋'
  }

  const PAGE_TITLES: Record<string, string> = {
    '/':              getGreeting(),
    '/routes':        'All Routes',
    '/notifications': 'Alerts',
  }
  const title = PAGE_TITLES[location.pathname] ?? 'MetroAP'

  // ── TABLET / DESKTOP layout ───────────────────────────────────────────────
  if (R.isTablet) {
    return (
      <div style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: T.bg,
        minHeight: '100dvh',
        display: 'flex',
        // Full width — no artificial cap, fills the screen
        width: '100%',
      }}>
        <SideNav />

        {/* Right: header + scrollable content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Sticky header */}
          <div style={{
            padding: '1rem 2rem',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: T.bg,
            zIndex: 10,
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: 2 }}>MetroAP</div>
              <h1 style={{ fontSize: R.titleSize, fontWeight: 700, color: T.text, letterSpacing: -0.5, margin: 0 }}>{title}</h1>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#00C89611', border: '1px solid #00C89633' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', display: 'inline-block', boxShadow: '0 0 6px #00C896' }} />
                <span style={{ fontSize: R.subSize, color: '#00C896', fontWeight: 600 }}>LIVE</span>
              </div>
              <button onClick={toggleTheme} aria-label="Toggle theme" style={{ width: 44, height: 26, borderRadius: 13, background: isDark ? '#1E2A40' : '#DDE4F0', border: `1px solid ${T.border}`, position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease' }}>
                <div style={{ position: 'absolute', top: 3, left: isDark ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: isDark ? '#4D9FFF' : '#FFB800', transition: 'left 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  {isDark ? '🌙' : '☀️'}
                </div>
              </button>
            </div>
          </div>

          {/* Scrollable page content — constrained width for readability */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '1.5rem 2rem',
            // Cap content width for readability on very wide screens
            maxWidth: 1200,
            width: '100%',
          }}>
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/routes"        element={<RoutesPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*"              element={<Home />} />
            </Routes>
          </div>
        </div>

        {canInstall && <InstallBanner onInstall={triggerInstall} onDismiss={dismissInstall} />}
      </div>
    )
  }

  // ── MOBILE layout — full width, no floating ───────────────────────────────
  const navHeight = `calc(${R.navIconSize + 28}px + var(--safe-bottom))`

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: T.bg,
      minHeight: '100dvh',
      // Full width on mobile — no maxWidth cap that causes floating
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Status bar */}
      <div style={{ padding: `calc(0.5rem + var(--safe-top)) 1.25rem 0`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: R.labelSize, color: T.statusText, fontFamily: 'monospace' }}>
          {new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', display: 'inline-block', boxShadow: '0 0 6px #00C896' }} />
          <span style={{ fontSize: R.labelSize, color: '#00C896' }}>LIVE</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '0.35rem 1.25rem 0.65rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: 2 }}>MetroAP</div>
            <h1 style={{ fontSize: R.titleSize, fontWeight: 700, color: T.text, letterSpacing: -0.5, margin: 0 }}>{title}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={toggleTheme} aria-label="Toggle theme" style={{ width: 44, height: 26, borderRadius: 13, background: isDark ? '#1E2A40' : '#DDE4F0', border: `1px solid ${T.border}`, position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: isDark ? 20 : 3, width: 18, height: 18, borderRadius: '50%', background: isDark ? '#4D9FFF' : '#FFB800', transition: 'left 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                {isDark ? '🌙' : '☀️'}
              </div>
            </button>
            <NavLink to="/notifications" onClick={markAllRead} style={{ position: 'relative', textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔔</div>
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#FF6B6B', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: `2px solid ${T.bg}` }}>
                  {unreadCount}
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: T.border, opacity: 0.5 }} />

      {/* Page content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: `0.75rem 1.25rem`, paddingBottom: navHeight, WebkitOverflowScrolling: 'touch' }}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/routes"        element={<RoutesPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*"              element={<Home />} />
        </Routes>
      </div>

      {canInstall && <InstallBanner onInstall={triggerInstall} onDismiss={dismissInstall} />}

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,           // span full screen width — no centering offset
        background: T.navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${T.border}`,
        paddingTop: '0.65rem',
        paddingBottom: `calc(0.85rem + var(--safe-bottom))`,
        paddingLeft: '1rem',
        paddingRight: '1rem',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 50,
      }}>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={item.to === '/notifications' ? markAllRead : undefined} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <div style={{ textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                <div style={{ width: R.navIconSize, height: R.navIconSize, borderRadius: 14, background: isActive ? '#00C89622' : 'transparent', border: `1px solid ${isActive ? '#00C89655' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: R.navIconSize * 0.45, margin: '0 auto 3px', transition: 'all 0.2s ease' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: R.navFontSize, color: isActive ? '#00C896' : T.textSub, fontWeight: isActive ? 600 : 400 }}>
                  {item.label}
                </span>
                {item.to === '/notifications' && unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: 0, right: '20%', width: 16, height: 16, borderRadius: '50%', background: '#FF6B6B', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: `2px solid ${T.bg}` }}>
                    {unreadCount}
                  </div>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BusTrackingProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </NotificationsProvider>
      </BusTrackingProvider>
    </ThemeProvider>
  )
}