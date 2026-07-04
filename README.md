# Instrument Tuner

A real-time, browser-based chromatic tuner and practice tool. Built with Next.js (App Router), TypeScript, and the `@crawfordyoung/ui` component library. Dark-mode-first; 100% test coverage; Lighthouse a11y/SEO/best-practices at 100.

## Modes

The app is a four-tab single page (`src/app/page.tsx`):

- **Tuner** — chromatic pitch detection against guitar/ukulele string targets, with a live needle gauge and auto string detection.
- **Note Detector** — raw closest-note + frequency readout from the mic signal.
- **Metronome** — BPM display, slider (40–240), tap tempo, selectable time signature (2/4, 3/4, 4/4), and a visual beat indicator.
- **Duel** — local hot-seat PvP tempo game. Two players take turns matching or guessing a target tempo (tap or guess mode); a scoring engine awards damage with a streak multiplier, and a health-bar match runs to victory.

Mic-based modes require microphone permission.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm test` | Vitest + coverage (100% gate) |
| `pnpm e2e` | Playwright E2E (boots `pnpm dev` on port 3002) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |

`node axe-duel.mjs` runs an axe-core accessibility sweep over the Duel flow in dark and light mode against a server on `:3000`.

## Architecture

- **Pure logic** lives in `src/lib/` (`tempo.ts`, `duel/scoring.ts`, `duel/types.ts`, `audio/click.ts`) — framework-free and unit-tested in isolation.
- **Hooks** in `src/hooks/` (`useMetronome`, `useDuelMatch`, `useTapTempo`, `useTempoPlayback`, `useAudioAnalyzer`, `usePitchDetector`) hold stateful behavior.
- **Components** in `src/components/` compose the UI; `src/components/duel/` holds the Duel feature set.

## Monetization (AdSense)

Ad support is fully env-gated: with no env vars set (dev, CI, tests, local Lighthouse) the app renders zero ad markup and loads zero ad scripts.

| Var | What it is |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher id (`ca-pub-…`) |
| `NEXT_PUBLIC_ADSENSE_SLOT` | Display ad-unit slot id for the bottom banner |

Both must be set for the banner (`src/components/AdBanner.tsx`, mounted below the tab panels) to render; the loader `<Script>` in `src/app/layout.tsx` requires the client id. `public/ads.txt` ships with a placeholder publisher id (`pub-0000000000000000`).

### Go-live checklist

1. Reactivate the AdSense account (YouTube-hosted accounts need an upgrade to serve ads on your own sites).
2. Add the custom domain as a site in the AdSense dashboard.
3. Create a display ad unit → copy its slot id.
4. Set `NEXT_PUBLIC_ADSENSE_CLIENT` + `NEXT_PUBLIC_ADSENSE_SLOT` in Vercel project env.
5. Replace the placeholder publisher id in `public/ads.txt` with the real one.
6. Wait out Google's site review (days–2 weeks; site works normally while pending).
7. EEA consent: enable Google's built-in CMP in the AdSense dashboard — no code change needed.

## Deploy

Deploys to Vercel as a static-first Next.js app.
