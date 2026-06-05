'use client'

import { useCallback, useRef, useState } from 'react'

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_SEC = 0.1
const CLICK_DURATION_SEC = 0.05
const TAP_TIMEOUT_MS = 2000
const MAX_TAP_COUNT = 5
const MIN_BPM = 40
const MAX_BPM = 240
const DEFAULT_BPM = 120
const DEFAULT_BEATS = 4

function scheduleClick(ctx: AudioContext, time: number, isAccent: boolean): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = isAccent ? 1200 : 800
  gain.gain.setValueAtTime(isAccent ? 1.0 : 0.5, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + CLICK_DURATION_SEC)
  osc.start(time)
  osc.stop(time + CLICK_DURATION_SEC)
}

export interface MetronomeState {
  readonly isPlaying: boolean
  readonly bpm: number
  readonly beatsPerMeasure: number
  readonly currentBeat: number
  readonly setBpm: (bpm: number) => void
  readonly setBeatsPerMeasure: (n: number) => void
  readonly start: () => void
  readonly stop: () => void
  readonly tapTempo: () => void
}

export function useMetronome(): MetronomeState {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpmState] = useState(DEFAULT_BPM)
  const [beatsPerMeasure, setBeatsPerMeasureState] = useState(DEFAULT_BEATS)
  const [currentBeat, setCurrentBeat] = useState(0)

  const contextRef = useRef<AudioContext | null>(null)
  const schedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visualTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const nextTickTimeRef = useRef(0)
  const beatCountRef = useRef(0)
  const bpmRef = useRef(bpm)
  const beatsPerMeasureRef = useRef(beatsPerMeasure)
  const tapTimestampsRef = useRef<number[]>([])

  bpmRef.current = bpm
  beatsPerMeasureRef.current = beatsPerMeasure

  const scheduleBeats = useCallback(function scheduleBeats() {
    const ctx = contextRef.current
    /* v8 ignore next */
    if (!ctx) return

    while (nextTickTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      const beatIndex = beatCountRef.current % beatsPerMeasureRef.current
      scheduleClick(ctx, nextTickTimeRef.current, beatIndex === 0)

      const delay = Math.max(0, (nextTickTimeRef.current - ctx.currentTime) * 1000)
      const t = setTimeout(() => setCurrentBeat(beatIndex), delay)
      visualTimeoutsRef.current.push(t)

      nextTickTimeRef.current += 60 / bpmRef.current
      beatCountRef.current++
    }

    schedulerRef.current = setTimeout(scheduleBeats, LOOKAHEAD_MS)
  }, [])

  const start = useCallback(() => {
    if (!contextRef.current) contextRef.current = new AudioContext()
    const ctx = contextRef.current
    if (ctx.state === 'suspended') ctx.resume()

    beatCountRef.current = 0
    nextTickTimeRef.current = ctx.currentTime
    setCurrentBeat(0)
    setIsPlaying(true)
    scheduleBeats()
  }, [scheduleBeats])

  const stop = useCallback(() => {
    if (schedulerRef.current !== null) {
      clearTimeout(schedulerRef.current)
      schedulerRef.current = null
    }
    visualTimeoutsRef.current.forEach(clearTimeout)
    visualTimeoutsRef.current = []
    setIsPlaying(false)
    setCurrentBeat(0)
  }, [])

  const setBpm = useCallback((value: number) => {
    setBpmState(Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value))))
  }, [])

  const setBeatsPerMeasure = useCallback((n: number) => {
    beatCountRef.current = 0
    setBeatsPerMeasureState(n)
  }, [])

  const tapTempo = useCallback(() => {
    const now = Date.now()
    const taps = tapTimestampsRef.current.filter(t => now - t < TAP_TIMEOUT_MS)
    taps.push(now)
    if (taps.length > MAX_TAP_COUNT) taps.shift()
    tapTimestampsRef.current = taps

    if (taps.length < 2) return

    const intervals: number[] = []
    for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1])
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
    setBpm(Math.round(60000 / avg))
  }, [setBpm])

  return { isPlaying, bpm, beatsPerMeasure, currentBeat, setBpm, setBeatsPerMeasure, start, stop, tapTempo }
}
