/**
 * Utility for generating different types of noise
 */
export class NoiseGenerator {
  /**
   * Generate white noise
   * @param audioContext - The audio context
   * @param duration - Duration in seconds
   * @returns An AudioBuffer containing white noise
   */
  public static generateWhiteNoise(audioContext: AudioContext, duration: number = 2): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        // Random value between -1 and 1
        channelData[i] = Math.random() * 2 - 1;
      }
    }
    
    return buffer;
  }
  
  /**
   * Generate pink noise (equal energy per octave)
   * @param audioContext - The audio context
   * @param duration - Duration in seconds
   * @returns An AudioBuffer containing pink noise
   */
  public static generatePinkNoise(audioContext: AudioContext, duration: number = 2): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);
    
    // Pink noise generation using the Paul Kellet algorithm
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      // Filter coefficients
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < bufferSize; i++) {
        // White noise
        const white = Math.random() * 2 - 1;
        
        // Pink noise filter (Paul Kellet algorithm)
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        
        // Mix components for pink noise
        channelData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        channelData[i] *= 0.11; // Normalize to roughly -1..1
        
        b6 = white * 0.115926;
      }
    }
    
    return buffer;
  }
  
  /**
   * Generate brown noise (deeper than pink noise)
   * @param audioContext - The audio context
   * @param duration - Duration in seconds
   * @returns An AudioBuffer containing brown noise
   */
  public static generateBrownNoise(audioContext: AudioContext, duration: number = 2): AudioBuffer {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      let lastOut = 0.0;
      
      for (let i = 0; i < bufferSize; i++) {
        // White noise
        const white = Math.random() * 2 - 1;
        
        // Brown noise is integrated white noise
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        channelData[i] = lastOut * 3.5; // Normalize to roughly -1..1
      }
    }
    
    return buffer;
  }
  
  /**
   * Create and connect a noise source node of the specified type
   * @param audioContext - The audio context
   * @param type - The type of noise to generate
   * @param duration - Duration in seconds for the buffer
   * @returns An AudioBufferSourceNode playing the noise
   */
  public static createNoiseSource(
    audioContext: AudioContext,
    type: "white" | "pink" | "brown",
    duration: number = 2
  ): AudioBufferSourceNode {
    let buffer: AudioBuffer;
    
    switch (type) {
      case "white":
        buffer = this.generateWhiteNoise(audioContext, duration);
        break;
      case "pink":
        buffer = this.generatePinkNoise(audioContext, duration);
        break;
      case "brown":
        buffer = this.generateBrownNoise(audioContext, duration);
        break;
      default:
        buffer = this.generateWhiteNoise(audioContext, duration);
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    return source;
  }
} 