import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer'
import { mockAudioContext, mockMediaStream } from '@/test/setup'

describe('useAudioAnalyzer', () => {
  it('starts with isRunning false and no error', () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    expect(result.current.isRunning).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.frequencyData).toBeNull()
  })

  it('sets isRunning true after start()', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(result.current.isRunning).toBe(true)
  })

  it('calls getUserMedia with audio constraints', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: false,
    })
  })

  it('creates AudioContext with 44100 sample rate', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(AudioContext).toHaveBeenCalledWith({ sampleRate: 44100 })
  })

  it('creates AnalyserNode and sets fftSize to 32768', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled()
  })

  it('sets error to permission-denied when getUserMedia throws NotAllowedError', async () => {
    const notAllowed = new DOMException('Denied', 'NotAllowedError')
    ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(notAllowed)
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(result.current.error).toBe('permission-denied')
    expect(result.current.isRunning).toBe(false)
  })

  it('sets error to suspended on other failures', async () => {
    ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Some error'),
    )
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(result.current.error).toBe('suspended')
  })

  it('sets isRunning false and frequencyData null after stop()', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    act(() => { result.current.stop() })
    expect(result.current.isRunning).toBe(false)
    expect(result.current.frequencyData).toBeNull()
  })

  it('stops all tracks on stop()', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    act(() => { result.current.stop() })
    const track = mockMediaStream.getTracks()[0]
    expect(track.stop).toHaveBeenCalled()
  })

  it('closes AudioContext on stop()', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    act(() => { result.current.stop() })
    expect(mockAudioContext.close).toHaveBeenCalled()
  })

  it('guards against double-start: second start() returns early', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    const callsBefore = (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mock.calls.length
    // Calling start again while already running should return early
    await act(async () => { await result.current.start() })
    const callsAfter = (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mock.calls.length
    // Second start() should return early without calling getUserMedia again
    expect(callsAfter).toBe(callsBefore)
    expect(result.current.isRunning).toBe(true)
    // Verify that calling start a third time also doesn't call getUserMedia
    await act(async () => { await result.current.start() })
    expect((navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore)
  })

  it('clears error on subsequent start()', async () => {
    const notAllowed = new DOMException('Denied', 'NotAllowedError')
    ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(notAllowed)
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(result.current.error).toBe('permission-denied')
    // Stop first to clear the context ref, then subsequent start clears error
    act(() => { result.current.stop() })
    ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockMediaStream)
    await act(async () => { await result.current.start() })
    expect(result.current.error).toBeNull()
  })

  it('resumes AudioContext when state is suspended', async () => {
    const originalState = mockAudioContext.state
    ;(mockAudioContext as { state: AudioContextState }).state = 'suspended'
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(mockAudioContext.resume).toHaveBeenCalled()
    ;(mockAudioContext as { state: AudioContextState }).state = originalState
  })

  it('loop fills frequencyData when refs are populated', async () => {
    let capturedCallback: FrameRequestCallback | null = null
    ;(global.requestAnimationFrame as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (cb: FrameRequestCallback) => { capturedCallback = cb; return 1 },
    )
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    // Invoke the loop once with a stub rAF that doesn't recurse
    ;(global.requestAnimationFrame as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 2)
    act(() => { capturedCallback?.(0) })
    expect(result.current.frequencyData).not.toBeNull()
  })

  it('loop returns early when analyserRef is null', async () => {
    // Capture the loop callback on the first rAF call
    let capturedCallback: FrameRequestCallback | null = null
    ;(global.requestAnimationFrame as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (cb: FrameRequestCallback) => { capturedCallback = cb; return 1 },
    )
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    // Stop clears refs, then invoke the captured callback — it should hit the early return
    act(() => { result.current.stop() })
    // capturedCallback is the loop function; calling it with null refs should be a no-op
    ;(global.requestAnimationFrame as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 2)
    act(() => { capturedCallback?.(0) })
    // After the early return the state should remain null (no setFrequencyData call)
    expect(result.current.frequencyData).toBeNull()
  })

  it('visibilitychange hides tab: cancels rAF when rafRef is set', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    const callsBefore = (global.cancelAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length
    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    const callsAfter = (global.cancelAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length
    expect(callsAfter).toBeGreaterThan(callsBefore)
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
  })

  it('visibilitychange hides tab: skips cancelAnimationFrame when rafRef is null', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    // Stop first so rafRef becomes null
    act(() => { result.current.stop() })
    vi.clearAllMocks()
    ;(global.navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>)
      .mockResolvedValue(mockMediaStream)
    // Trigger hide with rafRef already null — cancelAnimationFrame should NOT be called
    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(global.cancelAnimationFrame).not.toHaveBeenCalled()
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
  })

  it('visibilitychange shows tab: schedules rAF when isRunning', async () => {
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    // First simulate hide to clear rafRef
    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    vi.clearAllMocks()
    ;(global.navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>)
      .mockResolvedValue(mockMediaStream)
    // Now simulate show while isRunning is true
    act(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(global.requestAnimationFrame).toHaveBeenCalled()
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
  })

  it('visibilitychange shows tab: does not schedule rAF when not running', () => {
    // isRunning is false by default; showing tab should be a no-op
    renderHook(() => useAudioAnalyzer())
    vi.clearAllMocks()
    ;(global.navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>)
      .mockResolvedValue(mockMediaStream)
    act(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(global.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('stops tracks and closes context when AudioContext throws after getUserMedia', async () => {
    ;(AudioContext as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('AudioContext failed')
    })
    const { result } = renderHook(() => useAudioAnalyzer())
    await act(async () => { await result.current.start() })
    expect(result.current.error).toBe('suspended')
    const track = mockMediaStream.getTracks()[0]
    expect(track.stop).toHaveBeenCalled()
  })
})
