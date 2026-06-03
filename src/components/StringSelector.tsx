'use client'

import { Button } from '@/lib/ui'
import type { StringTuning } from '@/lib/instruments'

export interface StringSelectorProps {
  readonly strings: readonly StringTuning[]
  readonly autoDetectedIndex: number | null
  readonly lockedIndex: number | null
  readonly onSelect: (index: number | null) => void
}

export function StringSelector({
  strings,
  autoDetectedIndex,
  lockedIndex,
  onSelect,
}: StringSelectorProps) {
  const activeIndex = lockedIndex ?? autoDetectedIndex

  return (
    <div
      role="group"
      aria-label="String selector"
      className="flex flex-wrap justify-center gap-2"
    >
      {strings.map((string, i) => {
        const isActive = activeIndex === i
        const isLocked = lockedIndex === i
        return (
          <Button
            key={string.name}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(isLocked ? null : i)}
            aria-pressed={isLocked}
            aria-label={`${string.name}${isLocked ? ' (locked)' : ''}`}
            className={isLocked ? 'ring-2 ring-primary ring-offset-1' : ''}
          >
            {string.name}
          </Button>
        )
      })}
    </div>
  )
}
