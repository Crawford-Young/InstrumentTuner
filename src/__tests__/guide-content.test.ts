import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { compile } from '@mdx-js/mdx'
import { GUIDES } from '@/lib/guides'
import { countWords, MIN_GUIDE_WORDS, readGuideSource } from '@/lib/guide-content'

describe('readGuideSource', () => {
  it('throws for a slug with no content file', () => {
    expect(() => readGuideSource('no-such-guide')).toThrow()
  })
})

describe('countWords', () => {
  it('counts prose words, not markup', () => {
    expect(countWords('# Title\n\nTwo words [link text](/guides/x) *here*.')).toBe(6)
  })

  it('ignores code fences and jsx tags', () => {
    expect(
      countWords('one\n```\nnot counted\n```\n<GuideAdSlot wordCount={5} />\ntwo'),
    ).toBe(2)
  })
})

describe('MIN_GUIDE_WORDS', () => {
  it('is the spec floor', () => {
    expect(MIN_GUIDE_WORDS).toBe(500)
  })
})

describe('guide content files', () => {
  it('every registry entry has a source file that compiles as MDX', async () => {
    for (const guide of GUIDES) {
      const source = readGuideSource(guide.slug)
      await expect(compile(source)).resolves.toBeDefined()
    }
  })

  it('every guide meets the content floor', () => {
    for (const guide of GUIDES) {
      expect(countWords(readGuideSource(guide.slug)), guide.slug).toBeGreaterThanOrEqual(
        MIN_GUIDE_WORDS,
      )
    }
  })

  it('no orphan content files outside the registry', () => {
    const files = readdirSync(join(process.cwd(), 'src', 'content', 'guides'))
    const slugs = new Set(GUIDES.map((g) => g.slug))
    for (const file of files) {
      expect(slugs.has(file.replace(/\.mdx$/, '')), file).toBe(true)
    }
  })
})
