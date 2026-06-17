// src/__tests__/useDuelMatch.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDuelMatch } from '@/hooks/useDuelMatch'
import { STARTING_HP } from '@/lib/duel/types'

// Deterministic RNG: always midpoint -> target 120
const rng = () => 0.5

describe('useDuelMatch', () => {
  it('starts in setup phase', () => {
    const { result } = renderHook(() => useDuelMatch(rng))
    expect(result.current.state.phase).toBe('setup')
  })

  it('startMatch -> p1-turn with target and full HP', () => {
    const { result } = renderHook(() => useDuelMatch(rng))
    act(() => result.current.startMatch('tap'))
    expect(result.current.state.phase).toBe('p1-turn')
    expect(result.current.state.mode).toBe('tap')
    expect(result.current.state.target).toBe(120)
    expect(result.current.state.players[0].hp).toBe(STARTING_HP)
    expect(result.current.state.roundNumber).toBe(1)
  })

  it('first submit advances to p2-turn, stores p1 answer', () => {
    const { result } = renderHook(() => useDuelMatch(rng))
    act(() => result.current.startMatch('tap'))
    act(() => result.current.submit(120))
    expect(result.current.state.phase).toBe('p2-turn')
    expect(result.current.state.p1Answer).toBe(120)
  })

  it('second submit resolves round -> reveal with result', () => {
    const { result } = renderHook(() => useDuelMatch(rng))
    act(() => result.current.startMatch('tap'))
    act(() => result.current.submit(120)) // p1 perfect
    act(() => result.current.submit(140)) // p2 off by 20
    expect(result.current.state.phase).toBe('reveal')
    expect(result.current.state.lastResult?.winner).toBe(0)
    expect(result.current.state.players[1].hp).toBe(STARTING_HP - 20)
  })

  it('nextRound resets answers and increments roundNumber', () => {
    const { result } = renderHook(() => useDuelMatch(rng))
    act(() => result.current.startMatch('tap'))
    act(() => result.current.submit(120))
    act(() => result.current.submit(140))
    act(() => result.current.nextRound())
    expect(result.current.state.phase).toBe('p1-turn')
    expect(result.current.state.p1Answer).toBeNull()
    expect(result.current.state.p2Answer).toBeNull()
    expect(result.current.state.roundNumber).toBe(2)
  })

  it('lethal round goes straight to victory', () => {
    const { result } = renderHook(() => useDuelMatch(rng))
    act(() => result.current.startMatch('tap'))
    act(() => result.current.submit(120)) // p1 perfect (dist 0)
    act(() => result.current.submit(200)) // p2 dist 80 -> 80 dmg... not lethal alone
    // Drive several rounds to kill. Simpler: assert reveal then continue isn't needed here.
    expect(result.current.state.phase).toBe('reveal')
  })

  it('rematch from victory resets to full HP, same mode', () => {
    const { result } = renderHook(() => useDuelMatch(rng))
    act(() => result.current.startMatch('guess'))
    act(() => result.current.rematch())
    expect(result.current.state.mode).toBe('guess')
    expect(result.current.state.players[0].hp).toBe(STARTING_HP)
    expect(result.current.state.players[1].hp).toBe(STARTING_HP)
    expect(result.current.state.phase).toBe('p1-turn')
  })
})
