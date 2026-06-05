import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetronomeBeat } from '@/components/MetronomeBeat'

describe('MetronomeBeat', () => {
  it('renders correct number of beat dots', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={4} isPlaying={false} />)
    const dots = screen.getAllByRole('generic').filter(el =>
      el.getAttribute('aria-label')?.startsWith('Beat ')
    )
    expect(dots).toHaveLength(4)
  })

  it('renders 2 dots for 2/4 time', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={2} isPlaying={false} />)
    const dots = screen.getAllByRole('generic').filter(el =>
      el.getAttribute('aria-label')?.startsWith('Beat ')
    )
    expect(dots).toHaveLength(2)
  })

  it('has accessible group label', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={4} isPlaying={false} />)
    expect(screen.getByRole('group', { name: /beat indicator/i })).toBeInTheDocument()
  })

  it('beat 1 has accent label', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={4} isPlaying={false} />)
    expect(screen.getByLabelText('Beat 1 accent')).toBeInTheDocument()
  })

  it('non-accent beats have no accent label', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={4} isPlaying={false} />)
    expect(screen.getByLabelText('Beat 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Beat 3')).toBeInTheDocument()
  })

  it('active accent beat has accent bg class', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={4} isPlaying={true} />)
    const beat1 = screen.getByLabelText('Beat 1 accent')
    expect(beat1.className).toContain('bg-accent')
    expect(beat1.className).toContain('scale-125')
  })

  it('active non-accent beat has foreground bg class', () => {
    render(<MetronomeBeat currentBeat={2} beatsPerMeasure={4} isPlaying={true} />)
    const beat3 = screen.getByLabelText('Beat 3')
    expect(beat3.className).toContain('bg-foreground')
    expect(beat3.className).toContain('scale-110')
  })

  it('inactive accent beat has muted accent class', () => {
    render(<MetronomeBeat currentBeat={1} beatsPerMeasure={4} isPlaying={true} />)
    const beat1 = screen.getByLabelText('Beat 1 accent')
    expect(beat1.className).toContain('bg-accent/30')
  })

  it('inactive non-accent beat has muted class', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={4} isPlaying={true} />)
    const beat2 = screen.getByLabelText('Beat 2')
    expect(beat2.className).toContain('bg-muted-foreground/20')
  })

  it('no beat is active when not playing', () => {
    render(<MetronomeBeat currentBeat={0} beatsPerMeasure={4} isPlaying={false} />)
    const beat1 = screen.getByLabelText('Beat 1 accent')
    expect(beat1.className).not.toContain('scale-125')
  })
})
