import { AdBanner } from '@/components/AdBanner'
import { MIN_GUIDE_WORDS } from '@/lib/guide-content'

interface GuideAdSlotProps {
  readonly wordCount: number
}

export function GuideAdSlot({ wordCount }: GuideAdSlotProps): React.ReactNode {
  if (wordCount < MIN_GUIDE_WORDS) return null
  return <AdBanner />
}
