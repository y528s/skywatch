import { NextRequest, NextResponse } from 'next/server'
import { haversine } from '@/lib/haversine'
import { getAirline } from '@/lib/airlines'
import type { Aircraft } from '@/types'

// OpenSky state vector indices
const OS_ICAO = 0
const OS_CALLSIGN = 1
const OS_LON = 5
const OS_LAT = 6
const OS_BARO_ALT = 7
const OS_VELOCITY = 9
const OS_HEADING = 10
const OS_VERT_RATE = 11

function normalizeAdsbLol(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ac: any,
  userLat: number,
  userLon: number
): Aircraft | null {
  const lat = ac.lat
  const lon = ac.lon
  if (lat == null || lon == null) return null

  const callsign = ac.flight?.trim() || null
  const airline = getAirline(callsign)
  const altRaw = ac.alt_baro
  const altitude_ft = altRaw === 'ground' ? 0 : (typeof altRaw === 'number' ? altRaw : null)

  return {
    hex: ac.hex || '',
    callsign,
    airline_name: airline.name !== 'Unknown' ? airline.name : null,
    airline_color: airline.name !== 'Unknown' ? airline.color : null,
    lat,
    lon,
    altitude_ft,
    speed_kts: typeof ac.gs === 'number' ? Math.round(ac.gs) : null,
    heading: typeof ac.track === 'number' ? Math.round(ac.track) : null,
    vertical_rate_fpm: typeof ac.baro_rate === 'number' ? Math.round(ac.baro_rate) : null,
    aircraft_type: ac.t || null,
    origin: ac.ownOp || null,
    destination: null,
    distance_mi: haversine(userLat, userLon, lat, lon),
  }
}

function normalizeOpenSky(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any[],
  userLat: number,
  userLon: number
): Aircraft | null {
  const lat = state[OS_LAT]
  const lon = state[OS_LON]
  if (lat == null || lon == null) return null

  const callsign = state[OS_CALLSIGN]?.trim() || null
  const airline = getAirline(callsign)
  const altM = state[OS_BARO_ALT]
  const velMs = state[OS_VELOCITY]
  const vertMs = state[OS_VERT_RATE]

  return {
    hex: state[OS_ICAO] || '',
    callsign,
    airline_name: airline.name !== 'Unknown' ? airline.name : null,
    airline_color: airline.name !== 'Unknown' ? airline.color : null,
    lat,
    lon,
    altitude_ft: typeof altM === 'number' ? Math.round(altM * 3.28084) : null,
    speed_kts: typeof velMs === 'number' ? Math.round(velMs * 1.94384) : null,
    heading: typeof state[OS_HEADING] === 'number' ? Math.round(state[OS_HEADING]) : null,
    vertical_rate_fpm: typeof vertMs === 'number' ? Math.round(vertMs * 196.85) : null,
    aircraft_type: null,
    origin: null,
    destination: null,
    distance_mi: haversine(userLat, userLon, lat, lon),
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const lat = parseFloat(params.get('lat') || '')
  const lon = parseFloat(params.get('lon') || '')
  const radiusMi = parseFloat(params.get('radius') || '25')

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: 'Missing or invalid lat/lon parameters' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  let aircraft: Aircraft[] = []

  // Primary: adsb.lol
  try {
    const nm = Math.min(radiusMi * 0.868976, 250)
    const res = await fetch(
      `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${nm}`,
      { next: { revalidate: 0 } }
    )

    if (res.ok) {
      const data = await res.json()
      if (data.ac && Array.isArray(data.ac) && data.ac.length > 0) {
        aircraft = data.ac
          .map((ac: Record<string, unknown>) => normalizeAdsbLol(ac, lat, lon))
          .filter((ac: Aircraft | null): ac is Aircraft => ac !== null)
      }
    }
  } catch {
    // Fall through to OpenSky
  }

  // Fallback: OpenSky
  if (aircraft.length === 0) {
    try {
      const latDelta = radiusMi / 69
      const lonDelta = radiusMi / (69 * Math.cos((lat * Math.PI) / 180))

      const res = await fetch(
        `https://opensky-network.org/api/states/all?lamin=${lat - latDelta}&lomin=${lon - lonDelta}&lamax=${lat + latDelta}&lomax=${lon + lonDelta}`,
        { next: { revalidate: 0 } }
      )

      if (res.ok) {
        const data = await res.json()
        if (data.states && Array.isArray(data.states)) {
          aircraft = data.states
            .map((s: unknown[]) => normalizeOpenSky(s, lat, lon))
            .filter((ac: Aircraft | null): ac is Aircraft => ac !== null)
        }
      }
    } catch {
      // Both APIs failed
    }
  }

  // Filter to radius and sort by distance
  aircraft = aircraft
    .filter(ac => ac.distance_mi <= radiusMi)
    .sort((a, b) => a.distance_mi - b.distance_mi)

  return NextResponse.json(aircraft, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
