# Skywatch — Overhead Flight Display

Full-screen, wall-mount flight tracker for iPad. Built with Next.js (App Router), TypeScript, and real-time ADS-B data.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Your Location

On first launch, the setup screen will ask for your location. You can:

1. **Search** — Type a city or address and tap "FIND"
2. **Use My Location** — Grant browser geolocation access
3. **Manual** — Enter latitude and longitude directly

Select a search radius (5–100 miles) and pick a theme (dark CRT mode or clean light mode).

## How It Works

- `/api/flights` is a **server-side proxy** that fetches from [adsb.lol](https://adsb.lol) (primary) and [OpenSky Network](https://opensky-network.org) (fallback). This solves CORS restrictions since both APIs block direct browser requests.
- The display auto-refreshes every 30s (free tier), 15s (Plus), or 10s (Pro).
- The nearest aircraft is shown with airline branding, flight data, and animated radar-style visuals.

## Watchlist Alerts

Configure alerts for specific airlines, flight numbers, tail numbers, or aircraft types. When a match enters your radius, you'll get a browser push notification (requires granting notification permission).

## Installing as a PWA on iPad

1. Open Skywatch in Safari
2. Tap the **Share** button (↗)
3. Tap **"Add to Home Screen"**
4. Skywatch will launch in full-screen landscape mode — perfect for a wall-mounted display

## Tiers

The current tier is stored in `localStorage` only. StoreKit/Stripe integration is a future build — the upgrade modal shows a "Coming Soon" waitlist CTA.

| | Free | Plus ($19.99/yr) | Pro ($39.99/yr) |
|---|---|---|---|
| Refresh | 30s | 15s | 10s |
| History | 10 | Unlimited | Unlimited |
| Locations | 1 | 5 | Unlimited |
| Airline alerts | — | Yes | Yes |
| Flight/tail/type alerts | — | — | Yes |

## Notifications

Browser notification permission is requested when you save your first watchlist item. Notifications are debounced (same aircraft won't re-alert within 5 minutes).

## Deploy

Deploy to Vercel:

```bash
npx vercel
```

Or connect the GitHub repo to Vercel for automatic deployments.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Google Fonts**: Orbitron (headings), Share Tech Mono (data)
- **ADS-B data**: adsb.lol + OpenSky Network
- **PWA**: Web App Manifest, Wake Lock API
