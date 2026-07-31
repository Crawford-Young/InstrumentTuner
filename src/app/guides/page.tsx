import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES, guidePath, type GuideMeta } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Guides | Instrument Tuner',
  description: 'Guides on tuning, reading a chromatic tuner, and keeping time.',
  openGraph: {
    url: '/guides',
    title: 'Guides | Instrument Tuner',
    description: 'Guides on tuning, reading a chromatic tuner, and keeping time.',
    siteName: 'Instrument Tuner',
    type: 'website',
  },
}

const CATEGORY_LABELS: Readonly<Record<GuideMeta['category'], string>> = {
  tuning: 'Tuning',
  rhythm: 'Rhythm & Practice',
}

const CATEGORY_ORDER: readonly GuideMeta['category'][] = ['tuning', 'rhythm']

function guidesByCategory(
  guides: readonly GuideMeta[],
  category: GuideMeta['category'],
): readonly GuideMeta[] {
  return guides.filter((guide) => guide.category === category).sort((a, b) => a.order - b.order)
}

export default function GuidesHubPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Guides</h1>
      <p className="mt-3 text-muted-foreground">
        Short references for tuning your instrument, reading the tuner, and keeping time — written
        alongside the tool, not instead of it.
      </p>

      {CATEGORY_ORDER.map((category) => {
        const guides = guidesByCategory(GUIDES, category)
        if (guides.length === 0) return null

        return (
          <section key={category} className="mt-10">
            <h2 className="text-xl font-semibold text-foreground">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="mt-4 space-y-3">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={guidePath(guide.slug)}
                  className="block rounded-lg border border-border px-4 py-3 transition-colors hover:border-accent"
                >
                  <p className="font-medium text-foreground">{guide.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{guide.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )
      })}

      <div className="mt-12 border-t border-border pt-6">
        <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
          Back to the tuner
        </Link>
      </div>
    </main>
  )
}
