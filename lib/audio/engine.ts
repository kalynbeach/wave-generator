/**
 * Core audio engine for generating binaural beats
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  /**
   * Initialize the audio context and nodes
   */
  public initialize(): void {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  /**
   * Start playing a binaural beat
   * @param baseFrequency - The carrier frequency in Hz
   * @param beatFrequency - The frequency difference between ears in Hz
   * @param volume - Volume level from 0 to 1
   */
  public play(baseFrequency: number, beatFrequency: number, volume: number): void {
    if (!this.audioContext) {
      this.initialize();
    }

    if (this.isPlaying) {
      this.stop();
    }

    const leftFreq = baseFrequency;
    const rightFreq = baseFrequency + beatFrequency;

    // Create oscillators
    this.leftOscillator = this.audioContext!.createOscillator();
    this.rightOscillator = this.audioContext!.createOscillator();

    // Set frequencies
    this.leftOscillator.frequency.value = leftFreq;
    this.rightOscillator.frequency.value = rightFreq;

    // Create channel merger
    const merger = this.audioContext!.createChannelMerger(2);

    // Create gain node for volume control
    this.gainNode!.gain.value = volume;

    // Connect left oscillator to left channel
    this.leftOscillator.connect(merger, 0, 0);
    
    // Connect right oscillator to right channel
    this.rightOscillator.connect(merger, 0, 1);
    
    // Connect merger to gain node
    merger.connect(this.gainNode!);

    // Start oscillators
    this.leftOscillator.start();
    this.rightOscillator.start();
    this.isPlaying = true;
  }

  /**
   * Stop playing audio
   */
  public stop(): void {
    if (!this.isPlaying) return;

    this.leftOscillator?.stop();
    this.rightOscillator?.stop();
    this.leftOscillator = null;
    this.rightOscillator = null;
    this.isPlaying = false;
  }

  /**
   * Set the volume level
   * @param volume - Volume level from 0 to 1
   */
  public setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  /**
   * Cleanup resources when component unmounts
   */
  public cleanup(): void {
    this.stop();
    this.audioContext?.close();
    this.audioContext = null;
    this.gainNode = null;
  }
} 