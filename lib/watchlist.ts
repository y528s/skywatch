import type { Aircraft, WatchlistItem, Tier } from '@/types'
import { can } from '@/lib/tier'

const WATCHLIST_TYPE_TO_FEATURE = {
  airline: 'watchlist_airline',
  flight_number: 'watchlist_flight',
  tail_number: 'watchlist_tail',
  aircraft_type: 'watchlist_type',
} as const

function matchesItem(aircraft: Aircraft, item: WatchlistItem): boolean {
  const val = item.value.trim()

  switch (item.type) {
    case 'airline':
      return (
        (aircraft.airline_name?.toLowerCase().includes(val.toLowerCase()) ?? false) ||
        (aircraft.callsign?.trim().toUpperCase().startsWith(val.toUpperCase()) ?? false)
      )

    case 'flight_number':
      return aircraft.callsign?.trim().toUpperCase() === val.toUpperCase()

    case 'tail_number':
      return (
        aircraft.hex?.toUpperCase() === val.toUpperCase() ||
        aircraft.callsign?.trim().toUpperCase() === val.toUpperCase()
      )

    case 'aircraft_type':
      return aircraft.aircraft_type?.toLowerCase().includes(val.toLowerCase()) ?? false

    default:
      return false
  }
}

export function checkWatchlist(
  aircraft: Aircraft[],
  watchlist: WatchlistItem[],
  tier: Tier
): Aircraft[] {
  const matched = new Map<string, Aircraft>()

  for (const item of watchlist) {
    if (!item.enabled) continue

    const feature = WATCHLIST_TYPE_TO_FEATURE[item.type]
    if (!can(feature, tier)) continue

    for (const ac of aircraft) {
      if (matched.has(ac.hex)) continue
      if (ac.distance_mi > item.radius_miles) continue
      if (matchesItem(ac, item)) {
        matched.set(ac.hex, ac)
      }
    }
  }

  return Array.from(matched.values())
}
