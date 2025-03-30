import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import { AudioEngine } from "@/lib/audio/engine";
import type { ModulationSettings } from "@/lib/types/audio";

// Mock the global AudioContext and its methods
const mockAudioContext = {
  currentTime: 0,
  destination: {},
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
  })),
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    frequency: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      connect: vi.fn(), // Needed if modulating frequency
    },
    type: "sine",
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createStereoPanner: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      pan: {
          value: 0,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          connect: vi.fn(),
      },
  })),
  createChannelMerger: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
  })),
  createBufferSource: vi.fn(() => ({
      buffer: null,
      loop: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
  })),
  decodeAudioData: vi.fn(),
  close: vi.fn(() => Promise.resolve()),
  state: "running",
};

vi.stubGlobal("AudioContext", vi.fn(() => mockAudioContext));
vi.stubGlobal("window", { AudioContext: vi.fn(() => mockAudioContext) });

// Mock NoiseGenerator statically
vi.mock("@/lib/audio/noise", () => ({
    NoiseGenerator: {
        createNoiseSource: vi.fn(() => mockAudioContext.createBufferSource()),
    },
}));

describe("AudioEngine", () => {
  let engine: AudioEngine;
  let initialSettings: ModulationSettings;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    engine = new AudioEngine();
    // Initialize explicitly in tests where needed, or rely on play() to initialize

    initialSettings = {
      carrierFrequency: 440,
      beatFrequency: 7,
      binauralIntensity: 1,
      aModDepth: 0.5,
      stereoDepth: 0.3,
      fModDepth: 0.2,
      volume: 0.8,
      mixLevel: 0.7,
      noiseType: "white",
      noiseLevel: 0.1,
    };
  });

  afterEach(() => {
    engine.cleanup();
  });

  describe("initialization", () => {
    it("should create an instance", () => {
      expect(engine).toBeDefined();
    });

    it("should initialize audio context and core nodes on first play or initialize call", () => {
      expect(engine["audioContext"]).toBeNull();
      engine.initialize();
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(5); // master, carrier, left, right, noise
      expect(engine["audioContext"]).toEqual(mockAudioContext);
      expect(engine["masterGain"]).toBeDefined();
      expect(engine["carrierGain"]).toBeDefined();
      expect(engine["leftGain"]).toBeDefined();
      expect(engine["rightGain"]).toBeDefined();
      expect(engine["noiseGain"]).toBeDefined();
    });

     it("should handle AudioContext creation failure", () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal("AudioContext", vi.fn(() => { throw new Error("Test Error") }));
        vi.stubGlobal("window", { AudioContext: vi.fn(() => { throw new Error("Test Error") }) });

        const failingEngine = new AudioEngine();
        failingEngine.initialize();

        expect(failingEngine["audioContext"]).toBeNull();
        expect(errorSpy).toHaveBeenCalledWith("Failed to initialize Web Audio Context:", expect.any(Error));

        // Attempt to play should also fail gracefully
        failingEngine.play(initialSettings);
        expect(errorSpy).toHaveBeenCalledWith("AudioEngine not properly initialized, cannot play.");

        errorSpy.mockRestore();
        // Restore global mocks if necessary, depends on test runner setup
        vi.unstubAllGlobals();
        // Re-stub for subsequent tests
        vi.stubGlobal("AudioContext", vi.fn(() => mockAudioContext));
        vi.stubGlobal("window", { AudioContext: vi.fn(() => mockAudioContext) });
    });
  });

  describe("playback control", () => {
    beforeEach(() => {
        engine.initialize(); // Ensure initialized for these tests
    });

    it("should start playing with given settings", () => {
      engine.play(initialSettings);
      expect(engine["isPlaying"]).toBe(true);
      expect(engine["currentSettings"]).toEqual(initialSettings);
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled(); // Includes gains created during init
      expect(mockAudioContext.createStereoPanner).toHaveBeenCalled();
      // Check if oscillators were started
      const createdOscillators = mockAudioContext.createOscillator.mock.results;
      createdOscillators.forEach(result => expect(result.value.start).toHaveBeenCalled());
    });

    it("should stop playing and reset nodes", () => {
      engine.play(initialSettings);
      expect(engine["isPlaying"]).toBe(true);

      // Get references to nodes created during play
      const leftOsc = engine["leftOscillator"];
      const rightOsc = engine["rightOscillator"];
      const aModOsc = engine["aModOscillator"];
      const stereoLFO = engine["stereoLFO"];
      const fModOsc = engine["fModOscillator"];
      const noiseNode = engine["noiseNode"];

      engine.stop();

      expect(engine["isPlaying"]).toBe(false);
      // Check if stop was called on nodes that existed
      expect(leftOsc?.stop).toHaveBeenCalled();
      expect(rightOsc?.stop).toHaveBeenCalled();
      expect(aModOsc?.stop).toHaveBeenCalled();
      expect(stereoLFO?.stop).toHaveBeenCalled();
      expect(fModOsc?.stop).toHaveBeenCalled();
      expect(noiseNode?.stop).toHaveBeenCalled();

      // Check if node references are nulled
      expect(engine["oscillator"]).toBeNull();
      expect(engine["leftOscillator"]).toBeNull();
      expect(engine["rightOscillator"]).toBeNull();
      expect(engine["aModOscillator"]).toBeNull();
      expect(engine["aModGain"]).toBeNull();
      expect(engine["aModDepthGain"]).toBeNull();
      expect(engine["stereoPanner"]).toBeNull();
      expect(engine["stereoLFO"]).toBeNull();
      expect(engine["stereoDepthGain"]).toBeNull();
      expect(engine["fModOscillator"]).toBeNull();
      expect(engine["fModDepthGain"]).toBeNull();
      expect(engine["noiseNode"]).toBeNull();
    });

    it("should stop and restart when playing again with new settings", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');

      engine.play(initialSettings);
      expect(stopSpy).not.toHaveBeenCalled(); // Should not stop on first play
      expect(playSpy).toHaveBeenCalledTimes(1);

      const newSettings = { ...initialSettings, carrierFrequency: 880 };
      engine.play(newSettings);

      expect(stopSpy).toHaveBeenCalledTimes(1); // Should stop before second play
      expect(playSpy).toHaveBeenCalledTimes(2);
      expect(engine["currentSettings"]).toEqual(newSettings);
      expect(engine["isPlaying"]).toBe(true);

      playSpy.mockRestore();
      stopSpy.mockRestore();
    });
  });

  describe("updateSettings", () => {
     beforeEach(() => {
        engine.initialize();
        engine.play(initialSettings); // Start playing with initial settings
     });

    it("should update volume smoothly without restart", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      const newVolume = 0.5;
      engine.updateSettings({ volume: newVolume });

      expect(stopSpy).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(engine["masterGain"]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(newVolume, expect.any(Number));
      expect(engine["currentSettings"]?.volume).toBe(newVolume);

      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

    it("should update mix level smoothly without restart", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      const newMixLevel = 0.6;
      engine.updateSettings({ mixLevel: newMixLevel });

      expect(stopSpy).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(engine["carrierGain"]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(newMixLevel, expect.any(Number));
      expect(engine["currentSettings"]?.mixLevel).toBe(newMixLevel);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

    it("should update noise level smoothly without restart if noise is active", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      const newNoiseLevel = 0.2;
      // Ensure noise was active initially
      expect(initialSettings.noiseType).not.toBe("none");
      expect(initialSettings.noiseLevel).toBeGreaterThan(0);

      engine.updateSettings({ noiseLevel: newNoiseLevel });

      expect(stopSpy).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(engine["noiseGain"]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(newNoiseLevel, expect.any(Number));
      expect(engine["currentSettings"]?.noiseLevel).toBe(newNoiseLevel);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

     it("should NOT update noise level smoothly if noise type is 'none'", () => {
      const settingsWithNoNoise = { ...initialSettings, noiseType: "none" as const, noiseLevel: 0 };
      engine.play(settingsWithNoNoise); // Restart with no noise

      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      const gainMock = engine["noiseGain"]?.gain.linearRampToValueAtTime;
      (gainMock as Mock)?.mockClear(); // Clear previous calls from play()

      engine.updateSettings({ noiseLevel: 0.3 }); // Try to update level

      expect(stopSpy).not.toHaveBeenCalled(); // No restart expected here (only level changed)
      expect(playSpy).not.toHaveBeenCalled();
      expect(gainMock).not.toHaveBeenCalled(); // Ramp should not be called
      expect(engine["currentSettings"]?.noiseLevel).toBe(0.3); // Setting is stored but not applied via ramp

      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

    it("should update active aModDepth smoothly without restart", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      // Ensure aMod was active initially
      expect(initialSettings.aModDepth).toBeGreaterThan(0);
      const aModGainMock = engine["aModGain"];
      const aModDepthGainMock = engine["aModDepthGain"];
      expect(aModGainMock).toBeDefined();
      expect(aModDepthGainMock).toBeDefined();

      const newDepth = 0.8;
      engine.updateSettings({ aModDepth: newDepth });

      expect(stopSpy).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(aModGainMock?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1.0 - newDepth / 2, expect.any(Number));
      expect(aModDepthGainMock?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(newDepth / 2, expect.any(Number));
      expect(engine["currentSettings"]?.aModDepth).toBe(newDepth);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

     it("should update active stereoDepth smoothly without restart", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      expect(initialSettings.stereoDepth).toBeGreaterThan(0);
      const stereoDepthGainMock = engine["stereoDepthGain"];
      expect(stereoDepthGainMock).toBeDefined();

      const newDepth = 0.9;
      engine.updateSettings({ stereoDepth: newDepth });

      expect(stopSpy).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(stereoDepthGainMock?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(newDepth, expect.any(Number));
      expect(engine["currentSettings"]?.stereoDepth).toBe(newDepth);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

     it("should update active fModDepth smoothly without restart", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      expect(initialSettings.fModDepth).toBeGreaterThan(0);
      const fModDepthGainMock = engine["fModDepthGain"];
      expect(fModDepthGainMock).toBeDefined();

      const newDepth = 0.7;
      engine.updateSettings({ fModDepth: newDepth });

      expect(stopSpy).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
      expect(fModDepthGainMock?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(newDepth * 10, expect.any(Number)); // Check scaled value
      expect(engine["currentSettings"]?.fModDepth).toBe(newDepth);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

    // --- Tests for Restart Cases --- 

    it("should restart when updating carrierFrequency", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      const newFreq = 880;
      engine.updateSettings({ carrierFrequency: newFreq });

      // Should have called stop() within play(), then play() again within updateSettings
      // Because play calls stop, stopSpy gets called first internally by the second play call.
      // Then the second play call itself is made.
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledTimes(1);
      // play() would update currentSettings internally on restart
      // expect(engine["currentSettings"]?.carrierFrequency).toBe(newFreq); // This check happens inside the mocked play

      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

    it("should restart when updating beatFrequency", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      engine.updateSettings({ beatFrequency: 15 });
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledTimes(1);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

    it("should restart when updating binauralIntensity", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      engine.updateSettings({ binauralIntensity: 0.5 });
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledTimes(1);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

    it("should restart when updating noiseType", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      engine.updateSettings({ noiseType: "pink" });
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledTimes(1);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

     it("should restart when disabling aMod (aModDepth to 0)", () => {
      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      expect(initialSettings.aModDepth).toBeGreaterThan(0);
      engine.updateSettings({ aModDepth: 0 });
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledTimes(1);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

     it("should restart when enabling aMod (aModDepth from 0)", () => {
      const settingsWithNoAMod = { ...initialSettings, aModDepth: 0 };
      engine.play(settingsWithNoAMod);

      // Clear mocks called during the setup play
      vi.clearAllMocks(); 

      const playSpy = vi.spyOn(engine, 'play');
      const stopSpy = vi.spyOn(engine, 'stop');
      engine.updateSettings({ aModDepth: 0.5 }); // Enable it

      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(playSpy).toHaveBeenCalledTimes(1);
      playSpy.mockRestore();
      stopSpy.mockRestore();
    });

     // Similar tests for stereoDepth and fModDepth enabling/disabling...
     it("should restart when disabling stereo panning (stereoDepth to 0)", () => {
        const playSpy = vi.spyOn(engine, 'play');
        const stopSpy = vi.spyOn(engine, 'stop');
        expect(initialSettings.stereoDepth).toBeGreaterThan(0);
        engine.updateSettings({ stereoDepth: 0 });
        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(playSpy).toHaveBeenCalledTimes(1);
        playSpy.mockRestore();
        stopSpy.mockRestore();
    });

     it("should restart when enabling stereo panning (stereoDepth from 0)", () => {
        const settingsWithNoStereo = { ...initialSettings, stereoDepth: 0 };
        engine.play(settingsWithNoStereo);
        vi.clearAllMocks();

        const playSpy = vi.spyOn(engine, 'play');
        const stopSpy = vi.spyOn(engine, 'stop');
        engine.updateSettings({ stereoDepth: 0.5 });
        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(playSpy).toHaveBeenCalledTimes(1);
        playSpy.mockRestore();
        stopSpy.mockRestore();
    });

  });

  describe("cleanup", () => {
    it("should clean up all resources including AudioContext", async () => {
      engine.initialize();
      engine.play(initialSettings);
      const stopSpy = vi.spyOn(engine, 'stop');
      const closeSpy = vi.spyOn(engine["audioContext"]!, 'close');

      await engine.cleanup();

      expect(stopSpy).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalled();
      expect(engine["audioContext"]).toBeNull();
      expect(engine["masterGain"]).toBeNull();
      expect(engine["carrierGain"]).toBeNull();
      expect(engine["leftGain"]).toBeNull();
      expect(engine["rightGain"]).toBeNull();
      expect(engine["noiseGain"]).toBeNull();
      expect(engine["isPlaying"]).toBe(false);
      expect(engine["currentSettings"]).toBeNull();
      // Check other nodes are null too
      expect(engine["oscillator"]).toBeNull();
      expect(engine["leftOscillator"]).toBeNull();
      expect(engine["rightOscillator"]).toBeNull();
      expect(engine["noiseNode"]).toBeNull();
    });
  });

   describe("deprecated setVolume", () => {
     it("should call updateSettings when playing", () => {
        engine.initialize();
        engine.play(initialSettings);
        const updateSettingsSpy = vi.spyOn(engine, 'updateSettings');
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        engine.setVolume(0.2);

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("setVolume is deprecated"));
        expect(updateSettingsSpy).toHaveBeenCalledWith({ volume: 0.2 });

        updateSettingsSpy.mockRestore();
        consoleWarnSpy.mockRestore();
     });

      it("should set value directly using setValueAtTime when not playing", () => {
        engine.initialize(); // Initialize but don't play
        const updateSettingsSpy = vi.spyOn(engine, 'updateSettings');
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        engine.setVolume(0.3);

        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("setVolume is deprecated"));
        expect(updateSettingsSpy).not.toHaveBeenCalled();
        expect(engine["masterGain"]?.gain.setValueAtTime).toHaveBeenCalledWith(0.3, expect.any(Number));

        updateSettingsSpy.mockRestore();
        consoleWarnSpy.mockRestore();
     });
   });

});