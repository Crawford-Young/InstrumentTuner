import type { MetadataRoute } from 'next'
import { GUIDES, guidePath } from './guides'

export const SITE_URL = 'https://music.crawfordyoung.dev'

export const STATIC_ROUTES: readonly string[] = ['/', '/privacy', '/guides']

export function siteRoutes(): readonly string[] {
  return [...STATIC_ROUTES, ...GUIDES.map((guide) => guidePath(guide.slug))]
}

export function buildSitemap(lastModified: Date): MetadataRoute.Sitemap {
  return siteRoutes().map((route) => ({
    url: route === '/' ? SITE_URL : `${SITE_URL}${route}`,
    lastModified,
  }))
}
