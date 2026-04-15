export type Tier = 'free' | 'plus' | 'pro'

export type WatchlistItemType = 'airline' | 'flight_number' | 'tail_number' | 'aircraft_type'

export interface Aircraft {
  hex: string
  callsign: string | null
  airline_name: string | null
  airline_color: string | null
  lat: number
  lon: number
  altitude_ft: number | null
  speed_kts: number | null
  heading: number | null
  vertical_rate_fpm: number | null
  aircraft_type: string | null
  origin: string | null
  destination: string | null
  distance_mi: number
}

export interface WatchlistItem {
  id: string
  type: WatchlistItemType
  value: string
  label: string
  radius_miles: number
  enabled: boolean
  requires_tier: 'plus' | 'pro'
}

export interface AppSettings {
  lat: number
  lon: number
  radius: number
  theme: 'dark' | 'light'
  tier: Tier
  watchlist: WatchlistItem[]
  notifications_permission: 'granted' | 'denied' | 'default'
}
