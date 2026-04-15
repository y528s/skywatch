'use client'

import { useState } from 'react'
import type { AppSettings } from '@/types'

interface SetupScreenProps {
  onComplete: (settings: AppSettings) => void
  existingSettings: AppSettings | null
}

const DEFAULT_RADIUS = 25

export default function SetupScreen({ onComplete, existingSettings }: SetupScreenProps) {
  const [lat, setLat] = useState(existingSettings?.lat?.toString() || '')
  const [lon, setLon] = useState(existingSettings?.lon?.toString() || '')
  const [radius, setRadius] = useState(existingSettings?.radius || DEFAULT_RADIUS)
  const [theme, setTheme] = useState<'dark' | 'light'>(existingSettings?.theme || 'dark')
  const [placeName, setPlaceName] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [locating, setLocating] = useState(false)

  async function handleGeocode() {
    if (!placeName.trim()) return
    setGeocoding(true)
    setGeoError('')
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(placeName)}`)
      const data = await res.json()
      if (res.ok) {
        setLat(data.lat.toFixed(6))
        setLon(data.lon.toFixed(6))
      } else {
        setGeoError(data.error || 'Location not found')
      }
    } catch {
      setGeoError('Geocoding failed')
    }
    setGeocoding(false)
  }

  function handleUseMyLocation() {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation not supported')
      return
    }
    setLocating(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLon(pos.coords.longitude.toFixed(6))
        setLocating(false)
      },
      (err) => {
        setGeoError(err.message || 'Location access denied')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function handleSubmit() {
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    if (isNaN(latNum) || isNaN(lonNum)) {
      setGeoError('Please enter valid coordinates')
      return
    }

    const settings: AppSettings = {
      lat: latNum,
      lon: lonNum,
      radius,
      theme,
      tier: existingSettings?.tier || 'free',
      watchlist: existingSettings?.watchlist || [],
      notifications_permission: existingSettings?.notifications_permission || 'default',
    }

    onComplete(settings)
  }

  const isDark = theme === 'dark'

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(0.8rem, 1.5vw, 1.1rem)',
    background: isDark ? 'rgba(0,255,150,0.06)' : 'rgba(10,22,40,0.04)',
    border: `1px solid ${isDark ? 'rgba(0,255,150,0.15)' : 'rgba(10,22,40,0.12)'}`,
    borderRadius: '6px',
    color: isDark ? '#00ff96' : '#0a1628',
    padding: '12px 14px',
    width: '100%',
    minHeight: '44px',
    outline: 'none',
  }

  const buttonStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(0.65rem, 1.3vw, 0.95rem)',
    letterSpacing: '0.1em',
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    minHeight: '44px',
    minWidth: '44px',
  }

  return (
    <div
      data-theme={theme}
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 40px)',
        background: isDark ? '#000' : '#fff',
        color: isDark ? '#00ff96' : '#0a1628',
        transition: 'background-color 300ms, color 300ms',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(12px, 2vw, 20px)',
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.4rem, 3.5vw, 2.5rem)',
          letterSpacing: '0.15em',
          textAlign: 'center',
          color: isDark ? '#00ff96' : '#0057ff',
          marginBottom: '8px',
        }}>
          &#9992; SKYWATCH
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)',
          color: isDark ? 'rgba(0,255,150,0.5)' : 'rgba(10,22,40,0.5)',
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          Set your location to start tracking overhead flights
        </p>

        {/* Place name search */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search city or address..."
            value={placeName}
            onChange={e => setPlaceName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGeocode()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={handleGeocode}
            disabled={geocoding}
            style={{
              ...buttonStyle,
              background: isDark ? '#00ff96' : '#0057ff',
              color: isDark ? '#000' : '#fff',
              opacity: geocoding ? 0.6 : 1,
            }}
          >
            {geocoding ? '...' : 'FIND'}
          </button>
        </div>

        {/* Use my location */}
        <button
          onClick={handleUseMyLocation}
          disabled={locating}
          style={{
            ...buttonStyle,
            width: '100%',
            background: 'transparent',
            border: `1px solid ${isDark ? 'rgba(0,255,150,0.3)' : 'rgba(10,22,40,0.2)'}`,
            color: isDark ? 'rgba(0,255,150,0.7)' : 'rgba(10,22,40,0.6)',
            opacity: locating ? 0.6 : 1,
          }}
        >
          {locating ? 'LOCATING...' : '\u2316 USE MY LOCATION'}
        </button>

        {/* Manual lat/lon */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.5rem, 0.9vw, 0.7rem)',
              letterSpacing: '0.1em',
              color: isDark ? 'rgba(0,255,150,0.5)' : 'rgba(10,22,40,0.5)',
              display: 'block',
              marginBottom: '4px',
            }}>
              LATITUDE
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="40.7128"
              value={lat}
              onChange={e => setLat(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.5rem, 0.9vw, 0.7rem)',
              letterSpacing: '0.1em',
              color: isDark ? 'rgba(0,255,150,0.5)' : 'rgba(10,22,40,0.5)',
              display: 'block',
              marginBottom: '4px',
            }}>
              LONGITUDE
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="-74.0060"
              value={lon}
              onChange={e => setLon(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Radius */}
        <div>
          <label style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(0.5rem, 0.9vw, 0.7rem)',
            letterSpacing: '0.1em',
            color: isDark ? 'rgba(0,255,150,0.5)' : 'rgba(10,22,40,0.5)',
            display: 'block',
            marginBottom: '8px',
          }}>
            RADIUS: {radius} MILES
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[5, 10, 25, 50, 100].map(r => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  minWidth: '60px',
                  background: radius === r
                    ? (isDark ? '#00ff96' : '#0057ff')
                    : 'transparent',
                  color: radius === r
                    ? (isDark ? '#000' : '#fff')
                    : (isDark ? '#00ff96' : '#0a1628'),
                  border: `1px solid ${isDark ? 'rgba(0,255,150,0.3)' : 'rgba(10,22,40,0.2)'}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTheme('dark')}
            style={{
              ...buttonStyle,
              flex: 1,
              background: theme === 'dark'
                ? (isDark ? '#00ff96' : '#0057ff')
                : 'transparent',
              color: theme === 'dark'
                ? (isDark ? '#000' : '#fff')
                : (isDark ? '#00ff96' : '#0a1628'),
              border: `1px solid ${isDark ? 'rgba(0,255,150,0.3)' : 'rgba(10,22,40,0.2)'}`,
            }}
          >
            &#9790; DARK
          </button>
          <button
            onClick={() => setTheme('light')}
            style={{
              ...buttonStyle,
              flex: 1,
              background: theme === 'light'
                ? (isDark ? '#00ff96' : '#0057ff')
                : 'transparent',
              color: theme === 'light'
                ? (isDark ? '#000' : '#fff')
                : (isDark ? '#00ff96' : '#0a1628'),
              border: `1px solid ${isDark ? 'rgba(0,255,150,0.3)' : 'rgba(10,22,40,0.2)'}`,
            }}
          >
            &#9788; LIGHT
          </button>
        </div>

        {/* Error */}
        {geoError && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.6rem, 1.1vw, 0.8rem)',
            color: isDark ? '#ff4444' : '#d32f2f',
            textAlign: 'center',
          }}>
            {geoError}
          </p>
        )}

        {/* Start */}
        <button
          onClick={handleSubmit}
          style={{
            ...buttonStyle,
            width: '100%',
            fontSize: 'clamp(0.8rem, 1.6vw, 1.1rem)',
            padding: '16px 24px',
            background: isDark ? '#00ff96' : '#0057ff',
            color: isDark ? '#000' : '#fff',
            marginTop: '8px',
          }}
        >
          START TRACKING
        </button>
      </div>
    </div>
  )
}
