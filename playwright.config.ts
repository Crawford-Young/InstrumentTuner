import { defineConfig, devices } from '@playwright/test'

// Port is configurable so concurrent sessions can run e2e on a fresh port without
// reusing another session's dev server. E2E_BASE_URL overrides both, so the same
// specs can run against a live deployment instead of a local server.
const PORT = process.env.PORT ?? '3002'
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
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
