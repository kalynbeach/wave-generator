import type { ModulationSettings, NoiseType } from "@/lib/types/audio";
import { NoiseGenerator } from "@/lib/audio/noise";

/**
 * Core audio engine for generating binaural beats and other brainwave entrainment effects.
 * Manages the Web Audio API context, nodes, and connections to produce the desired sounds.
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;

  // Core Oscillators
  /** Main oscillator used when binauralIntensity is 0 */
  private oscillator: OscillatorNode | null = null;
  /** Left oscillator for binaural beats */
  private leftOscillator: OscillatorNode | null = null;
  /** Right oscillator for binaural beats */
  private rightOscillator: OscillatorNode | null = null;

  // Gain Nodes
  /** Master volume control */
  private masterGain: GainNode | null = null;
  /** Gain for the left binaural channel */
  private leftGain: GainNode | null = null;
  /** Gain for the right binaural channel */
  private rightGain: GainNode | null = null;
  /** Controls the mix level between the carrier tone/effects and the master output */
  private carrierGain: GainNode | null = null;
  /** Controls the volume of the background noise */
  private noiseGain: GainNode | null = null;

  // Modulation LFOs (Low Frequency Oscillators)
  /** LFO for Amplitude Modulation (a-mod) */
  private aModOscillator: OscillatorNode | null = null;
  /** LFO for Stereo Panning */
  private stereoLFO: OscillatorNode | null = null;
  /** LFO for Frequency Modulation (f-mod) */
  private fModOscillator: OscillatorNode | null = null;

  // Modulation Effect Nodes
  /** Gain node controlled by aModOscillator for amplitude modulation effect */
  private aModGain: GainNode | null = null;
  /** Gain node scaling the output of aModOscillator to control depth */
  private aModDepthGain: GainNode | null = null;
  /** StereoPanner node controlled by stereoLFO for panning effect */
  private stereoPanner: StereoPannerNode | null = null;
  /** Gain node scaling the output of stereoLFO to control panning depth */
  private stereoDepthGain: GainNode | null = null;
  /** Gain node scaling the output of fModOscillator to control f-mod depth */
  private fModDepthGain: GainNode | null = null;

  // Noise Nodes
  /** Source node for generating background noise */
  private noiseNode: AudioBufferSourceNode | null = null;

  // Status & Settings
  /** Flag indicating if audio is currently playing */
  private isPlaying: boolean = false;
  /** The currently active audio settings */
  private currentSettings: ModulationSettings | null = null;

  // Connection Tracking
  /** Destination node for the left channel output (typically the merger) */
  private leftChannelDestination: AudioNode | null = null;
  /** Destination node for the right channel output (typically the merger) */
  private rightChannelDestination: AudioNode | null = null;
  /** Destination node for the main oscillator output (when not binaural) */
  private mainOutputDestination: AudioNode | null = null;

  /** Safety ramp time for smooth parameter changes in seconds */
  private readonly RAMP_TIME = 0.05;

  /**
   * Initializes the audio context and essential nodes if not already done.
   * Creates the masterGain, carrierGain, channel gains, and noiseGain.
   * Connects masterGain to the audio destination.
   */
  public initialize(): void {
    if (this.audioContext) return; // Already initialized

    try {
      this.audioContext = new window.AudioContext();

      // Create main volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      // Create carrier gain for mix level control
      this.carrierGain = this.audioContext.createGain();
      this.carrierGain.connect(this.masterGain);

      // Create stereo channel gains (used for binaural setup)
      this.leftGain = this.audioContext.createGain();
      this.rightGain = this.audioContext.createGain();

      // Create noise gain
      this.noiseGain = this.audioContext.createGain();
      this.noiseGain.connect(this.masterGain);
    } catch (e) {
      console.error("Failed to initialize Web Audio Context:", e);
      this.audioContext = null; // Ensure state reflects failure
    }
  }

  /**
   * Starts playing audio with the specified settings.
   * If already playing, it stops the current audio first.
   * Sets up the audio graph based on the provided settings.
   * @param settings - The complete modulation settings for the sound.
   */
  public play(settings: ModulationSettings): void {
    this.initialize(); // Ensure context is ready
    if (!this.audioContext || !this.masterGain || !this.carrierGain || !this.noiseGain) {
      console.error("AudioEngine not properly initialized, cannot play.");
      return;
    }

    // Stop current playback before starting anew
    if (this.isPlaying) {
      this.stop();
    }

    // Store the current settings
    this.currentSettings = { ...settings };
    const now = this.audioContext.currentTime;

    // Set initial master volume and mix levels using setValueAtTime
    this.masterGain.gain.setValueAtTime(settings.volume, now);
    this.carrierGain.gain.setValueAtTime(settings.mixLevel, now);
    this.noiseGain.gain.setValueAtTime(settings.noiseLevel, now);

    // Create merger for stereo output - connects to carrierGain
    const merger = this.audioContext.createChannelMerger(2);
    merger.connect(this.carrierGain);

    // Setup main signal path (Binaural or Basic Oscillator)
    if (settings.binauralIntensity > 0) {
      this.setupBinauralBeats(
        settings.carrierFrequency,
        settings.beatFrequency,
        settings.binauralIntensity,
        merger // Output to merger
      );
      this.mainOutputDestination = null; // Not using the single oscillator path
    } else {
      this.setupBasicOscillator(
        settings.carrierFrequency,
        merger // Output to merger
      );
      this.leftChannelDestination = null; // Not using binaural path
      this.rightChannelDestination = null;
    }

    // Setup modulation effects, connecting them into the signal path dynamically
    let currentOutputNode: AudioNode = merger; // Start effects after the merger/oscillator output
    if (this.aModGain) { // If A-Mod is setup, it's the last node before merger
        currentOutputNode = this.aModGain;
    } else if (this.leftGain && this.rightGain) { // If Binaural setup, use gains as potential connection points
        // A-Mod setup handles reconnecting left/right Gain or oscillator
    } else if (this.oscillator) {
        currentOutputNode = this.oscillator;
    }


    // 2. Amplitude Modulation (a-mod) for isochronic tones
    if (settings.aModDepth > 0) {
      currentOutputNode = this.setupAmplitudeModulation(settings.aModDepth, settings.beatFrequency);
    }

    // 3. Stereo/Bilateral Modulation
    if (settings.stereoDepth > 0) {
      currentOutputNode = this.setupStereoPanning(settings.stereoDepth, settings.beatFrequency, currentOutputNode);
    }

    // Connect the final node in the chain (potentially after modulations) to the merger or carrierGain
    if (currentOutputNode !== merger && !(settings.binauralIntensity > 0)) {
      // If modulations were added to a basic oscillator, connect the last effect to the merger
      if(this.mainOutputDestination) {
        currentOutputNode.connect(this.mainOutputDestination);
      }
    } else if (currentOutputNode !== this.aModGain && settings.binauralIntensity > 0 && this.aModGain) {
       // If stereo panning was added *after* a-mod in a binaural setup
       if (this.leftChannelDestination && this.rightChannelDestination) {
         currentOutputNode.connect(this.leftChannelDestination, 0, 0);
         currentOutputNode.connect(this.rightChannelDestination, 0, 1);
       }
    }


    // 4. Frequency Modulation (f-mod) - Modulates oscillator frequency directly
    if (settings.fModDepth > 0) {
      this.setupFrequencyModulation(settings.fModDepth, settings.beatFrequency);
    }

    // 5. Background Noise - Connects directly to noiseGain -> masterGain
    if (settings.noiseType !== "none" && settings.noiseLevel > 0) {
      this.setupNoise(settings.noiseType, settings.noiseLevel);
    }

    this.isPlaying = true;
  }

  /**
   * Sets up a single basic oscillator when binaural intensity is zero.
   * @param frequency - The oscillator frequency in Hz.
   * @param output - The AudioNode to connect the oscillator to (typically the merger).
   */
  private setupBasicOscillator(frequency: number, output: AudioNode): void {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = "sine";
    this.oscillator.frequency.setValueAtTime(frequency, now);
    this.oscillator.connect(output);
    this.oscillator.start(now);

    // Store the output destination for potential reconnections by modulations
    this.mainOutputDestination = output;
  }

  /**
   * Sets up left and right oscillators for binaural beats.
   * @param carrierFreq - The carrier (base) frequency in Hz.
   * @param beatFreq - The beat frequency in Hz (difference between ears).
   * @param intensity - Binaural beat intensity (0-1), affects frequency difference.
   * @param output - The ChannelMergerNode to connect the left/right channels to.
   */
  private setupBinauralBeats(
    carrierFreq: number,
    beatFreq: number,
    intensity: number,
    output: ChannelMergerNode
  ): void {
    if (!this.audioContext || !this.leftGain || !this.rightGain) return;
    const now = this.audioContext.currentTime;

    // Create left and right oscillators
    this.leftOscillator = this.audioContext.createOscillator();
    this.rightOscillator = this.audioContext.createOscillator();
    this.leftOscillator.type = "sine";
    this.rightOscillator.type = "sine";

    // Calculate frequencies based on intensity
    const frequencyDifference = beatFreq * intensity;
    const leftFreq = carrierFreq - frequencyDifference / 2;
    const rightFreq = carrierFreq + frequencyDifference / 2;

    // Set frequencies
    this.leftOscillator.frequency.setValueAtTime(leftFreq, now);
    this.rightOscillator.frequency.setValueAtTime(rightFreq, now);

    // Ensure gain nodes are reset (if reused)
    this.leftGain.gain.setValueAtTime(1.0, now);
    this.rightGain.gain.setValueAtTime(1.0, now);

    // Connect oscillators -> gain nodes -> merger channels
    this.leftOscillator.connect(this.leftGain);
    this.rightOscillator.connect(this.rightGain);
    this.leftGain.connect(output, 0, 0); // Connect left gain to merger's channel 0
    this.rightGain.connect(output, 0, 1); // Connect right gain to merger's channel 1

    // Store destinations for potential reconnections by modulations
    this.leftChannelDestination = output;
    this.rightChannelDestination = output;

    // Start oscillators
    this.leftOscillator.start(now);
    this.rightOscillator.start(now);
  }

  /**
   * Sets up amplitude modulation (a-mod) effect.
   * Modulates the gain of the main signal path.
   * @param depth - Modulation depth (0-1).
   * @param frequency - Modulation frequency (beat frequency) in Hz.
   * @returns The last node in the A-Mod chain (aModGain).
   */
  private setupAmplitudeModulation(depth: number, frequency: number): GainNode {
    if (!this.audioContext) throw new Error("AudioContext not available");
    const now = this.audioContext.currentTime;

    // LFO for amplitude modulation
    this.aModOscillator = this.audioContext.createOscillator();
    this.aModOscillator.frequency.setValueAtTime(frequency, now);

    // Gain node controlled by the LFO
    this.aModGain = this.audioContext.createGain();
    // Set base gain for modulation: 1.0 means LFO oscillates around 1
    // Range becomes [1-depth, 1+depth], we want [1-depth, 1] for typical isochronic
    // Let's scale LFO output instead: LFO [-1, 1] * depth/2 + (1 - depth/2) => range [1-depth, 1]
    this.aModGain.gain.setValueAtTime(1.0 - depth / 2, now); // Center point adjusted based on depth

    // Gain node to scale LFO output (controls depth)
    this.aModDepthGain = this.audioContext.createGain();
    this.aModDepthGain.gain.setValueAtTime(depth / 2, now); // LFO controls range of size 'depth'

    // Connect LFO -> depth scaler -> target gain parameter
    this.aModOscillator.connect(this.aModDepthGain);
    this.aModDepthGain.connect(this.aModGain.gain);
    this.aModOscillator.start(now);

    // Reroute the main signal path through aModGain
    if (
      this.leftGain && this.rightGain &&
      this.leftChannelDestination && this.rightChannelDestination
    ) {
      // Binaural path: Disconnect gains from merger, connect through aModGain, then aModGain to merger
      this.leftGain.disconnect();
      this.rightGain.disconnect();
      this.leftGain.connect(this.aModGain);
      this.rightGain.connect(this.aModGain);
      this.aModGain.connect(this.leftChannelDestination, 0, 0);
      this.aModGain.connect(this.rightChannelDestination, 0, 1);
    } else if (this.oscillator && this.mainOutputDestination) {
      // Basic oscillator path: Disconnect oscillator from output, connect through aModGain, then aModGain to output
      this.oscillator.disconnect();
      this.oscillator.connect(this.aModGain);
      this.aModGain.connect(this.mainOutputDestination);
    }

    return this.aModGain;
  }

 /**
   * Sets up stereo panning modulation effect.
   * Modulates the pan parameter of a StereoPannerNode.
   * @param depth - Depth of stereo effect (0-1).
   * @param frequency - Panning frequency (beat frequency) in Hz.
   * @param inputNode - The node to connect *before* the panner (e.g., aModGain or the source gains/oscillator).
   * @returns The StereoPannerNode.
   */
  private setupStereoPanning(depth: number, frequency: number, inputNode: AudioNode): StereoPannerNode {
    if (!this.audioContext) throw new Error("AudioContext not available");
    const now = this.audioContext.currentTime;

    // Stereo panner node
    this.stereoPanner = this.audioContext.createStereoPanner();
    this.stereoPanner.pan.setValueAtTime(0, now); // Start centered

    // LFO for panning
    this.stereoLFO = this.audioContext.createOscillator();
    this.stereoLFO.frequency.setValueAtTime(frequency, now);

    // Gain node to scale LFO output (controls depth)
    this.stereoDepthGain = this.audioContext.createGain();
    this.stereoDepthGain.gain.setValueAtTime(depth, now); // LFO output is [-1, 1], scale by depth

    // Connect LFO -> depth scaler -> pan parameter
    this.stereoLFO.connect(this.stereoDepthGain);
    this.stereoDepthGain.connect(this.stereoPanner.pan);
    this.stereoLFO.start(now);

    // Reroute the signal path through the panner
    inputNode.disconnect(); // Disconnect the node that should feed into the panner
    inputNode.connect(this.stereoPanner);

    // Connect the panner to the final destination(s)
    if (this.leftChannelDestination && this.rightChannelDestination) {
        // If original destination was stereo (merger)
        this.stereoPanner.connect(this.leftChannelDestination, 0, 0);
        this.stereoPanner.connect(this.rightChannelDestination, 0, 1);
    } else if (this.mainOutputDestination) {
        // If original destination was mono (merger for basic oscillator)
        this.stereoPanner.connect(this.mainOutputDestination);
    }


    return this.stereoPanner;
  }

  /**
   * Sets up frequency modulation (f-mod) effect.
   * Modulates the frequency parameter of the main oscillator(s).
   * @param depth - Depth of frequency modulation (0-1), scaled to a practical range.
   * @param modFreq - Modulation frequency (beat frequency) in Hz.
   */
  private setupFrequencyModulation(depth: number, modFreq: number): void {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;

    // LFO for frequency modulation
    this.fModOscillator = this.audioContext.createOscillator();
    this.fModOscillator.frequency.setValueAtTime(modFreq, now);

    // Scale the depth (e.g., 0-1 maps to 0-10 Hz deviation)
    // Adjust the multiplier (10 here) based on desired max deviation
    const fModScaledDepth = depth * 10;

    // Gain node to scale LFO output
    this.fModDepthGain = this.audioContext.createGain();
    this.fModDepthGain.gain.setValueAtTime(fModScaledDepth, now);

    // Connect LFO -> depth scaler
    this.fModOscillator.connect(this.fModDepthGain);

    // Connect scaled output to the frequency parameter of the main oscillator(s)
    if (this.leftOscillator && this.rightOscillator) {
      this.fModDepthGain.connect(this.leftOscillator.frequency);
      this.fModDepthGain.connect(this.rightOscillator.frequency);
    } else if (this.oscillator) {
      this.fModDepthGain.connect(this.oscillator.frequency);
    }

    // Start the LFO
    this.fModOscillator.start(now);
  }

  /**
   * Sets up background noise generation.
   * @param type - Type of noise ("white", "pink", "brown").
   * @param level - Volume level of the noise (0-1).
   */
  private setupNoise(type: NoiseType, level: number): void {
    if (!this.audioContext || !this.noiseGain || type === "none") return;
    const now = this.audioContext.currentTime;

    // Stop existing noise if any
    this.noiseNode?.stop();
    this.noiseNode = null;

    // Create noise source
    this.noiseNode = NoiseGenerator.createNoiseSource(this.audioContext, type);

    // Set noise level via noiseGain
    this.noiseGain.gain.setValueAtTime(level, now);

    // Connect noise source -> noiseGain
    this.noiseNode.connect(this.noiseGain);
    this.noiseNode.start(now);
  }

  /**
   * Stops audio playback immediately.
   * Stops all oscillators and disconnects nodes to clean up the graph.
   * Resets internal state.
   */
  public stop(): void {
    if (!this.isPlaying || !this.audioContext) return;
    const now = this.audioContext.currentTime;

    try {
        // Stop all oscillators safely
        this.oscillator?.stop(now);
        this.leftOscillator?.stop(now);
        this.rightOscillator?.stop(now);
        this.aModOscillator?.stop(now);
        this.stereoLFO?.stop(now);
        this.fModOscillator?.stop(now);
        this.noiseNode?.stop(now);

        // Disconnect nodes to break the graph - helps prevent issues on restart
        // Disconnect modulation effects first
        this.aModDepthGain?.disconnect();
        this.stereoDepthGain?.disconnect();
        this.fModDepthGain?.disconnect();
        this.aModGain?.disconnect();
        this.stereoPanner?.disconnect();

        // Disconnect main signal path nodes
        this.leftGain?.disconnect();
        this.rightGain?.disconnect();
        this.oscillator?.disconnect();
        this.noiseNode?.disconnect();


    } catch (e) {
        console.warn("Error during node stopping/disconnecting:", e);
        // Attempt to continue cleanup even if some nodes fail
    }


    // Reset node references
    this.oscillator = null;
    this.leftOscillator = null;
    this.rightOscillator = null;
    this.aModOscillator = null;
    this.aModGain = null;
    this.aModDepthGain = null;
    this.stereoPanner = null;
    this.stereoLFO = null;
    this.stereoDepthGain = null;
    this.fModOscillator = null;
    this.fModDepthGain = null;
    this.noiseNode = null;
    // Keep gain nodes (master, carrier, noise, left/right) as they are reused

    // Reset connection tracking
    this.leftChannelDestination = null;
    this.rightChannelDestination = null;
    this.mainOutputDestination = null;

    this.isPlaying = false;
    // Don't reset currentSettings here, it's needed for comparison in updateSettings
  }

  /**
   * Updates audio settings while playing.
   * Applies changes smoothly using ramps where possible (volume, mix, noise level, active modulation depths).
   * Triggers a full restart (`stop` then `play`) if fundamental parameters change
   * (carrier/beat frequency, noise type, enabling/disabling modulations, binaural intensity).
   * @param settings - A partial object containing only the settings to update.
   */
  public updateSettings(settings: Partial<ModulationSettings>): void {
    if (!this.isPlaying || !this.currentSettings || !this.audioContext) return;
    const now = this.audioContext.currentTime;

    const oldSettings = { ...this.currentSettings };
    const newSettings = { ...this.currentSettings, ...settings };

    // Determine if a full restart is needed
    let requiresRestart = false;
    if (
      ("carrierFrequency" in settings && settings.carrierFrequency !== oldSettings.carrierFrequency) ||
      ("beatFrequency" in settings && settings.beatFrequency !== oldSettings.beatFrequency) ||
      ("binauralIntensity" in settings && settings.binauralIntensity !== oldSettings.binauralIntensity) ||
      ("noiseType" in settings && settings.noiseType !== oldSettings.noiseType) ||
      // Check if any modulation was turned on/off (depth changed to/from zero)
      ("aModDepth" in settings && (settings.aModDepth === 0) !== (oldSettings.aModDepth === 0)) ||
      ("stereoDepth" in settings && (settings.stereoDepth === 0) !== (oldSettings.stereoDepth === 0)) ||
      ("fModDepth" in settings && (settings.fModDepth === 0) !== (oldSettings.fModDepth === 0))
    ) {
      requiresRestart = true;
    }

    if (requiresRestart) {
      // Stop current playback and restart with the fully merged new settings
      this.play(newSettings);
      return; // Restart handles everything
    }

    // Apply smooth updates for parameters that allow it

    // Volume change
    if ("volume" in settings && settings.volume !== oldSettings.volume && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(settings.volume!, now + this.RAMP_TIME);
    }

    // Mix level change
    if ("mixLevel" in settings && settings.mixLevel !== oldSettings.mixLevel && this.carrierGain) {
      this.carrierGain.gain.linearRampToValueAtTime(settings.mixLevel!, now + this.RAMP_TIME);
    }

    // Noise level change (only if noise is active)
    if ("noiseLevel" in settings && settings.noiseLevel !== oldSettings.noiseLevel && this.noiseGain && oldSettings.noiseType !== 'none') {
      this.noiseGain.gain.linearRampToValueAtTime(settings.noiseLevel!, now + this.RAMP_TIME);
    }

    // Amplitude modulation depth change (only if already active)
    if ("aModDepth" in settings && settings.aModDepth !== oldSettings.aModDepth && this.aModGain && this.aModDepthGain && oldSettings.aModDepth > 0) {
        const newDepth = settings.aModDepth!;
        // Ramp both the base gain and the LFO scaler gain smoothly
        this.aModGain.gain.linearRampToValueAtTime(1.0 - newDepth / 2, now + this.RAMP_TIME);
        this.aModDepthGain.gain.linearRampToValueAtTime(newDepth / 2, now + this.RAMP_TIME);
    }

    // Stereo panning depth change (only if already active)
    if ("stereoDepth" in settings && settings.stereoDepth !== oldSettings.stereoDepth && this.stereoDepthGain && oldSettings.stereoDepth > 0) {
      this.stereoDepthGain.gain.linearRampToValueAtTime(settings.stereoDepth!, now + this.RAMP_TIME);
    }

    // Frequency modulation depth change (only if already active)
    if ("fModDepth" in settings && settings.fModDepth !== oldSettings.fModDepth && this.fModDepthGain && oldSettings.fModDepth > 0) {
      const fModScaledDepth = settings.fModDepth! * 10; // Use same scaling as in setup
      this.fModDepthGain.gain.linearRampToValueAtTime(fModScaledDepth, now + this.RAMP_TIME);
    }

    // Update the stored settings *after* applying changes
    this.currentSettings = newSettings;
  }


  /**
   * Sets the master volume level smoothly.
   * Deprecated: Prefer using updateSettings({ volume: value }) for consistency.
   * @param volume - Volume level from 0 to 1.
   */
  public setVolume(volume: number): void {
     console.warn("setVolume is deprecated. Use updateSettings({ volume: value }) instead.");
     if (this.isPlaying && this.currentSettings) {
       this.updateSettings({ volume });
     } else if (this.masterGain && this.audioContext) {
       // Fallback if not playing, just set directly (though less useful)
       this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
       if (this.currentSettings) {
           this.currentSettings.volume = volume;
       }
     }
  }

  /**
   * Cleans up all audio resources.
   * Stops playback, closes the AudioContext, and nullifies node references.
   * Should be called when the engine is no longer needed (e.g., component unmount).
   */
  public cleanup(): void {
    this.stop(); // Ensure all nodes are stopped and disconnected

    // Attempt to close the context
    if (this.audioContext) {
        if (this.audioContext.state !== "closed") {
            this.audioContext.close().catch(e => console.warn("Error closing AudioContext:", e));
        }
        this.audioContext = null;
    }


    // Nullify all references
    this.masterGain = null;
    this.leftGain = null;
    this.rightGain = null;
    this.carrierGain = null;
    this.noiseGain = null;
    this.leftChannelDestination = null;
    this.rightChannelDestination = null;
    this.mainOutputDestination = null;
    this.currentSettings = null;
    // Ensure all node references potentially created are nulled
     this.oscillator = null;
     this.leftOscillator = null;
     this.rightOscillator = null;
     this.aModOscillator = null;
     this.aModGain = null;
     this.aModDepthGain = null;
     this.stereoPanner = null;
     this.stereoLFO = null;
     this.stereoDepthGain = null;
     this.fModOscillator = null;
     this.fModDepthGain = null;
     this.noiseNode = null;
  }
}
