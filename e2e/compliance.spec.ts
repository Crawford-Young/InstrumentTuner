import { test, expect } from '@playwright/test'

import { SITE_URL } from '@/lib/site-routes'

const PUBLISHER_LINE = 'google.com, pub-4628379278051632, DIRECT, f08c47fec0942fa0'

test('ads.txt serves the publisher line as plain text', async ({ request }) => {
  const response = await request.get('/ads.txt')
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/plain')
  expect(await response.text()).toContain(PUBLISHER_LINE)
})

test('robots.txt is served and references the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('Sitemap:')
})

test('sitemap.xml is served and lists the privacy page', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('/privacy')
})

test('privacy page is reachable', async ({ page }) => {
  await page.goto('/privacy')
  await expect(page.getByRole('heading', { name: /privacy policy/i, level: 1 })).toBeVisible()
})

test('unknown paths return a real 404 status', async ({ request }) => {
  expect((await request.get('/definitely-not-a-real-page')).status()).toBe(404)
})

test('the homepage renders no ad unit', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('ins.adsbygoogle')).toHaveCount(0)
})

// This host advertised no canonical origin at all before the openGraph block —
// no metadataBase either. metadataBase alone would not have been enough: it only
// resolves relative urls inside other metadata fields, so the block is what
// actually emits og:url.
test('canonical metadata advertises the production origin', async ({ page }) => {
  await page.goto('/')
  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
  expect(ogUrl).toBe(SITE_URL)
})
