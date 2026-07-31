import { describe, it, expect } from 'vitest'
import { SITE_URL, siteRoutes, buildSitemap } from '@/lib/site-routes'
import { GUIDES, guidePath } from '@/lib/guides'

describe('site-routes', () => {
  it('points at the music subdomain', () => {
    expect(SITE_URL).toBe('https://music.crawfordyoung.dev')
  })

  it('lists the tool, the privacy page, the guides hub, and every guide route', () => {
    const routes = siteRoutes()
    expect(routes).toContain('/')
    expect(routes).toContain('/privacy')
    expect(routes).toContain('/guides')
    for (const guide of GUIDES) {
      expect(routes).toContain(guidePath(guide.slug))
    }
  })

  it('builds absolute urls with no trailing slash on the root', () => {
    const now = new Date('2026-07-28T00:00:00.000Z')
    const sitemap = buildSitemap(now)
    expect(sitemap).toContainEqual({ url: 'https://music.crawfordyoung.dev', lastModified: now })
    expect(sitemap).toContainEqual({
      url: 'https://music.crawfordyoung.dev/privacy',
      lastModified: now,
    })
    expect(sitemap).toContainEqual({
      url: 'https://music.crawfordyoung.dev/guides',
      lastModified: now,
    })
    for (const guide of GUIDES) {
      expect(sitemap).toContainEqual({
        url: `https://music.crawfordyoung.dev${guidePath(guide.slug)}`,
        lastModified: now,
      })
    }
  })
})
