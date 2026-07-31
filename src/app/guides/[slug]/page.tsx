import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GUIDES, guidePath, type GuideMeta } from '@/lib/guides'
import { countWords, readGuideSource } from '@/lib/guide-content'
import { GuideAdSlot } from '@/components/GuideAdSlot'
import { guideContent } from '../content-map'

interface GuidePageParams {
  readonly slug: string
}

interface GuidePageProps {
  readonly params: Promise<GuidePageParams>
}

export const dynamicParams = false

// Return type must be a mutable array — Next's generated route validator
// (.next/dev/types/validator.ts) requires `any[] | Promise<any[]>`, which a
// readonly array does not satisfy.
export function generateStaticParams(): GuidePageParams[] {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

function findGuide(slug: string): GuideMeta | undefined {
  return GUIDES.find((guide) => guide.slug === slug)
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = findGuide(slug)
  if (!guide) return {}

  return {
    title: `${guide.title} | Instrument Tuner`,
    description: guide.description,
    openGraph: {
      url: guidePath(guide.slug),
      title: guide.title,
      description: guide.description,
      siteName: 'Instrument Tuner',
      type: 'article',
    },
  }
}

// Tailwind child selectors, not the mdx-components.tsx mapping — that file is
// out of this task's scope and any typography pass there needs its own test
// (it is coverage-counted). Tokens match the app's existing dark aesthetic.
const ARTICLE_PROSE_CLASSES =
  '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground ' +
  '[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground ' +
  '[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground ' +
  '[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-muted-foreground ' +
  '[&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_table]:text-muted-foreground ' +
  '[&_th]:border-b [&_th]:border-border [&_th]:pb-2 [&_th]:text-left [&_th]:text-foreground ' +
  '[&_td]:border-b [&_td]:border-border/40 [&_td]:py-2 ' +
  '[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4'

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = findGuide(slug)
  const loadContent = guideContent[slug]
  if (!guide || !loadContent) {
    notFound()
  }

  const { default: Content } = await loadContent()
  const wordCount = countWords(readGuideSource(slug))

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/guides" className="text-sm text-muted-foreground underline underline-offset-4">
        Back to guides
      </Link>

      <article className={ARTICLE_PROSE_CLASSES}>
        <Content />
      </article>

      <div className="mt-12">
        <GuideAdSlot wordCount={wordCount} />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
          Back to the tuner
        </Link>
      </div>
    </main>
  )
}
