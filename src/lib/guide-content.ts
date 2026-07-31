import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const MIN_GUIDE_WORDS = 500

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'guides')

export function readGuideSource(slug: string): string {
  return readFileSync(join(CONTENT_DIR, `${slug}.mdx`), 'utf8')
}

export function countWords(mdx: string): number {
  const stripped = mdx
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`|~]/g, ' ')
  return stripped.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}
