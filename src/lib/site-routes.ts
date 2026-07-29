import type { MetadataRoute } from 'next'

export const SITE_URL = 'https://music.crawfordyoung.dev'

export const STATIC_ROUTES: readonly string[] = ['/', '/privacy']

export function siteRoutes(): readonly string[] {
  return STATIC_ROUTES
}

export function buildSitemap(lastModified: Date): MetadataRoute.Sitemap {
  return siteRoutes().map((route) => ({
    url: route === '/' ? SITE_URL : `${SITE_URL}${route}`,
    lastModified,
  }))
}
