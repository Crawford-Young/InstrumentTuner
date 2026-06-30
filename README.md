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

## Deploy

Deploys to Vercel as a static-first Next.js app.
