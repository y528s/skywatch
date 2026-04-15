'use client'

import type { Aircraft, Tier } from '@/types'
import StatsRow from './StatsRow'

interface DisplayScreenProps {
  aircraft: Aircraft[]
  status: 'loading' | 'no_signal' | 'error' | 'live'
  error: string | null
  countdown: number
  refreshInterval: number
  theme: 'dark' | 'light'
  tier: Tier
  onToggleTheme: () => void
  onOpenSettings: () => void
  onOpenWatchlist: () => void
  watchlistMatches: Aircraft[]
  onDismissMatch: () => void
}

function PlaneSvg({ heading, size }: { heading: number; size: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      transform: `rotate(${heading}deg)`,
      transition: 'transform 1s ease',
      position: 'relative',
      zIndex: 2,
    }}>
      <svg viewBox="0 0 100 100" width={size} height={size} fill="var(--accent)">
        <path d="M50 15 L55 45 L80 55 L80 60 L55 55 L55 72 L65 80 L65 84 L50 78 L35 84 L35 80 L45 72 L45 55 L20 60 L20 55 L45 45 Z" />
      </svg>
    </div>
  )
}

function PingRings() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px solid var(--accent)',
            animation: `ping 3s ease-out ${i * 1}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

export default function DisplayScreen({
  aircraft,
  status,
  error,
  countdown,
  refreshInterval,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenWatchlist,
  watchlistMatches,
  onDismissMatch,
}: DisplayScreenProps) {
  const nearest = aircraft.length > 0 ? aircraft[0] : null
  const isDark = theme === 'dark'

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* CRT scanlines overlay (dark mode only) */}
      {isDark && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,150,0.04) 2px, rgba(0,255,150,0.04) 4px)',
          pointerEvents: 'none',
          zIndex: 100,
        }} />
      )}

      {/* Radial vignette (dark mode only) */}
      {isDark && (
        <div style={{
          position: 'fixed',
          inset: 0,
          boxShadow: 'inset 0 0 150px 60px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
          zIndex: 99,
        }} />
      )}

      {/* Background grid (dark mode only) */}
      {isDark && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,255,150,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,150,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 98,
        }} />
      )}

      {/* Header bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(8px, 1.5vw, 16px) clamp(12px, 2vw, 24px)',
        borderBottom: '1px solid var(--surface-border)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2.5vw, 2rem)',
          letterSpacing: '0.15em',
          color: 'var(--accent)',
        }}>
          &#9992; SKYWATCH
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.6rem, 1.2vw, 0.9rem)',
          color: 'var(--text-secondary)',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: status === 'live' ? '#00ff96'
              : status === 'error' ? 'var(--error)'
              : 'var(--warning)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          {status === 'live' && `${aircraft.length} AIRCRAFT`}
          {status === 'loading' && 'SCANNING...'}
          {status === 'no_signal' && 'NO SIGNAL'}
          {status === 'error' && 'ERROR'}
        </div>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vw, 24px)',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}>
        {/* LOADING state */}
        {status === 'loading' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}>
            {/* Scan bar */}
            <div style={{
              width: 'clamp(200px, 50vw, 400px)',
              height: '4px',
              background: 'var(--surface)',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
                animation: 'scan 2s ease-in-out infinite',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
              letterSpacing: '0.2em',
              color: 'var(--accent)',
              animation: 'blink 1.5s step-end infinite',
            }}>
              SCANNING AIRSPACE
            </span>
          </div>
        )}

        {/* NO SIGNAL state */}
        {status === 'no_signal' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', opacity: 0.6 }}>
              &#128225;
            </span>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.9rem, 2vw, 1.5rem)',
              letterSpacing: '0.2em',
              color: 'var(--fg-dim)',
            }}>
              NO AIRCRAFT IN RANGE
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
              color: 'var(--text-secondary)',
            }}>
              Try increasing your search radius
            </span>
          </div>
        )}

        {/* ERROR state */}
        {status === 'error' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
              letterSpacing: '0.2em',
              color: 'var(--error)',
            }}>
              API ERROR
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              maxWidth: '500px',
            }}>
              {error || 'Unable to fetch flight data. Will retry automatically.'}
            </span>
          </div>
        )}

        {/* LIVE state */}
        {status === 'live' && nearest && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(4px, 1.5vw, 16px)',
            width: '100%',
            maxWidth: '700px',
          }}>
            {/* Plane with ping rings */}
            <div style={{
              position: 'relative',
              width: 'clamp(80px, 15vw, 140px)',
              height: 'clamp(80px, 15vw, 140px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <PingRings />
              <PlaneSvg
                heading={nearest.heading || 0}
                size={Math.min(window?.innerWidth * 0.1 || 80, 100)}
              />
            </div>

            {/* Airline name */}
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.2rem, 3.5vw, 2.8rem)',
              letterSpacing: '0.1em',
              color: nearest.airline_color || 'var(--accent)',
              textShadow: isDark
                ? `0 0 20px ${nearest.airline_color || 'var(--accent)'}, 0 0 40px ${nearest.airline_color || 'var(--accent)'}44`
                : 'none',
              textAlign: 'center',
            }}>
              {nearest.airline_name || nearest.callsign || 'UNKNOWN'}
            </div>

            {/* Flight line: callsign + route */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.8rem, 2vw, 1.4rem)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}>
              {nearest.callsign || nearest.hex}
              {nearest.origin && nearest.destination
                ? ` \u00B7 ${nearest.origin}\u2192${nearest.destination}`
                : nearest.origin ? ` \u00B7 ${nearest.origin}` : ''}
            </div>

            {/* Aircraft type badge */}
            {nearest.aircraft_type && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.6rem, 1.2vw, 0.9rem)',
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: '4px',
                padding: '4px 12px',
                color: 'var(--accent)',
                letterSpacing: '0.1em',
              }}>
                {nearest.aircraft_type}
              </div>
            )}

            {/* Stats row */}
            <StatsRow aircraft={nearest} theme={theme} />
          </div>
        )}
      </main>

      {/* Watchlist alert bar */}
      {watchlistMatches.length > 0 && (
        <div
          onClick={onDismissMatch}
          style={{
            background: 'rgba(255, 179, 0, 0.15)',
            borderTop: '1px solid rgba(255, 179, 0, 0.3)',
            borderBottom: '1px solid rgba(255, 179, 0, 0.3)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
            color: '#ffb300',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 10,
            minHeight: '44px',
          }}
        >
          &#9992; WATCHLIST MATCH: {watchlistMatches[0].airline_name || watchlistMatches[0].callsign}
          {' '}&mdash; {watchlistMatches[0].distance_mi.toFixed(1)}mi
          {watchlistMatches.length > 1 && ` (+${watchlistMatches.length - 1} more)`}
        </div>
      )}

      {/* Footer bar */}
      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(6px, 1vw, 12px) clamp(12px, 2vw, 24px)',
        borderTop: '1px solid var(--surface-border)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Countdown */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
          color: 'var(--text-secondary)',
          minWidth: '100px',
        }}>
          {countdown}s
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDark ? '\u2600' : '\u263E'}
        </button>

        {/* Settings + Watchlist */}
        <div style={{ display: 'flex', gap: '8px', minWidth: '100px', justifyContent: 'flex-end' }}>
          <button
            onClick={onOpenWatchlist}
            style={{
              background: 'none',
              border: '1px solid var(--surface-border)',
              borderRadius: '4px',
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.5rem, 1vw, 0.75rem)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 12px',
              minWidth: '44px',
              minHeight: '44px',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            &#9992; ALERTS
          </button>
          <button
            onClick={onOpenSettings}
            style={{
              background: 'none',
              border: '1px solid var(--surface-border)',
              borderRadius: '4px',
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.5rem, 1vw, 0.75rem)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 12px',
              minWidth: '44px',
              minHeight: '44px',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            &#9881; SETTINGS
          </button>
        </div>
      </footer>

      {/* Attribution */}
      <div style={{
        textAlign: 'center',
        padding: '4px 0 8px',
        position: 'relative',
        zIndex: 10,
      }}>
        <a
          href="https://yosefsilver.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.45rem, 0.8vw, 0.65rem)',
            color: 'var(--fg)',
            opacity: 0.2,
            textDecoration: 'none',
          }}
        >
          Built by Yosef Silver
        </a>
      </div>
    </div>
  )
}
