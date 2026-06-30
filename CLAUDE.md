@AGENTS.md

## Local dev / test notes

- **E2E flakes wholesale with a Next overlay error** (`components.ComponentMod.handler is not a function`, blank page on every spec): this is a stale Turbopack `.next` cache, not a code regression. `rm -rf .next` and rerun `pnpm e2e`. Confirm it's the cache (not real) by checking the prod build + a fresh single run pass first.
- **Prefer core Tailwind spacing utilities over arbitrary px.** `top-[57px]` silently did not apply (class not generated); `top-14` / `top-20` worked. Reach for arbitrary values only when no core step fits.
- **axe sweep:** `node axe-duel.mjs` runs an axe-core pass over the Duel flow (dark + light) against a dev server on `:3000`. It covers setup → privacy gate → tap turn, not the reveal/victory screens.
