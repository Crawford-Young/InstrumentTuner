# Instrument Tuner

A real-time, browser-based chromatic tuner and practice tool. Built with Next.js (App Router), TypeScript, and the `@crawfordyoung/ui` component library. Dark-mode-first; 100% test coverage; Lighthouse a11y/SEO/best-practices at 100.

## Modes

The app is a four-tab single page (`src/app/page.tsx`):

- **Tuner** — chromatic pitch detection against guitar/ukulele string targets, with a live needle gauge and auto string detection.
- **Note Detector** — raw closest-note + frequency readout from the mic signal.
- **Metronome** — BPM display, slider (40–240), tap tempo, selectable time signature (2/4, 3/4, 4/4), and a visual beat indicator.
- **Duel** — local hot-seat PvP tempo game. Two players take turns matching or guessing a target tempo (tap or guess mode); a scoring engine awards damage with a streak multiplier, and a health-bar match runs to victory.

Mic-based modes require microphone permission.

Alongside the tool, `/guides` (adsense-w2) hosts eight written guides — tuning technique, alternate tunings, and rhythm practice — linked from the site header.

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
- **Crawlability** (adsense-w1): `src/lib/site-routes.ts` owns `SITE_URL` + the route list; `src/app/robots.ts` and `src/app/sitemap.ts` are thin wrappers over it (logic stays in `src/lib/` — `src/app/**` is outside the coverage config). `/privacy` (`src/app/privacy/page.tsx`) is linked from a minimal footer added below the tab panels — without that footer the page would be a crawl orphan, since the sitemap alone does not satisfy a link-following review.
- **Canonical origin** (adsense-w1b): `metadataBase` + the `openGraph` block in `src/app/layout.tsx` are pinned to `SITE_URL`. `metadataBase` alone emits nothing — it only resolves relative URLs inside other metadata fields, so the `openGraph` block is what actually advertises `og:url`; before it landed this host served no canonical metadata at all. The compliance spec asserts `og:url === SITE_URL`.
- **Guides** (adsense-w2): `src/lib/guides.ts` is a zod-validated registry (`GUIDES`) that drives everything — the hub (`src/app/guides/page.tsx`), the static params of `src/app/guides/[slug]/page.tsx` (`dynamicParams = false`), the sitemap, and the content tests. Prose lives in `src/content/guides/<slug>.mdx` (compiled via `@next/mdx`); `src/app/guides/content-map.ts` maps each slug to an explicit `import()` — Turbopack can't follow template-literal dynamic imports. Content tests (`src/__tests__/guide-content.test.ts`) enforce that every registry entry has a compilable MDX file of ≥ `MIN_GUIDE_WORDS` (500) words and that no orphan MDX files exist.
- **`just check` is `typecheck lint test` — it does NOT run e2e.** `e2e/compliance.spec.ts` (the AdSense contract: `ads.txt`, `robots.txt`, `sitemap.xml`, `/privacy`, a real 404, and no `ins.adsbygoogle` on the homepage) therefore never executes in the gate. Run `pnpm e2e` separately, or the spec is decorative. It takes a configurable base URL via `PORT` / `E2E_BASE_URL`, so the same spec runs against production.

## Monetization (AdSense)

Ad support is fully env-gated: with no env vars set (dev, CI, tests, local Lighthouse) the app renders zero ad markup and loads zero ad scripts.

| Var | What it is |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher id (`ca-pub-…`) |
| `NEXT_PUBLIC_ADSENSE_SLOT` | Display ad-unit slot id for the bottom banner |

Both must be set for the banner (`src/components/AdBanner.tsx`) to render; the loader `<Script>` in `src/app/layout.tsx` requires the client id. `public/ads.txt` carries the live publisher id (`pub-4628379278051632`).

**`AdBanner` mounts only on guide pages, through `GuideAdSlot`.** It was removed from the homepage in the adsense-w1 wave: the tuner page is a bare tool surface (28 visible words in production) with the loader live, which is exactly AdSense's *"Google-served ads on screens without publisher content"* policy violation and a contributing cause of the account rejection. The env gate is not a defense — a gated unit on a contentless page is still live in production. As of adsense-w2, `src/components/GuideAdSlot.tsx` renders `AdBanner` below a guide article only when the article's word count is ≥ `MIN_GUIDE_WORDS` (500) — the content floor makes "ad on a contentless page" structurally impossible. The homepage and the `/guides` hub never mount an ad unit: `src/__tests__/home-no-ads.test.tsx`, the `ins.adsbygoogle` assertions in `e2e/compliance.spec.ts` and `e2e/guides.spec.ts` fail if one appears.

### Go-live checklist

1. Reactivate the AdSense account (YouTube-hosted accounts need an upgrade to serve ads on your own sites).
2. Add the custom domain as a site in the AdSense dashboard.
3. Create a display ad unit → copy its slot id. The guide pages (adsense-w2) are the sanctioned mount — `GuideAdSlot` picks it up via env; never mount back onto the tuner homepage.
4. Set `NEXT_PUBLIC_ADSENSE_CLIENT` + `NEXT_PUBLIC_ADSENSE_SLOT` in Vercel project env.
5. ~~Replace the placeholder publisher id in `public/ads.txt`~~ — done (2026-07-04).
6. Wait out Google's site review (days–2 weeks; site works normally while pending).
7. EEA consent: enable Google's built-in CMP in the AdSense dashboard — no code change needed.

## Error Boundaries

`src/app/error.tsx` (root) and `src/app/global-error.tsx` render `@crawfordyoung/ui`'s `RouteErrorFallback` with `homeHref="/"`, giving a crashed page a way back to the app shell instead of a dead end. **No Sentry capture** — the repo has no `@sentry/nextjs` dependency; error capture is deferred to the queued CI-housekeeping wave (Sentry install + wiring). Segment-level boundaries are out of scope for this small app; root-only placement is sufficient.

## Deploy

Deploys to Vercel as a static-first Next.js app.
