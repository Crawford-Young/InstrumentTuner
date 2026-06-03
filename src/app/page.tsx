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
  const [mode, setMode] = useState<Mode>('note-detector')
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(INSTRUMENTS[0])
  const [lockedStringIndex, setLockedStringIndex] = useState<number | null>(null)

  const { frequencyData, isRunning, error, start, stop } = useAudioAnalyzer()
  const { detectedFreq, closestNote, centsDeviation } = usePitchDetector(frequencyData)

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-foreground">
      <h1 className="text-2xl font-bold tracking-tight">Instrument Tuner</h1>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        className="w-full max-w-sm"
      >
        <TabsList variant="pills" className="w-full">
          <TabsTrigger value="note-detector" variant="pills" className="flex-1">
            Note Detector
          </TabsTrigger>
          <TabsTrigger value="tuner" variant="pills" className="flex-1">
            Tuner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="note-detector">
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-8xl font-bold tracking-tight tabular-nums">
              {closestNote ?? '—'}
            </p>
            <p className="text-2xl text-muted-foreground tabular-nums">
              {detectedFreq !== null ? `${detectedFreq.toFixed(1)} Hz` : '—'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="tuner">
          <div className="flex flex-col items-center gap-4 py-4">
            <Select
              value={selectedInstrument.id}
              onValueChange={handleInstrumentChange}
            >
              <SelectTrigger className="w-40" aria-label="Instrument">
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

            <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
              <p>
                Target:{' '}
                {activeString
                  ? `${activeString.name}  ${activeString.frequency.toFixed(1)} Hz`
                  : '—'}
              </p>
              <p>
                Detected:{' '}
                {closestNote && detectedFreq
                  ? `${closestNote}  ${detectedFreq.toFixed(1)} Hz`
                  : '—'}
              </p>
            </div>

            <p
              className={`text-xl font-semibold ${tuneStatus === 'Tuned' ? 'text-green-500' : 'text-foreground'}`}
            >
              {tuneStatus ?? '—'}
            </p>

            <StringSelector
              strings={selectedInstrument.strings}
              autoDetectedIndex={autoDetectedIndex}
              lockedIndex={lockedStringIndex}
              onSelect={setLockedStringIndex}
            />
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="w-full max-w-sm">
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
        className="rounded-full"
        aria-label={isRunning ? 'Stop microphone' : 'Start microphone'}
      >
        {isRunning ? 'Stop' : 'Start'}
      </Button>
    </main>
  )
}
