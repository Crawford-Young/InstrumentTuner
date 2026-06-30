'use client'

import { useDuelMatch } from '@/hooks/useDuelMatch'
import { STARTING_HP, type PlayerIndex } from '@/lib/duel/types'
import { DuelSetup } from './DuelSetup'
import { DuelTurn } from './DuelTurn'
import { DuelReveal } from './DuelReveal'
import { DuelVictory } from './DuelVictory'
import { DuelHud } from './DuelHud'

export function DuelPanel() {
  const { state, startMatch, submit, nextRound, rematch } = useDuelMatch()

  if (state.phase === 'setup') {
    return <DuelSetup onStart={startMatch} />
  }

  const activePlayer: PlayerIndex | null =
    state.phase === 'p1-turn' ? 0 : state.phase === 'p2-turn' ? 1 : null

  const content = (() => {
    switch (state.phase) {
      case 'p1-turn':
        return (
          <DuelTurn key={`p1-${state.roundNumber}`} player="P1" mode={state.mode} target={state.target} onSubmit={submit} />
        )
      case 'p2-turn':
        return (
          <DuelTurn key={`p2-${state.roundNumber}`} player="P2" mode={state.mode} target={state.target} onSubmit={submit} />
        )
      case 'reveal':
        /* v8 ignore next */
        if (!state.lastResult) return null
        return <DuelReveal result={state.lastResult} onNext={nextRound} />
      case 'victory': {
        /* v8 ignore next */
        if (!state.lastResult) return null
        const winner = state.lastResult.winner === 0 ? 'P1' : 'P2'
        return (
          <DuelVictory
            winner={winner}
            rounds={state.roundNumber}
            onRematch={rematch}
            onExit={() => window.location.reload()}
          />
        )
      }
      /* v8 ignore next 2 */
      default:
        return null
    }
  })()

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <DuelHud players={state.players} activePlayer={activePlayer} startingHp={STARTING_HP} />
      {content}
    </div>
  )
}
