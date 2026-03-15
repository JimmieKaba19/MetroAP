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
import { get } from 'node_modules/axios/index.d.cts'

const NAV_ITEMS = [
  { to: '/',              icon: '🏠', label: 'Home'   },
  { to: '/routes',        icon: '🗺️', label: 'Routes' },
  { to: '/notifications', icon: '🔔', label: 'Alerts' },
]

function AppLayout() {
  const { tokens: T, isDark, toggleTheme } = useTheme()
  const { unreadCount, markAllRead }        = useNotifications()
  const { canInstall, triggerInstall, dismissInstall } = useInstallPrompt()
  const R  = useResponsive()
  const location = useLocation()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const PAGE_TITLES: Record<string, string> = {
    '/':              getGreeting() + ' 👋',
    '/routes':        'All Routes',
    '/notifications': 'Alerts',
  }
  const title = PAGE_TITLES[location.pathname] ?? 'Nairobi Transit'

  // Nav height + safe area so content never hides under it
  const navHeight = `calc(${R.navIconSize + 28}px + var(--safe-bottom))`

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: T.bg,
      // minHeight: '100vh',
      minHeight: '100dvh',     // dynamic viewport height — fixes mobile browser chrome
      maxWidth: 480,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>

      {/* ── Status bar ── */}
      <div style={{
        padding: `calc(0.5rem + var(--safe-top)) 1.25rem 0`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: R.labelSize, color: T.statusText, fontFamily: 'monospace' }}>
          {new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', display: 'inline-block', boxShadow: '0 0 6px #00C896' }} />
          <span style={{ fontSize: R.labelSize, color: '#00C896' }}>LIVE</span>
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{ padding: `0.35rem 1.25rem 0.65rem` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: R.labelSize, color: T.textSub, letterSpacing: 1, marginBottom: 2 }}>
              NAIROBI TRANSIT
            </div>
            <h1 style={{ fontSize: R.titleSize, fontWeight: 700, color: T.text, letterSpacing: -0.5, margin: 0 }}>
              {title}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Theme toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme" style={{
              width: 44, height: 26, borderRadius: 13,
              background: isDark ? '#1E2A40' : '#DDE4F0',
              border: `1px solid ${T.border}`,
              position: 'relative', cursor: 'pointer',
              transition: 'background 0.3s ease', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3, left: isDark ? 20 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: isDark ? '#4D9FFF' : '#FFB800',
                transition: 'left 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
              }}>
                {isDark ? '🌙' : '☀️'}
              </div>
            </button>

            {/* Notification bell */}
            <NavLink to="/notifications" onClick={markAllRead} style={{ position: 'relative', textDecoration: 'none' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: T.surface, border: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🔔</div>
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#FF6B6B', fontSize: 10, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, border: `2px solid ${T.bg}`,
                }}>
                  {unreadCount}
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: T.border, opacity: 0.5 }} />

      {/* ── Page content — padded so it clears the fixed nav ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: `0.75rem 1.25rem`,
        paddingBottom: navHeight,
        WebkitOverflowScrolling: 'touch',
      }}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/routes"        element={<RoutesPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*"              element={<Home />} />
        </Routes>
      </div>

      {/* ── PWA install banner ── */}
      {canInstall && <InstallBanner onInstall={triggerInstall} onDismiss={dismissInstall} />}

      {/* ── Bottom nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
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
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={item.to === '/notifications' ? markAllRead : undefined}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            {({ isActive }) => (
              <div style={{ textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                <div style={{
                  width: R.navIconSize, height: R.navIconSize,
                  borderRadius: 14,
                  background: isActive ? '#00C89622' : 'transparent',
                  border: `1px solid ${isActive ? '#00C89655' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: R.navIconSize * 0.45,
                  margin: '0 auto 3px',
                  transition: 'all 0.2s ease',
                }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: R.navFontSize,
                  color: isActive ? '#00C896' : T.textSub,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'color 0.2s ease',
                }}>
                  {item.label}
                </span>
                {item.to === '/notifications' && unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: 0, right: '20%',
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#FF6B6B', fontSize: 9, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, border: `2px solid ${T.bg}`,
                  }}>
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