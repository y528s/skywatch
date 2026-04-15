'use client'

import { useState } from 'react'
import type { WatchlistItem, WatchlistItemType, Tier } from '@/types'
import { can } from '@/lib/tier'
import { AIRLINES } from '@/lib/airlines'

interface WatchlistManagerProps {
  watchlist: WatchlistItem[]
  tier: Tier
  onSave: (watchlist: WatchlistItem[]) => void
  onClose: () => void
  onUpgrade: () => void
}

const ITEM_TYPES: { value: WatchlistItemType; label: string; requires: 'plus' | 'pro'; feature: string }[] = [
  { value: 'airline', label: 'Airline', requires: 'plus', feature: 'watchlist_airline' },
  { value: 'flight_number', label: 'Flight Number', requires: 'pro', feature: 'watchlist_flight' },
  { value: 'tail_number', label: 'Tail Number', requires: 'pro', feature: 'watchlist_tail' },
  { value: 'aircraft_type', label: 'Aircraft Type', requires: 'pro', feature: 'watchlist_type' },
]

function autoLabel(type: WatchlistItemType, value: string): string {
  if (type === 'airline') {
    const upper = value.trim().toUpperCase()
    const airline = AIRLINES[upper]
    if (airline) return airline.name

    for (const [, info] of Object.entries(AIRLINES)) {
      if (info.name.toLowerCase().includes(value.toLowerCase())) return info.name
    }
  }
  return value.trim()
}

export default function WatchlistManager({
  watchlist,
  tier,
  onSave,
  onClose,
  onUpgrade,
}: WatchlistManagerProps) {
  const [items, setItems] = useState<WatchlistItem[]>(watchlist)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<WatchlistItemType>('airline')
  const [formValue, setFormValue] = useState('')
  const [formLabel, setFormLabel] = useState('')
  const [formRadius, setFormRadius] = useState(50)

  function toggleItem(id: string) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ))
  }

  function deleteItem(id: string) {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  function handleAdd() {
    if (!formValue.trim()) return

    const itemType = ITEM_TYPES.find(t => t.value === formType)
    if (!itemType) return

    const featureKey = itemType.feature as Parameters<typeof can>[0]
    if (!can(featureKey, tier)) {
      onUpgrade()
      return
    }

    const newItem: WatchlistItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: formType,
      value: formValue.trim(),
      label: formLabel.trim() || autoLabel(formType, formValue),
      radius_miles: formRadius,
      enabled: true,
      requires_tier: itemType.requires,
    }

    const updated = [...items, newItem]
    setItems(updated)
    setFormValue('')
    setFormLabel('')
    setFormRadius(50)
    setShowForm(false)

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  function handleSave() {
    onSave(items)
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(0.75rem, 1.4vw, 1rem)',
    background: 'var(--surface)',
    border: '1px solid var(--surface-border)',
    borderRadius: '4px',
    color: 'var(--fg)',
    padding: '10px 12px',
    width: '100%',
    minHeight: '44px',
  }

  const buttonStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
    letterSpacing: '0.1em',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    minHeight: '44px',
    minWidth: '44px',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 900,
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--surface-border)',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: 'clamp(16px, 3vw, 32px)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(0.9rem, 2vw, 1.4rem)',
            color: 'var(--accent)',
            letterSpacing: '0.1em',
          }}>
            WATCHLIST ALERTS
          </h2>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              background: 'none',
              color: 'var(--fg)',
              fontSize: '1.3rem',
            }}
          >
            &times;
          </button>
        </div>

        {/* Items list */}
        {items.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.7rem, 1.3vw, 0.9rem)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            padding: '20px 0',
          }}>
            No alerts configured. Add one below.
          </p>
        )}

        {items.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: '1px solid var(--surface-border)',
            }}
          >
            {/* Toggle */}
            <button
              onClick={() => toggleItem(item.id)}
              style={{
                ...buttonStyle,
                padding: '6px 12px',
                background: item.enabled ? 'var(--accent)' : 'var(--surface)',
                color: item.enabled ? 'var(--bg)' : 'var(--text-secondary)',
              }}
            >
              {item.enabled ? 'ON' : 'OFF'}
            </button>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.75rem, 1.4vw, 1rem)',
                color: 'var(--fg)',
              }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.55rem, 1vw, 0.75rem)',
                color: 'var(--text-secondary)',
              }}>
                {item.type.replace('_', ' ')} &middot; {item.radius_miles}mi radius
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteItem(item.id)}
              style={{
                ...buttonStyle,
                padding: '6px 12px',
                background: 'none',
                color: 'var(--error)',
                border: '1px solid var(--error)',
              }}
            >
              DEL
            </button>
          </div>
        ))}

        {/* Add form */}
        {showForm ? (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <select
              value={formType}
              onChange={e => {
                const newType = e.target.value as WatchlistItemType
                setFormType(newType)
                setFormLabel(autoLabel(newType, formValue))
              }}
              style={inputStyle}
            >
              {ITEM_TYPES.map(t => {
                const featureKey = t.feature as Parameters<typeof can>[0]
                const locked = !can(featureKey, tier)
                return (
                  <option key={t.value} value={t.value}>
                    {locked ? '\uD83D\uDD12 ' : ''}{t.label}{locked ? ` (${t.requires}+)` : ''}
                  </option>
                )
              })}
            </select>

            <input
              type="text"
              placeholder="Value (e.g. Emirates, UA1234, A380)"
              value={formValue}
              onChange={e => {
                setFormValue(e.target.value)
                setFormLabel(autoLabel(formType, e.target.value))
              }}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Label (auto-filled)"
              value={formLabel}
              onChange={e => setFormLabel(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}>
                Radius: {formRadius}mi
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={formRadius}
                onChange={e => setFormRadius(parseInt(e.target.value))}
                style={{ flex: 1, minHeight: '44px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAdd}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  background: 'var(--accent)',
                  color: 'var(--bg)',
                }}
              >
                ADD ALERT
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  ...buttonStyle,
                  background: 'var(--surface)',
                  color: 'var(--fg)',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              ...buttonStyle,
              width: '100%',
              marginTop: '16px',
              background: 'var(--surface)',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
            }}
          >
            + ADD ALERT
          </button>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            ...buttonStyle,
            width: '100%',
            marginTop: '16px',
            background: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          SAVE &amp; CLOSE
        </button>
      </div>
    </div>
  )
}
