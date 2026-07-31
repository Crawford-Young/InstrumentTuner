import { describe, it, expect } from 'vitest'
import { GUIDES, GuideMetaSchema, guidePath } from '@/lib/guides'

describe('guide registry', () => {
  it('every entry satisfies the schema', () => {
    for (const guide of GUIDES) {
      expect(() => GuideMetaSchema.parse(guide)).not.toThrow()
    }
  })

  it('slugs and orders are unique', () => {
    const slugs = GUIDES.map((g) => g.slug)
    const orders = GUIDES.map((g) => g.order)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(orders).size).toBe(orders.length)
  })

  it('guidePath builds the route', () => {
    expect(guidePath('drop-d-tuning')).toBe('/guides/drop-d-tuning')
  })
})
