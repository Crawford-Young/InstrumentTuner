import { defineConfig, devices } from '@playwright/test'

// Port is configurable so concurrent sessions can run e2e on a fresh port without
// reusing another session's dev server. E2E_BASE_URL overrides both, so the same
// specs can run against a live deployment instead of a local server.
const PORT = process.env.PORT ?? '3002'
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

// One retry absorbs a Turbopack dev-server race: concurrent first-compiles of the
// MDX guide routes intermittently 500 ("Unexpected end of JSON input") on cold
// in-process cache. Dev-only — prod prerenders these routes. A retried test runs
// alone, which is exactly the condition under which the route compiles cleanly.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
})
