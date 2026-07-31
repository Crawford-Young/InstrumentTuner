import { describe, it, expect } from 'vitest'
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
