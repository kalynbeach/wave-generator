import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AudioEngine } from "@/lib/audio/engine";
import { ModulationSettings } from "@/lib/types/audio";

describe("AudioEngine", () => {
  let engine: AudioEngine;
  let mockSettings: ModulationSettings;

  beforeEach(() => {
    engine = new AudioEngine();
    mockSettings = {
      carrierFrequency: 440,
      beatFrequency: 7.83,
      binauralIntensity: 1,
      aModDepth: 0.5,
      stereoDepth: 0.3,
      fModDepth: 0.2,
      volume: 0.8,
      mixLevel: 0.7,
      noiseType: "white",
      noiseLevel: 0.1
    };
  });

  afterEach(() => {
    engine.cleanup();
  });

  describe("initialization", () => {
    it("should create an instance", () => {
      expect(engine).toBeDefined();
    });

    it("should initialize audio context and nodes", () => {
      engine.initialize();
      expect(engine["audioContext"]).toBeDefined();
      expect(engine["masterGain"]).toBeDefined();
      expect(engine["carrierGain"]).toBeDefined();
      expect(engine["leftGain"]).toBeDefined();
      expect(engine["rightGain"]).toBeDefined();
      expect(engine["noiseGain"]).toBeDefined();
    });
  });

  describe("playback control", () => {
    it("should start playing with given settings", () => {
      engine.play(mockSettings);
      expect(engine["isPlaying"]).toBe(true);
      expect(engine["currentSettings"]).toEqual(mockSettings);
    });

    it("should stop playing", () => {
      engine.play(mockSettings);
      engine.stop();
      expect(engine["isPlaying"]).toBe(false);
      expect(engine["oscillator"]).toBeNull();
      expect(engine["leftOscillator"]).toBeNull();
      expect(engine["rightOscillator"]).toBeNull();
    });

    it("should restart when playing with new settings", () => {
      engine.play(mockSettings);
      const newSettings = { ...mockSettings, carrierFrequency: 880 };
      engine.play(newSettings);
      expect(engine["currentSettings"]).toEqual(newSettings);
    });
  });

  describe("settings updates", () => {
    it("should update volume without restart", () => {
      engine.play(mockSettings);
      engine.updateSettings({ volume: 0.5 });
      expect(engine["masterGain"]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, expect.any(Number));
    });

    it("should update mix level without restart", () => {
      engine.play(mockSettings);
      engine.updateSettings({ mixLevel: 0.6 });
      expect(engine["carrierGain"]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.6, expect.any(Number));
    });

    it("should update noise level without restart", () => {
      engine.play(mockSettings);
      engine.updateSettings({ noiseLevel: 0.2 });
      expect(engine["noiseGain"]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.2, expect.any(Number));
    });

    it("should restart when updating carrier frequency", () => {
      engine.play(mockSettings);
      const newSettings = { ...mockSettings, carrierFrequency: 880 };
      engine.updateSettings({ carrierFrequency: 880 });
      expect(engine["currentSettings"]).toEqual(newSettings);
    });
  });

  describe("cleanup", () => {
    it("should clean up all resources", () => {
      engine.play(mockSettings);
      engine.cleanup();
      expect(engine["audioContext"]).toBeNull();
      expect(engine["masterGain"]).toBeNull();
      expect(engine["carrierGain"]).toBeNull();
      expect(engine["leftGain"]).toBeNull();
      expect(engine["rightGain"]).toBeNull();
      expect(engine["noiseGain"]).toBeNull();
      expect(engine["isPlaying"]).toBe(false);
      expect(engine["currentSettings"]).toBeNull();
    });
  });
});