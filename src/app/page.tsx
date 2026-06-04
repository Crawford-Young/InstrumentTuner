'use client'

import { useState } from 'react'
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer'
import { usePitchDetector } from '@/hooks/usePitchDetector'
import { TunerGauge } from '@/components/TunerGauge'
import { StringSelector } from '@/components/StringSelector'
import { INSTRUMENTS, detectClosestString, type Instrument } from '@/lib/instruments'
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
} from '@/lib/ui'

type Mode = 'note-detector' | 'tuner'

const MAX_NEEDLE_CENTS = 50

function getTuneStatus(cents: number | null): string | null {
  if (cents === null) return null
  if (Math.abs(cents) <= 5) return 'Tuned'
  return cents < 0 ? 'Tune up' : 'Tune down'
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('tuner')
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(INSTRUMENTS[0])
  const [lockedStringIndex, setLockedStringIndex] = useState<number | null>(null)

  const { timeDomainData, isRunning, error, start, stop } = useAudioAnalyzer()
  const { detectedFreq, closestNote, centsDeviation } = usePitchDetector(timeDomainData)

  const autoDetectedString =
    detectedFreq !== null ? detectClosestString(detectedFreq, selectedInstrument) : null
  const autoDetectedIndex =
    autoDetectedString !== null
      ? selectedInstrument.strings.indexOf(autoDetectedString)
      : null

  const activeString =
    lockedStringIndex !== null
      ? selectedInstrument.strings[lockedStringIndex]
      : autoDetectedString

  const rawCents = activeString !== null ? centsDeviation(activeString.frequency) : null
  const clampedCents =
    rawCents !== null
      ? Math.max(-MAX_NEEDLE_CENTS, Math.min(MAX_NEEDLE_CENTS, rawCents))
      : null

  const tuneStatus = getTuneStatus(rawCents)

  const handleInstrumentChange = (id: string) => {
    const instrument = INSTRUMENTS.find((i) => i.id === id) ?? INSTRUMENTS[0]
    setSelectedInstrument(instrument)
    setLockedStringIndex(null)
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Subtle emerald ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 0%, rgb(16 185 129 / 0.06) 0%, transparent 60%)',
        }}
      />

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        className="flex flex-1 flex-col"
      >
        {/* Pill nav — top of page */}
        <div className="sticky top-0 z-10 border-b border-border/40 bg-background/80 px-6 py-3 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-sm">
            <TabsList variant="pills" className="w-full">
              <TabsTrigger value="tuner" variant="pills" className="flex-1">
                Tuner
              </TabsTrigger>
              <TabsTrigger value="note-detector" variant="pills" className="flex-1">
                Note Detector
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tuner content */}
        <TabsContent value="tuner" className="flex-1 mt-0">
          <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-6 py-8">
          <div className="flex w-full max-w-sm flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Instrument Tuner
              </h1>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
                Chromatic · Real-time
              </p>
            </div>

            <Select
              value={selectedInstrument.id}
              onValueChange={handleInstrumentChange}
            >
              <SelectTrigger className="w-36" aria-label="Instrument">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENTS.map((instrument) => (
                  <SelectItem key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TunerGauge cents={clampedCents} />

            <p
              className={`font-mono text-xl font-semibold tracking-widest ${
                tuneStatus === 'Tuned' ? 'text-accent' : 'text-foreground/70'
              }`}
            >
              {tuneStatus ?? '—'}
            </p>

            <StringSelector
              strings={selectedInstrument.strings}
              autoDetectedIndex={autoDetectedIndex}
              lockedIndex={lockedStringIndex}
              onSelect={setLockedStringIndex}
            />

            <div className="flex flex-col items-center gap-0.5">
              <p className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                Target{' '}
                {activeString
                  ? `${activeString.name} · ${activeString.frequency.toFixed(1)} Hz`
                  : '—'}
              </p>
              <p className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                Detected{' '}
                {closestNote && detectedFreq
                  ? `${closestNote} · ${detectedFreq.toFixed(1)} Hz`
                  : '—'}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertDescription>
                  {error === 'permission-denied' && (
                    <>
                      Microphone access denied.{' '}
                      <Button variant="link" size="sm" className="h-auto p-0" onClick={start}>
                        Retry
                      </Button>
                    </>
                  )}
                  {error === 'suspended' && 'Audio context suspended. Click Start to activate.'}
                  {error === 'no-input' && 'No audio input detected.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={isRunning ? stop : start}
              variant={isRunning ? 'destructive' : 'default'}
              size="lg"
              className="w-32 rounded-full font-mono text-xs tracking-widest uppercase"
              aria-label={isRunning ? 'Stop microphone' : 'Start microphone'}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
          </div>
          </div>
        </TabsContent>

        {/* Note detector content */}
        <TabsContent value="note-detector" className="flex-1 mt-0">
          <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-6 py-8">
          <div className="flex w-full max-w-sm flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Note Detector
              </h1>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
                Chromatic · Real-time
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p
                className={`text-[96px] font-bold leading-none tracking-tight tabular-nums transition-colors ${
                  closestNote ? 'text-foreground' : 'text-foreground/15'
                }`}
              >
                {closestNote ?? '—'}
              </p>
              <p className="font-mono text-2xl tabular-nums text-muted-foreground">
                {detectedFreq !== null ? `${detectedFreq.toFixed(1)} Hz` : '— Hz'}
              </p>
              {!closestNote && (
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground/40">
                  Awaiting signal
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertDescription>
                  {error === 'permission-denied' && (
                    <>
                      Microphone access denied.{' '}
                      <Button variant="link" size="sm" className="h-auto p-0" onClick={start}>
                        Retry
                      </Button>
                    </>
                  )}
                  {error === 'suspended' && 'Audio context suspended. Click Start to activate.'}
                  {error === 'no-input' && 'No audio input detected.'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={isRunning ? stop : start}
              variant={isRunning ? 'destructive' : 'default'}
              size="lg"
              className="w-32 rounded-full font-mono text-xs tracking-widest uppercase"
              aria-label={isRunning ? 'Stop microphone' : 'Start microphone'}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
          </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
