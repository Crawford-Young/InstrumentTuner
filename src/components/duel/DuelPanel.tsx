'use client'

import { useDuelMatch } from '@/hooks/useDuelMatch'
import { DuelSetup } from './DuelSetup'
import { DuelTurn } from './DuelTurn'
import { DuelReveal } from './DuelReveal'
import { DuelVictory } from './DuelVictory'

export function DuelPanel() {
  const { state, startMatch, submit, nextRound, rematch } = useDuelMatch()

  switch (state.phase) {
    case 'setup':
      return <DuelSetup onStart={startMatch} />

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
      return <DuelReveal result={state.lastResult} players={state.players} onNext={nextRound} />

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
}
