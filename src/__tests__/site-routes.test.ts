import { describe, it, expect } from 'vitest'
import { SITE_URL, siteRoutes, buildSitemap } from '@/lib/site-routes'

describe('site-routes', () => {
  it('points at the music subdomain', () => {
    expect(SITE_URL).toBe('https://music.crawfordyoung.dev')
  })

  it('lists the tool and the privacy page', () => {
    expect(siteRoutes()).toEqual(['/', '/privacy'])
  })

  it('builds absolute urls with no trailing slash on the root', () => {
    const now = new Date('2026-07-28T00:00:00.000Z')
    expect(buildSitemap(now)).toEqual([
      { url: 'https://music.crawfordyoung.dev', lastModified: now },
      { url: 'https://music.crawfordyoung.dev/privacy', lastModified: now },
    ])
  })
})
