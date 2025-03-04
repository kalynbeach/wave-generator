import { ModulationSettings, NoiseType } from "../types/audio";
import { NoiseGenerator } from "./noise";

/**
 * Core audio engine for generating binaural beats and other brainwave entrainment effects
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  
  // Oscillators
  private oscillator: OscillatorNode | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  
  // Gain nodes
  private masterGain: GainNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  private carrierGain: GainNode | null = null;
  
  // Modulation nodes
  private aModOscillator: OscillatorNode | null = null;
  private aModGain: GainNode | null = null;
  private stereoPanner: StereoPannerNode | null = null;
  private stereoLFO: OscillatorNode | null = null;
  private fModOscillator: OscillatorNode | null = null;
  
  // Noise nodes
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  
  // Status
  private isPlaying: boolean = false;
  
  // Current settings
  private currentSettings: ModulationSettings | null = null;
  
  // Connection tracking (to help with reconnecting nodes)
  private leftChannelDestination: AudioNode | null = null;
  private rightChannelDestination: AudioNode | null = null;
  private mainOutputDestination: AudioNode | null = null;

  /**
   * Initialize the audio context and nodes
   */
  public initialize(): void {
    this.audioContext = new AudioContext();
    
    // Create main volume control
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    
    // Create carrier gain for mix level control
    this.carrierGain = this.audioContext.createGain();
    this.carrierGain.connect(this.masterGain);
    
    // Create stereo channel gains
    this.leftGain = this.audioContext.createGain();
    this.rightGain = this.audioContext.createGain();
    
    // Create noise gain
    this.noiseGain = this.audioContext.createGain();
    this.noiseGain.connect(this.masterGain);
  }

  /**
   * Start playing a sound with the specified settings
   * @param settings - The complete modulation settings
   */
  public play(settings: ModulationSettings): void {
    if (!this.audioContext) {
      this.initialize();
    }

    if (this.isPlaying) {
      this.stop();
    }
    
    // Store the current settings
    this.currentSettings = { ...settings };
    
    // Set master volume
    this.masterGain!.gain.value = settings.volume;
    
    // Set up carrier/mix balance
    this.carrierGain!.gain.value = settings.mixLevel;
    if (this.noiseGain) {
      this.noiseGain.gain.value = settings.noiseLevel;
    }
    
    // Create merger for stereo output
    const merger = this.audioContext!.createChannelMerger(2);
    merger.connect(this.carrierGain!);
    
    // Set up different modulation techniques based on settings
    
    // 1. Binaural beats (core technique)
    if (settings.binauralIntensity > 0) {
      this.setupBinauralBeats(
        settings.carrierFrequency, 
        settings.beatFrequency,
        settings.binauralIntensity,
        merger
      );
    } else {
      // If not using binaural beats, still need a basic carrier oscillator
      this.setupBasicOscillator(settings.carrierFrequency, merger);
    }
    
    // 2. Amplitude Modulation (a-mod) for isochronic tones
    if (settings.aModDepth > 0) {
      this.setupAmplitudeModulation(settings.aModDepth, settings.beatFrequency);
    }
    
    // 3. Stereo/Bilateral Modulation
    if (settings.stereoDepth > 0) {
      this.setupStereoPanning(settings.stereoDepth, settings.beatFrequency);
    }
    
    // 4. Frequency Modulation (f-mod)
    if (settings.fModDepth > 0) {
      this.setupFrequencyModulation(
        settings.fModDepth,
        settings.beatFrequency
      );
    }
    
    // 5. Background Noise
    if (settings.noiseType !== "none" && settings.noiseLevel > 0) {
      this.setupNoise(settings.noiseType, settings.noiseLevel);
    }
    
    this.isPlaying = true;
  }
  
  /**
   * Set up a basic oscillator when not using binaural beats
   * @param frequency - The oscillator frequency
   * @param output - The node to connect the oscillator to
   */
  private setupBasicOscillator(
    frequency: number,
    output: AudioNode
  ): void {
    this.oscillator = this.audioContext!.createOscillator();
    this.oscillator.type = "sine"; // Always use sine waves for brainwave entrainment
    this.oscillator.frequency.value = frequency;
    this.oscillator.connect(output);
    
    // Store the output destination for later reconnections
    this.mainOutputDestination = output;
    
    this.oscillator.start();
  }
  
  /**
   * Set up binaural beats
   * @param carrierFreq - The carrier (base) frequency in Hz
   * @param beatFreq - The beat frequency in Hz (difference between ears)
   * @param intensity - Binaural beat intensity (0-1)
   * @param output - The node to connect the oscillators to
   */
  private setupBinauralBeats(
    carrierFreq: number,
    beatFreq: number,
    intensity: number,
    output: ChannelMergerNode
  ): void {
    // Create left and right oscillators with frequency difference
    this.leftOscillator = this.audioContext!.createOscillator();
    this.rightOscillator = this.audioContext!.createOscillator();
    
    // Set oscillator type to sine
    this.leftOscillator.type = "sine";
    this.rightOscillator.type = "sine";
    
    // Calculate left and right frequencies based on intensity
    // At full intensity, the difference equals beatFreq
    // At lower intensity, the difference is reduced proportionally
    const frequencyDifference = beatFreq * intensity;
    const leftFreq = carrierFreq - (frequencyDifference / 2);
    const rightFreq = carrierFreq + (frequencyDifference / 2);
    
    // Set frequencies
    this.leftOscillator.frequency.value = leftFreq;
    this.rightOscillator.frequency.value = rightFreq;
    
    // Create gain nodes for left and right channels if not already created
    if (!this.leftGain || !this.rightGain) {
      this.leftGain = this.audioContext!.createGain();
      this.rightGain = this.audioContext!.createGain();
    }
    
    // Connect oscillators to their respective gain nodes
    this.leftOscillator.connect(this.leftGain);
    this.rightOscillator.connect(this.rightGain);
    
    // Connect gain nodes to the appropriate channels in the merger
    this.leftGain.connect(output, 0, 0);  // Left channel
    this.rightGain.connect(output, 0, 1);  // Right channel
    
    // Store the output destinations for later reconnections
    this.leftChannelDestination = output;
    this.rightChannelDestination = output;
    
    // Start oscillators
    this.leftOscillator.start();
    this.rightOscillator.start();
  }
  
  /**
   * Set up amplitude modulation (a-mod) for isochronic tones
   * @param depth - Modulation depth (0-1)
   * @param frequency - Modulation frequency in Hz
   */
  private setupAmplitudeModulation(depth: number, frequency: number): void {
    // Create LFO (Low Frequency Oscillator) for amplitude modulation
    this.aModOscillator = this.audioContext!.createOscillator();
    this.aModOscillator.frequency.value = frequency;
    
    // Create gain node that will be modulated
    this.aModGain = this.audioContext!.createGain();
    this.aModGain.gain.value = 0.5; // Center point for oscillation
    
    // Connect the carrier signal chain through the modulated gain
    if (this.leftGain && this.rightGain && this.leftChannelDestination && this.rightChannelDestination) {
      // When using binaural beats, apply to both channels
      // Disconnect direct connections
      this.leftGain.disconnect();
      this.rightGain.disconnect();
      
      // Connect through the modulation
      this.leftGain.connect(this.aModGain);
      this.rightGain.connect(this.aModGain);
      
      // Connect to original destinations
      this.aModGain.connect(this.leftChannelDestination, 0, 0);
      this.aModGain.connect(this.rightChannelDestination, 0, 1);
    } else if (this.oscillator && this.mainOutputDestination) {
      // When using a single oscillator
      // Disconnect direct connection
      this.oscillator.disconnect();
      
      // Connect through the modulation
      this.oscillator.connect(this.aModGain);
      
      // Connect to original destination
      this.aModGain.connect(this.mainOutputDestination);
    }
    
    // Scale modulation depth and connect LFO to gain
    const scaledDepth = depth * 0.5; // Scale to prevent complete silence
    
    // Create a gain to scale the LFO output
    const modulationDepthGain = this.audioContext!.createGain();
    modulationDepthGain.gain.value = scaledDepth;
    
    // Connect the oscillator to the depth gain
    this.aModOscillator.connect(modulationDepthGain);
    
    // Connect the scaled output to the gain parameter
    modulationDepthGain.connect(this.aModGain.gain);
    
    // Start the LFO
    this.aModOscillator.start();
  }
  
  /**
   * Set up stereo panning modulation
   * @param depth - Depth of stereo effect (0-1)
   * @param frequency - Panning frequency in Hz
   */
  private setupStereoPanning(depth: number, frequency: number): void {
    // Create a stereo panner node
    this.stereoPanner = this.audioContext!.createStereoPanner();
    
    // Create an LFO for the panning
    this.stereoLFO = this.audioContext!.createOscillator();
    this.stereoLFO.frequency.value = frequency;
    
    // Scale the LFO output by the depth
    const panDepthGain = this.audioContext!.createGain();
    panDepthGain.gain.value = depth;
    
    // Connect the LFO to the depth gain
    this.stereoLFO.connect(panDepthGain);
    
    // Connect the scaled output to the pan parameter
    panDepthGain.connect(this.stereoPanner.pan);
    
    // If using a-mod, insert the panner after it
    // Otherwise, insert it in the main signal path
    if (this.aModGain && this.leftChannelDestination && this.rightChannelDestination) {
      // Disconnect a-mod's outputs
      this.aModGain.disconnect();
      
      // Connect through the panner
      this.aModGain.connect(this.stereoPanner);
      
      // Connect to original destinations
      this.stereoPanner.connect(this.leftChannelDestination, 0, 0);
      this.stereoPanner.connect(this.rightChannelDestination, 0, 1);
    } else if (this.leftGain && this.rightGain && this.leftChannelDestination && this.rightChannelDestination) {
      // When using binaural beats, apply after the left/right gains
      // Disconnect direct connections
      this.leftGain.disconnect();
      this.rightGain.disconnect();
      
      // Create a gain node to mix the channels
      const mixGain = this.audioContext!.createGain();
      
      // Connect both channels to the mix
      this.leftGain.connect(mixGain);
      this.rightGain.connect(mixGain);
      
      // Connect mix to panner
      mixGain.connect(this.stereoPanner);
      
      // Connect panner to both original destinations
      this.stereoPanner.connect(this.leftChannelDestination, 0, 0);
      this.stereoPanner.connect(this.rightChannelDestination, 0, 1);
    } else if (this.oscillator && this.mainOutputDestination) {
      // When using a single oscillator
      // Disconnect direct connection
      this.oscillator.disconnect();
      
      // Connect through the panner
      this.oscillator.connect(this.stereoPanner);
      
      // Connect to original destination
      this.stereoPanner.connect(this.mainOutputDestination);
    }
    
    // Start the LFO
    this.stereoLFO.start();
  }
  
  /**
   * Set up frequency modulation (f-mod)
   * @param depth - Depth of frequency modulation (0-1)
   * @param modFreq - Modulation frequency in Hz
   */
  private setupFrequencyModulation(depth: number, modFreq: number): void {
    this.fModOscillator = this.audioContext!.createOscillator();
    this.fModOscillator.frequency.value = modFreq;
    
    // Scale the depth (0.01 to 5 Hz deviation)
    const fModDepth = 0.01 + (depth * 5);
    
    // Create a gain to scale the LFO output
    const fModDepthGain = this.audioContext!.createGain();
    fModDepthGain.gain.value = fModDepth;
    
    // Connect the oscillator to the depth gain
    this.fModOscillator.connect(fModDepthGain);
    
    // Connect the scaled output to the frequency parameter of the oscillators
    if (this.leftOscillator && this.rightOscillator) {
      // For binaural beats, modulate both oscillators
      fModDepthGain.connect(this.leftOscillator.frequency);
      fModDepthGain.connect(this.rightOscillator.frequency);
    } else if (this.oscillator) {
      // For single oscillator
      fModDepthGain.connect(this.oscillator.frequency);
    }
    
    // Start the LFO
    this.fModOscillator.start();
  }
  
  /**
   * Set up background noise
   * @param type - Type of noise to generate
   * @param level - Volume level (0-1)
   */
  private setupNoise(type: NoiseType, level: number): void {
    if (type === "none") return;
    
    // Create noise node using the NoiseGenerator
    this.noiseNode = NoiseGenerator.createNoiseSource(this.audioContext!, type);
    
    // Connect to noise gain
    if (!this.noiseGain) {
      this.noiseGain = this.audioContext!.createGain();
      this.noiseGain.connect(this.masterGain!);
    }
    
    // Set noise level
    this.noiseGain.gain.value = level;
    
    // Connect and start the noise
    this.noiseNode.connect(this.noiseGain);
    this.noiseNode.start();
  }

  /**
   * Stop playing audio
   */
  public stop(): void {
    if (!this.isPlaying) return;

    // Stop all oscillators
    this.oscillator?.stop();
    this.leftOscillator?.stop();
    this.rightOscillator?.stop();
    this.aModOscillator?.stop();
    this.stereoLFO?.stop();
    this.fModOscillator?.stop();
    this.noiseNode?.stop();
    
    // Reset all nodes
    this.oscillator = null;
    this.leftOscillator = null;
    this.rightOscillator = null;
    this.aModOscillator = null;
    this.aModGain = null;
    this.stereoPanner = null;
    this.stereoLFO = null;
    this.fModOscillator = null;
    this.noiseNode = null;
    
    this.isPlaying = false;
  }

  /**
   * Update settings while playing
   * @param settings - The updated settings
   */
  public updateSettings(settings: Partial<ModulationSettings>): void {
    if (!this.isPlaying || !this.currentSettings) return;
    
    // Merge with current settings
    const updatedSettings = { ...this.currentSettings, ...settings };
    
    // If changes require a complete restart
    const requiresRestart = (
      'carrierFrequency' in settings ||
      'beatFrequency' in settings ||
      'waveType' in settings ||
      'aModDepth' in settings ||
      'binauralIntensity' in settings ||
      'stereoDepth' in settings ||
      'fModDepth' in settings ||
      'noiseType' in settings
    );
    
    if (requiresRestart) {
      // Stop and restart with new settings
      this.play(updatedSettings);
      return;
    }
    
    // Handle simple parameter changes that don't require restart
    
    // Volume change
    if ('volume' in settings && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        settings.volume!,
        this.audioContext!.currentTime + 0.05
      );
    }
    
    // Mix level change
    if ('mixLevel' in settings && this.carrierGain) {
      this.carrierGain.gain.linearRampToValueAtTime(
        settings.mixLevel!,
        this.audioContext!.currentTime + 0.05
      );
    }
    
    // Noise level change
    if ('noiseLevel' in settings && this.noiseGain) {
      this.noiseGain.gain.linearRampToValueAtTime(
        settings.noiseLevel!,
        this.audioContext!.currentTime + 0.05
      );
    }
    
    // Update current settings
    this.currentSettings = updatedSettings;
  }

  /**
   * Set the volume level
   * @param volume - Volume level from 0 to 1
   */
  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        volume,
        this.audioContext!.currentTime + 0.05
      );
      
      // Update current settings
      if (this.currentSettings) {
        this.currentSettings.volume = volume;
      }
    }
  }

  /**
   * Cleanup resources when component unmounts
   */
  public cleanup(): void {
    this.stop();
    this.audioContext?.close();
    this.audioContext = null;
    this.masterGain = null;
    this.leftGain = null;
    this.rightGain = null;
    this.carrierGain = null;
    this.noiseGain = null;
    this.leftChannelDestination = null;
    this.rightChannelDestination = null;
    this.mainOutputDestination = null;
    this.currentSettings = null;
  }
} 