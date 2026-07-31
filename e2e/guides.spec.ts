import { test, expect } from '@playwright/test'

import { SITE_URL, siteRoutes } from '@/lib/site-routes'
import { GUIDES, guidePath } from '@/lib/guides'

test('the guides hub renders with canonical metadata and no ad unit', async ({ page }) => {
  await page.goto('/guides')
  await expect(page.getByRole('heading', { name: 'Guides', level: 1 })).toBeVisible()

  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
  expect(ogUrl).toBe(`${SITE_URL}/guides`)

  await expect(page.locator('ins.adsbygoogle')).toHaveCount(0)
})

for (const guide of GUIDES) {
  test(`guide page "${guide.slug}" renders with canonical metadata and no ad unit`, async ({
    page,
  }) => {
    const response = await page.goto(guidePath(guide.slug))
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
    expect(ogUrl).toBe(`${SITE_URL}${guidePath(guide.slug)}`)

    // Ads are env-gated on NEXT_PUBLIC_ADSENSE_CLIENT/_SLOT, unset in e2e.
    await expect(page.locator('ins.adsbygoogle')).toHaveCount(0)
  })
}

test('sitemap.xml lists the guides hub and every guide route', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  const body = await response.text()
  for (const route of siteRoutes()) {
    if (route === '/' || route === '/privacy') continue
    expect(body).toContain(route)
  }
})

test('the homepage header links to the guides hub', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Guides' }).first().click()
  await expect(page).toHaveURL(/\/guides$/)
  await expect(page.getByRole('heading', { name: 'Guides', level: 1 })).toBeVisible()
})
