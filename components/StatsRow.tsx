'use client'

import type { Aircraft } from '@/types'

interface StatsRowProps {
  aircraft: Aircraft
  theme: 'dark' | 'light'
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      padding: '6px 12px',
      background: 'var(--surface)',
      border: '1px solid var(--surface-border)',
      borderRadius: '4px',
      minWidth: '80px',
    }}>
      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(0.5rem, 1vw, 0.7rem)',
        color: 'var(--text-secondary)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(0.8rem, 1.8vw, 1.3rem)',
        color: 'var(--text-primary)',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  )
}

export default function StatsRow({ aircraft }: StatsRowProps) {
  const alt = aircraft.altitude_ft != null
    ? (aircraft.altitude_ft >= 18000
        ? `FL${Math.round(aircraft.altitude_ft / 100)}`
        : `${aircraft.altitude_ft.toLocaleString()}ft`)
    : '---'

  const spd = aircraft.speed_kts != null
    ? `${aircraft.speed_kts} KTS`
    : '---'

  const dist = `${aircraft.distance_mi.toFixed(1)} MI`

  const vsi = aircraft.vertical_rate_fpm != null
    ? `${aircraft.vertical_rate_fpm > 0 ? '\u25B2' : aircraft.vertical_rate_fpm < 0 ? '\u25BC' : '\u25C6'} ${Math.abs(aircraft.vertical_rate_fpm).toLocaleString()}`
    : '---'

  const hdg = aircraft.heading != null
    ? `${aircraft.heading}\u00B0`
    : '---'

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      justifyContent: 'center',
      padding: '12px 0',
    }}>
      <StatBox label="ALT" value={alt} />
      <StatBox label="SPD" value={spd} />
      <StatBox label="DIST" value={dist} />
      <StatBox label="VSI" value={vsi} />
      <StatBox label="HDG" value={hdg} />
    </div>
  )
}
