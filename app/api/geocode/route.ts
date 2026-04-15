import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      {
        headers: { 'User-Agent': 'Skywatch/1.0' },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Geocoding service error' },
        { status: 502 }
      )
    }

    const results = await res.json()

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    const { lat, lon, display_name } = results[0]

    return NextResponse.json({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      display_name,
    })
  } catch {
    return NextResponse.json(
      { error: 'Geocoding request failed' },
      { status: 500 }
    )
  }
}
