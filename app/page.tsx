'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Aircraft, AppSettings } from '@/types'
import { limit } from '@/lib/tier'
import { checkWatchlist } from '@/lib/watchlist'
import SetupScreen from '@/components/SetupScreen'
import DisplayScreen from '@/components/DisplayScreen'
import WatchlistManager from '@/components/WatchlistManager'
import UpgradeModal from '@/components/UpgradeModal'

const STORAGE_KEY = 'skywatch_settings'
const BANNER_KEY = 'skywatch_ios_banner_dismissed'
const NOTIFICATION_DEBOUNCE_MS = 5 * 60 * 1000

function loadSettings(): AppSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppSettings
  } catch {
    return null
  }
}

function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export default function Home() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [status, setStatus] = useState<'loading' | 'no_signal' | 'error' | 'live'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [showSetup, setShowSetup] = useState(false)
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [watchlistMatches, setWatchlistMatches] = useState<Aircraft[]>([])
  const [showIosBanner, setShowIosBanner] = useState(false)

  const notificationDebounce = useRef<Map<string, number>>(new Map())
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load settings on mount
  useEffect(() => {
    const loaded = loadSettings()
    if (loaded) {
      setSettings(loaded)
      setShowSetup(false)
    } else {
      setShowSetup(true)
    }
    setSettingsLoaded(true)
  }, [])

  // iOS install banner
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios/i.test(navigator.userAgent)
    const isStandalone = ('standalone' in navigator) && (navigator as unknown as { standalone: boolean }).standalone
    const dismissed = localStorage.getItem(BANNER_KEY)

    if (isIos && isSafari && !isStandalone && !dismissed) {
      const timer = setTimeout(() => setShowIosBanner(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Wake Lock
  useEffect(() => {
    async function acquireWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch { /* Not supported or denied */ }
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        acquireWakeLock()
      }
    }

    acquireWakeLock()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      wakeLockRef.current?.release()
    }
  }, [])

  // Fetch flights
  const fetchFlights = useCallback(async () => {
    if (!settings) return

    try {
      const res = await fetch(
        `/api/flights?lat=${settings.lat}&lon=${settings.lon}&radius=${settings.radius}`
      )

      if (!res.ok) {
        setStatus('error')
        setError(`HTTP ${res.status}`)
        return
      }

      const data: Aircraft[] = await res.json()

      if (data.length === 0) {
        setAircraft([])
        setStatus('no_signal')
        setWatchlistMatches([])
        return
      }

      setAircraft(data)
      setStatus('live')
      setError(null)

      // Watchlist check
      if (settings.watchlist.length > 0) {
        const matches = checkWatchlist(data, settings.watchlist, settings.tier)
        setWatchlistMatches(matches)

        // Fire notifications
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const now = Date.now()
          for (const match of matches) {
            const last = notificationDebounce.current.get(match.hex)
            if (last && now - last < NOTIFICATION_DEBOUNCE_MS) continue

            notificationDebounce.current.set(match.hex, now)
            try {
              new Notification(
                `\u2708 ${match.airline_name || match.callsign}`,
                {
                  body: `${match.aircraft_type || ''} \u2014 ${match.distance_mi.toFixed(1)}mi away at ${match.altitude_ft?.toLocaleString() || '?'}ft`,
                  icon: '/icon.svg',
                }
              )
            } catch { /* Notification failed */ }
          }
        }
      } else {
        setWatchlistMatches([])
      }
    } catch {
      setStatus('error')
      setError('Network error')
    }
  }, [settings])

  // Polling loop
  useEffect(() => {
    if (!settings) return

    const intervalMs = limit('refresh_interval_ms', settings.tier)
    const countdownSec = Math.round(intervalMs / 1000)

    // Initial fetch
    fetchFlights()
    setCountdown(countdownSec)

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? countdownSec : prev - 1))
    }, 1000)

    // Poll timer
    pollTimerRef.current = setInterval(() => {
      fetchFlights()
      setCountdown(countdownSec)
    }, intervalMs)

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [settings, fetchFlights])

  // Handle setup complete
  function handleSetupComplete(newSettings: AppSettings) {
    setSettings(newSettings)
    saveSettings(newSettings)
    setShowSetup(false)
    setStatus('loading')
  }

  // Handle theme toggle
  function handleToggleTheme() {
    if (!settings) return
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    const updated = { ...settings, theme: newTheme as 'dark' | 'light' }
    setSettings(updated)
    saveSettings(updated)
  }

  // Handle watchlist save
  function handleWatchlistSave(watchlist: AppSettings['watchlist']) {
    if (!settings) return
    const updated = { ...settings, watchlist }

    // Update notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      updated.notifications_permission = Notification.permission as AppSettings['notifications_permission']
    }

    setSettings(updated)
    saveSettings(updated)
  }

  // Handle iOS banner dismiss
  function dismissIosBanner() {
    setShowIosBanner(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(BANNER_KEY, 'true')
    }
  }

  // Don't render until settings loaded to prevent flash
  if (!settingsLoaded) {
    return (
      <div
        data-theme="dark"
        style={{
          height: '100vh',
          width: '100vw',
          background: '#000',
        }}
      />
    )
  }

  const theme = settings?.theme || 'dark'
  const refreshMs = settings ? limit('refresh_interval_ms', settings.tier) : 30000

  return (
    <div data-theme={theme}>
      {showSetup || !settings ? (
        <SetupScreen
          onComplete={handleSetupComplete}
          existingSettings={settings}
        />
      ) : (
        <DisplayScreen
          aircraft={aircraft}
          status={status}
          error={error}
          countdown={countdown}
          refreshInterval={refreshMs}
          theme={theme}
          tier={settings.tier}
          onToggleTheme={handleToggleTheme}
          onOpenSettings={() => setShowSetup(true)}
          onOpenWatchlist={() => setShowWatchlist(true)}
          watchlistMatches={watchlistMatches}
          onDismissMatch={() => setWatchlistMatches([])}
        />
      )}

      {/* Watchlist Manager */}
      {showWatchlist && settings && (
        <WatchlistManager
          watchlist={settings.watchlist}
          tier={settings.tier}
          onSave={handleWatchlistSave}
          onClose={() => setShowWatchlist(false)}
          onUpgrade={() => {
            setShowWatchlist(false)
            setShowUpgrade(true)
          }}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          currentTier={settings?.tier || 'free'}
        />
      )}

      {/* iOS Install Banner */}
      {showIosBanner && (
        <div
          onClick={dismissIosBanner}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: theme === 'dark' ? 'rgba(0,255,150,0.1)' : 'rgba(0,87,255,0.1)',
            borderTop: `1px solid ${theme === 'dark' ? 'rgba(0,255,150,0.2)' : 'rgba(0,87,255,0.2)'}`,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            zIndex: 200,
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
            color: 'var(--accent)',
            textAlign: 'center',
          }}>
            Tap Share &#8599; then &ldquo;Add to Home Screen&rdquo; for the best experience
          </span>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.1em',
          }}>
            DISMISS
          </span>
        </div>
      )}
    </div>
  )
}
