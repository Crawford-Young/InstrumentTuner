'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type AudioAnalyzerError = 'permission-denied' | 'no-input' | 'suspended' | null

export interface AudioAnalyzerState {
  readonly frequencyData: Float32Array<ArrayBuffer> | null
  readonly isRunning: boolean
  readonly error: AudioAnalyzerError
  readonly start: () => Promise<void>
  readonly stop: () => void
}

const FFT_SIZE = 32768

export function useAudioAnalyzer(): AudioAnalyzerState {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<AudioAnalyzerError>(null)
  const [frequencyData, setFrequencyData] = useState<Float32Array<ArrayBuffer> | null>(null)

  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const dataArrayRef = useRef<Float32Array<ArrayBuffer> | null>(null)

  const loop = useCallback(function loop(): void {
    if (!analyserRef.current || !dataArrayRef.current) return
    analyserRef.current.getFloatFrequencyData(dataArrayRef.current)
    setFrequencyData(new Float32Array(dataArrayRef.current))
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    contextRef.current?.close()
    contextRef.current = null
    analyserRef.current = null
    streamRef.current = null
    setIsRunning(false)
    setFrequencyData(null)
  }, [])

  const start = useCallback(async () => {
    if (contextRef.current !== null) return
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const context = new AudioContext({ sampleRate: 44100 })
      contextRef.current = context

      if (context.state === 'suspended') {
        await context.resume()
      }

      const analyser = context.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyserRef.current = analyser

      const source = context.createMediaStreamSource(stream)
      source.connect(analyser)

      dataArrayRef.current = new Float32Array(analyser.frequencyBinCount)
      setIsRunning(true)
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      contextRef.current?.close()
      contextRef.current = null
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('permission-denied')
      } else {
        setError('suspended')
      }
    }
  }, [loop])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      } else if (isRunning) {
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isRunning, loop])

  useEffect(() => () => stop(), [stop])

  return { frequencyData, isRunning, error, start, stop }
}
