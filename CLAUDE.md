@AGENTS.md

## Local dev / test notes

- **E2E flakes wholesale with a Next overlay error** (`components.ComponentMod.handler is not a function`, blank page on every spec): this is a stale Turbopack `.next` cache, not a code regression. `rm -rf .next` and rerun `pnpm e2e`. Confirm it's the cache (not real) by checking the prod build + a fresh single run pass first.
- **Prefer core Tailwind spacing utilities over arbitrary px.** `top-[57px]` silently did not apply (class not generated); `top-14` / `top-20` worked. Reach for arbitrary values only when no core step fits.
- **axe sweep:** `node axe-duel.mjs` runs an axe-core pass over the Duel flow (dark + light) against a dev server on `:3000`. It covers setup → privacy gate → tap turn, not the reveal/victory screens.
- **Killing a background `pnpm dev` orphans the node child holding :3000** — the wrapper dies, the server lives. Before starting another server or running `pnpm e2e`, check `netstat -ano | findstr :3000` and `taskkill /PID <pid> /F` the survivor. (2026-07-04: cost one e2e rerun.)

## Error boundaries

- `src/app/error.tsx` (root) and `src/app/global-error.tsx` use `@crawfordyoung/ui`'s `RouteErrorFallback` (via the `src/lib/ui.ts` named-export shim) with `homeHref="/"` — root/global boundaries strand the user with no surviving nav, so they get the home link; segment boundaries would keep the app shell and would NOT get one (this app has no segment boundaries, root-only is sufficient).
- **Sentry gap (accepted, documented):** no `@sentry/nextjs` dependency in this repo, so neither boundary captures errors — they only render the fallback UI. Capture lands with the repo's queued CI-housekeeping wave (Sentry install). Don't add ad-hoc capture outside that wave.

## AdSense conventions

- **Everything ad-related is env-gated on `NEXT_PUBLIC_ADSENSE_CLIENT` / `NEXT_PUBLIC_ADSENSE_SLOT`.** Unset (the default everywhere but production) → `AdBanner` returns `null` and the loader `<Script>` in `layout.tsx` doesn't render. Never add ad markup or scripts outside this gate; tests, e2e, axe, and local Lighthouse all assume the ad-free state.
- **Lighthouse deviation (accepted, documented):** production with live ads scores below 100 (third-party ad script + iframe — industry-unavoidable). Local/CI Lighthouse with env unset must stay 100. Don't re-litigate per wave.
