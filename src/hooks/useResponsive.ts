import { useState, useEffect } from 'react'

// ─── Breakpoints ───────────────────────────────────────────────────────────────
// The app is a mobile-first PWA so we only need two tiers:
//   compact  — small phones (< 360px wide, e.g. older Android devices)
//   normal   — standard phones (360–420px, the sweet spot)
//   wide     — tablets / large phones in landscape (> 420px)

type ScreenTier = 'compact' | 'normal' | 'wide'

// ─── Responsive token set ──────────────────────────────────────────────────────

export interface ResponsiveTokens {
  // Layout
  pagePadding: string       // horizontal page padding
  cardPadding: string       // inner padding on cards
  cardRadius: number        // border-radius on cards
  sectionGap: string        // vertical gap between sections
  cardGap: string           // gap between stacked cards

  // Typography
  labelSize: number         // section label (e.g. "ROUTE CORRIDOR")
  bodySize: number          // body text
  subSize: number           // secondary / muted text
  titleSize: string         // page h1
  monoSize: number          // monospace (bus IDs, ETAs)
  etaHeroSize: string       // the big ETA number

  // Touch targets
  chipPaddingV: string      // stop chip vertical padding
  chipPaddingH: string      // stop chip horizontal padding
  chipFontSize: number      // stop chip label size
  navIconSize: number       // bottom nav icon container
  navFontSize: number       // bottom nav label

  // Specific components
  busIdFontSize: number
  occupancyLabelSize: number
  mapStopSize: number       // stop dot size on route map
  mapStopFontSize: number   // stop label on route map
  mapLineWidth: number      // connecting line between stops

  tier: ScreenTier
  vw: number                // current viewport width
}

// ─── Token values per tier ─────────────────────────────────────────────────────

function tokensForWidth(vw: number): ResponsiveTokens {
  const tier: ScreenTier =
    vw < 360 ? 'compact' : vw > 420 ? 'wide' : 'normal'

  if (tier === 'compact') {
    return {
      pagePadding: '0 0.875rem',
      cardPadding: '0.75rem',
      cardRadius: 12,
      sectionGap: '0.65rem',
      cardGap: '0.5rem',

      labelSize: 9,
      bodySize: 12,
      subSize: 10,
      titleSize: '1.15rem',
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
      mapLineWidth: 18,

      tier,
      vw,
    }
  }

  if (tier === 'wide') {
    return {
      pagePadding: '0 1.5rem',
      cardPadding: '1.125rem',
      cardRadius: 18,
      sectionGap: '1rem',
      cardGap: '0.75rem',

      labelSize: 11,
      bodySize: 14,
      subSize: 12,
      titleSize: '1.5rem',
      monoSize: 13,
      etaHeroSize: '3.2rem',

      chipPaddingV: '7px',
      chipPaddingH: '14px',
      chipFontSize: 13,
      navIconSize: 48,
      navFontSize: 11,

      busIdFontSize: 14,
      occupancyLabelSize: 11,
      mapStopSize: 10,
      mapStopFontSize: 9,
      mapLineWidth: 28,

      tier,
      vw,
    }
  }

  // normal (default / most phones)
  return {
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
    mapLineWidth: 22,

    tier,
    vw,
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useResponsive — returns layout tokens that scale to the current viewport.
 * Re-evaluates on window resize so rotations and browser zoom are handled.
 *
 * @example
 * const R = useResponsive()
 * <div style={{ padding: R.pagePadding, fontSize: R.bodySize }}>...</div>
 */
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