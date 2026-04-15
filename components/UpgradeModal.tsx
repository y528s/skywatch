'use client'

import type { Tier } from '@/types'

interface UpgradeModalProps {
  onClose: () => void
  currentTier: Tier
}

interface TierColumn {
  name: string
  price: string
  features: string[]
  highlight: boolean
}

const TIERS: TierColumn[] = [
  {
    name: 'Free',
    price: '$0',
    features: [
      'Live nearest aircraft',
      'Dark + light mode',
      'Always-on display',
      '10 flight history',
    ],
    highlight: false,
  },
  {
    name: 'Plus',
    price: '$19.99/yr',
    features: [
      'Everything in Free',
      '15s refresh',
      'Flight history',
      '5 saved locations',
      'Airline alerts',
      'Home screen widget',
    ],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$39.99/yr',
    features: [
      'Everything in Plus',
      '10s refresh',
      'Tail number alerts',
      'Flight number alerts',
      'Aircraft type alerts',
      'Unlimited locations',
    ],
    highlight: false,
  },
]

export default function UpgradeModal({ onClose, currentTier }: UpgradeModalProps) {
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
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--surface-border)',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          padding: 'clamp(16px, 3vw, 32px)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--fg)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          &times;
        </button>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
          color: 'var(--accent)',
          textAlign: 'center',
          marginBottom: 'clamp(12px, 2vw, 24px)',
          letterSpacing: '0.1em',
        }}>
          UPGRADE SKYWATCH
        </h2>

        {/* Tier columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(8px, 1.5vw, 16px)',
        }}>
          {TIERS.map(tier => {
            const isCurrent = tier.name.toLowerCase() === currentTier
            return (
              <div
                key={tier.name}
                style={{
                  border: tier.highlight
                    ? '2px solid var(--accent)'
                    : '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  padding: 'clamp(12px, 2vw, 20px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  background: tier.highlight ? 'var(--surface)' : 'transparent',
                }}
              >
                {isCurrent && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    background: 'var(--accent)',
                    color: 'var(--bg)',
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-heading)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.1em',
                  }}>
                    CURRENT
                  </span>
                )}

                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(0.9rem, 1.8vw, 1.3rem)',
                  color: 'var(--fg)',
                  letterSpacing: '0.05em',
                }}>
                  {tier.name}
                </h3>

                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                  color: 'var(--accent)',
                }}>
                  {tier.price}
                </span>

                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  marginTop: '8px',
                }}>
                  {tier.features.map(f => (
                    <li key={f} style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(0.55rem, 1.1vw, 0.8rem)',
                      color: 'var(--text-secondary)',
                      paddingLeft: '16px',
                      position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--accent)',
                      }}>
                        &#10003;
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(16px, 2vw, 24px)' }}>
          <a
            href="mailto:hello@yosefsilver.com?subject=Skywatch%20waitlist"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(0.7rem, 1.4vw, 1rem)',
              color: 'var(--bg)',
              background: 'var(--accent)',
              padding: '12px 32px',
              borderRadius: '6px',
              textDecoration: 'none',
              letterSpacing: '0.1em',
              minHeight: '44px',
              lineHeight: '20px',
            }}
          >
            COMING SOON &mdash; JOIN WAITLIST
          </a>
        </div>
      </div>
    </div>
  )
}
