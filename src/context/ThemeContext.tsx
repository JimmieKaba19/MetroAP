import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { Theme, ThemeTokens } from '../types'

// ─── Token maps ────────────────────────────────────────────────────────────────

const darkTokens: ThemeTokens = {
  bg:         '#080D18',
  surface:    '#141B2D',
  surface2:   '#1A2337',
  border:     '#1E2A40',
  text:       '#E0E6F0',
  textSub:    '#6A7899',
  textMuted:  '#3A4A66',
  navBg:      '#0D1424EE',
  statusText: '#4A5A77',
}

const lightTokens: ThemeTokens = {
  bg:         '#F0F4FC',
  surface:    '#FFFFFF',
  surface2:   '#F7F9FF',
  border:     '#DDE4F0',
  text:       '#0D1424',
  textSub:    '#8898BB',
  textMuted:  '#AABBD4',
  navBg:      '#FFFFFFEE',
  statusText: '#9AAAC0',
}

// ─── Context shape ─────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: Theme
  tokens: ThemeTokens
  toggleTheme: () => void
  isDark: boolean
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Persist theme preference in localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('nbo-theme')
    if (saved === 'light' || saved === 'dark') return saved
    // Default to dark — matches our app aesthetic
    return 'dark'
  })

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('nbo-theme', theme)
    // Also set a data attribute on <html> in case you add global CSS theme vars later
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const value: ThemeContextValue = {
    theme,
    tokens: theme === 'dark' ? darkTokens : lightTokens,
    toggleTheme,
    isDark: theme === 'dark',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useTheme — consume theme tokens and toggle anywhere in the tree.
 *
 * @example
 * const { tokens, toggleTheme, isDark } = useTheme()
 * <div style={{ background: tokens.bg, color: tokens.text }}>...</div>
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>')
  }
  return ctx
}