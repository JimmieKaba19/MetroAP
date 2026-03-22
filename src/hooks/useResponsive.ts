import { useState, useEffect } from 'react'

// ─── Breakpoints ───────────────────────────────────────────────────────────────
//   compact  — small phones       (< 360px)
//   normal   — phones portrait    (360–767px)  ← covers 591px phones
//   tablet   — tablets / landscape (768–1023px)
//   wide     — desktops           (≥ 1024px)

export type ScreenTier = 'compact' | 'normal' | 'tablet' | 'wide'

export interface ResponsiveTokens {
  // Layout
  pagePadding: string
  cardPadding: string
  cardRadius: number
  sectionGap: string
  cardGap: string

  // Typography
  labelSize: number
  bodySize: number
  subSize: number
  titleSize: string
  monoSize: number
  etaHeroSize: string

  // Touch targets
  chipPaddingV: string
  chipPaddingH: string
  chipFontSize: number
  navIconSize: number
  navFontSize: number

  // Components
  busIdFontSize: number
  occupancyLabelSize: number
  mapStopSize: number
  mapStopFontSize: number
  mapLineWidth: number

  // Layout flags
  isTablet: boolean
  showSidePanel: boolean
  tier: ScreenTier
  vw: number
}

function tokensForWidth(vw: number): ResponsiveTokens {
  const tier: ScreenTier =
    vw < 360  ? 'compact'
    : vw < 768  ? 'normal'
    : vw < 1024 ? 'tablet'
    : 'wide'

  const base = {
    isTablet: tier === 'tablet' || tier === 'wide',
    showSidePanel: tier === 'tablet' || tier === 'wide',
    tier,
    vw,
  }

  if (tier === 'compact') return {
    ...base,
    pagePadding: '0 0.875rem',
    cardPadding: '0.75rem',
    cardRadius: 12,
    sectionGap: '0.65rem',
    cardGap: '0.5rem',
    labelSize: 9,
    bodySize: 12,
    subSize: 10,
    titleSize: '1.1rem',
    monoSize: 11,
    etaHeroSize: '2.2rem',
    chipPaddingV: '5px',
    chipPaddingH: '10px',
    chipFontSize: 11,
    navIconSize: 40,
    navFontSize: 9,
    busIdFontSize: 12,
    occupancyLabelSize: 9,
    mapStopSize: 7,
    mapStopFontSize: 7,
    mapLineWidth: 16,
  }

  if (tier === 'tablet') return {
    ...base,
    pagePadding: '0 2rem',
    cardPadding: '1.125rem',
    cardRadius: 18,
    sectionGap: '1rem',
    cardGap: '0.75rem',
    labelSize: 11,
    bodySize: 14,
    subSize: 12,
    titleSize: '1.6rem',
    monoSize: 13,
    etaHeroSize: '3.2rem',
    chipPaddingV: '8px',
    chipPaddingH: '16px',
    chipFontSize: 13,
    navIconSize: 50,
    navFontSize: 11,
    busIdFontSize: 14,
    occupancyLabelSize: 11,
    mapStopSize: 10,
    mapStopFontSize: 9,
    mapLineWidth: 26,
  }

  if (tier === 'wide') return {
    ...base,
    pagePadding: '0 2.5rem',
    cardPadding: '1.25rem',
    cardRadius: 20,
    sectionGap: '1.1rem',
    cardGap: '0.8rem',
    labelSize: 11,
    bodySize: 15,
    subSize: 13,
    titleSize: '1.75rem',
    monoSize: 14,
    etaHeroSize: '3.6rem',
    chipPaddingV: '8px',
    chipPaddingH: '18px',
    chipFontSize: 14,
    navIconSize: 52,
    navFontSize: 12,
    busIdFontSize: 15,
    occupancyLabelSize: 12,
    mapStopSize: 11,
    mapStopFontSize: 10,
    mapLineWidth: 30,
  }

  // normal — 360–767px (covers all portrait phones including 591px)
  return {
    ...base,
    pagePadding: '0 1.25rem',
    cardPadding: '1rem',
    cardRadius: 16,
    sectionGap: '0.85rem',
    cardGap: '0.6rem',
    labelSize: 10,
    bodySize: 13,
    subSize: 11,
    titleSize: '1.35rem',
    monoSize: 12,
    etaHeroSize: '2.8rem',
    chipPaddingV: '6px',
    chipPaddingH: '12px',
    chipFontSize: 12,
    navIconSize: 44,
    navFontSize: 10,
    busIdFontSize: 13,
    occupancyLabelSize: 10,
    mapStopSize: 9,
    mapStopFontSize: 8,
    mapLineWidth: 20,
  }
}

export function useResponsive(): ResponsiveTokens {
  const [tokens, setTokens] = useState<ResponsiveTokens>(() =>
    tokensForWidth(typeof window !== 'undefined' ? window.innerWidth : 390)
  )

  useEffect(() => {
    const update = () => setTokens(tokensForWidth(window.innerWidth))
    const observer = new ResizeObserver(update)
    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [])

  return tokens
}