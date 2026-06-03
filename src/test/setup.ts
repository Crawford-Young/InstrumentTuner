import { vi, beforeEach } from 'vitest'

// Import jest-dom matchers
import '@testing-library/jest-dom'

const mockGetFloatFrequencyData = vi.fn((array: Float32Array) => array.fill(-100))
const mockConnect = vi.fn()

export const mockAnalyserNode = {
  fftSize: 32768,
  get frequencyBinCount() { return this.fftSize / 2 },
  getFloatFrequencyData: mockGetFloatFrequencyData,
  connect: mockConnect,
}

export const mockMediaStreamSource = { connect: vi.fn() }

export const mockAudioContext = {
  state: 'running' as AudioContextState,
  sampleRate: 44100,
  createAnalyser: vi.fn(() => mockAnalyserNode),
  createMediaStreamSource: vi.fn(() => mockMediaStreamSource),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
}

const mockTrack = { stop: vi.fn() }
export const mockMediaStream = {
  getTracks: vi.fn(() => [mockTrack]),
}

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
// Intentionally non-invoking: the stub returns an ID but never calls the callback,
// so the rAF loop body is not exercised in unit tests (isolation by design).
vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
vi.stubGlobal('cancelAnimationFrame', vi.fn())

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: vi.fn().mockResolvedValue(mockMediaStream) },
  writable: true,
})

beforeEach(() => {
  vi.clearAllMocks()
  mockGetFloatFrequencyData.mockImplementation((array: Float32Array) => array.fill(-100))
  ;(global.navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>)
    .mockResolvedValue(mockMediaStream)
})
