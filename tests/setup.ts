import { vi } from "vitest";

// Mock Web Audio API
class MockAudioContext {
  createGain() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 0, linearRampToValueAtTime: vi.fn() }
    };
  }

  createOscillator() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: "sine",
      frequency: { value: 0 }
    };
  }

  createChannelMerger() {
    return {
      connect: vi.fn()
    };
  }

  createStereoPanner() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      pan: { value: 0 }
    };
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      duration: length / sampleRate,
      numberOfChannels: channels,
      sampleRate: sampleRate,
      getChannelData: vi.fn().mockReturnValue(new Float32Array(length))
    };
  }

  createBufferSource() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null
    };
  }

  close() {
    return Promise.resolve();
  }

  destination = {};
  currentTime = 0;
  sampleRate = 44100;
}

// Add Web Audio API to global scope
global.AudioContext = MockAudioContext as any; 