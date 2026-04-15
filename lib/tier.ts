import type { Tier } from '@/types'

export const FEATURES = {
  refresh_interval_ms: { free: 30000, plus: 15000, pro: 10000 },
  history_limit:       { free: 10,    plus: 999,   pro: 999 },
  saved_locations:     { free: 1,     plus: 5,     pro: 999 },
  watchlist_airline:   { free: false, plus: true,  pro: true },
  watchlist_flight:    { free: false, plus: false, pro: true },
  watchlist_tail:      { free: false, plus: false, pro: true },
  watchlist_type:      { free: false, plus: false, pro: true },
  widget:              { free: false, plus: true,  pro: true },
  faster_refresh:      { free: false, plus: true,  pro: true },
} as const

type Feature = keyof typeof FEATURES

export function can(feature: Feature, tier: Tier): boolean {
  const val = FEATURES[feature][tier]
  return typeof val === 'boolean' ? val : val > 0
}

export function limit(feature: Feature, tier: Tier): number {
  const val = FEATURES[feature][tier]
  return typeof val === 'number' ? val : (val ? 1 : 0)
}
