# wave-generator Plan

## Project Overview

The `wave-generator` is an advanced binaural sound generator web application built as a brainwave entrainment tool. It leverages the Web Audio API to generate specific audio frequencies that can help users achieve various mental states such as relaxation, focus, and deep sleep. The app will be built using modern web technologies including Bun, Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui components.

## Technical Architecture

### Core Technologies

- **TypeScript**: For type safety and better developer experience
- **Bun**: JavaScript/TypeScript runtime and package manager
- **Next.js 15**: React framework with App Router
- **React 19**: UI library with React Compiler
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **Web Audio API**: Core API for audio processing and generation
- **Vitest**: Testing framework

### Application Structure

```
wave-generator/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage (WaveGenerator page)
├── components/               # UI components
│   ├── ui/                   # shadcn/ui components
│   ├── wave-generator.tsx    # Main WaveGenerator component
│   └── ...                   # Other custom components
├── lib/                      # Shared utilities
│   ├── audio/                # Audio generation logic
│   ├── presets/              # Preset configurations
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── tests/                    # Tests
└── package.json              # Dependencies and scripts
```

## Core Features Implementation

### 1. Audio Engine

The heart of the application is the audio engine that generates binaural beats and other brainwave entrainment effects using various modulation techniques. This will be implemented using the Web Audio API.

- **Audio Context Management**: Creating and managing audio contexts
- **Oscillator Management**: Generating sine waves with precise frequencies
- **Multiple Modulation Techniques**:
  - **Amplitude Modulation (a-mod)**: Creating isochronic tones by modulating volume
  - **Binaural Beats**: Playing slightly different frequencies in each ear
  - **Stereo/Bilateral Modulation**: Panning sound between left and right channels
  - **Frequency Modulation (f-mod)**: Varying the carrier frequency at the brainwave rate
- **Volume Control**: Managing the output volume
- **Background Noise**: Generating and mixing different types of noise (white, pink, brown)
- **Mix Level Control**: Balancing between carrier tones and noise

### 2. User Interface

The user interface will be intuitive, responsive, and inspired by Brainaural's layout, allowing users to control various aspects of the sound generation.

- **Brainwave Frequency Control**: Slider to set the target brainwave frequency (delta, theta, alpha, beta, gamma ranges)
- **Carrier Frequency Control**: Setting the base frequency of the sound
- **Modulation Controls**: Separate sliders for each modulation type (a-mod, binaural, stereo, f-mod)
- **Noise Controls**: Adjusting noise type and level
- **Mix Level Control**: Balancing different audio elements
- **Preset Selection**: UI for selecting, saving, and managing presets
- **Visualization**: Visual representation of the sound waves
- **Responsive Design**: Adapting the UI to different screen sizes
- **Dark/Light Mode**: Theme switching capabilities

### 3. Preset System

Presets will allow users to quickly access sound configurations for specific purposes.

- **Built-in Presets**: Pre-configured settings for common use cases (relaxation, focus, sleep, etc.)
- **Custom Presets**: Ability to save user-created configurations
- **Preset Management**: UI for organizing, editing, and deleting presets
- **Preset Sharing**: Functionality to share presets via links (future feature)

### 4. Export Functionality

Future feature to allow users to download their custom sounds as WAV files.

- **Audio Recording**: Capturing the generated audio
- **WAV File Generation**: Converting the captured audio to WAV format
- **Download Interface**: UI for initiating and managing downloads

## Development Phases

### Phase 1: Foundation (Completed)

- Set up the Next.js project with Bun
- Implement basic UI components using Tailwind and shadcn/ui
- Create the core audio engine with basic binaural beat generation

### Phase 2: Multiple Modulation Techniques

- Enhance the audio engine to support all modulation techniques:
  - Implement amplitude modulation (a-mod) for isochronic tones
  - Improve binaural beat generation with better intensity control
  - Add stereo/bilateral modulation for panning between channels
  - Implement frequency modulation (f-mod) to vary carrier frequency
- Implement background noise generation (white, pink, brown) and mixing
- Update the UI with sliders for all modulation parameters
- Create a more Brainaural-like layout with grouped controls
- Implement a basic preset system with presets for various mental states

### Phase 3: Preset System and Visualization

- Implement the preset system with built-in presets for various mental states
- Add user-saved presets functionality
- Develop basic visualization for the audio
- Refine the UI based on user feedback

### Phase 4: Advanced Features

- Implement audio export to WAV
- Add analytics to track usage patterns
- Develop preset sharing functionality
- Create mobile-responsive design optimizations

## Example Implementations

### 1. Enhanced Audio Engine with Multiple Modulation Techniques

```typescript
/**
 * Core audio engine for generating brainwave entrainment sounds
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  // Modulation nodes
  private aModOscillator: OscillatorNode | null = null;
  private aModGain: GainNode | null = null;
  private stereoPanner: StereoPannerNode | null = null;
  private fModOscillator: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  
  private isPlaying: boolean = false;
  
  // Modulation parameters
  private aModDepth: number = 0; // 0-1
  private binauralIntensity: number = 1; // 0-1
  private stereoDepth: number = 0; // 0-1
  private fModDepth: number = 0; // 0-1
  private noiseLevel: number = 0; // 0-1
  private mixLevel: number = 0.5; // 0-1

  /**
   * Initialize the audio context and nodes
   */
  public initialize(): void {
    this.audioContext = new AudioContext();
    
    // Create main volume control
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    
    // Create stereo channel gains
    this.leftGain = this.audioContext.createGain();
    this.rightGain = this.audioContext.createGain();
    
    // Create noise gain
    this.noiseGain = this.audioContext.createGain();
    this.noiseGain.connect(this.masterGain);
  }

  /**
   * Start playing with current settings
   * @param settings - The complete modulation settings object
   */
  public play(settings: ModulationSettings): void {
    if (!this.audioContext) {
      this.initialize();
    }

    if (this.isPlaying) {
      this.stop();
    }
    
    // Apply settings
    this.aModDepth = settings.aModDepth;
    this.binauralIntensity = settings.binauralIntensity;
    this.stereoDepth = settings.stereoDepth;
    this.fModDepth = settings.fModDepth;
    this.noiseLevel = settings.noiseLevel;
    this.mixLevel = settings.mixLevel;
    this.masterGain!.gain.value = settings.volume;
    
    // Setup audio generation based on settings
    if (settings.aModDepth > 0) {
      this.setupAmplitudeModulation(settings.aModDepth, settings.beatFrequency);
    }
    
    if (settings.binauralIntensity > 0) {
      this.setupBinauralBeats(settings.carrierFrequency, settings.beatFrequency, settings.binauralIntensity);
    }
    
    if (settings.stereoDepth > 0) {
      this.setupStereoPanning(settings.stereoDepth, settings.beatFrequency);
    }
    
    if (settings.fModDepth > 0) {
      this.setupFrequencyModulation(settings.fModDepth, settings.beatFrequency, settings.carrierFrequency);
    }
    
    if (settings.noiseType !== "none" && settings.noiseLevel > 0) {
      this.generateNoise(settings.noiseType, settings.noiseLevel);
    }
    
    this.isPlaying = true;
  }
  
  /**
   * Setup amplitude modulation (a-mod)
   * @param depth - Modulation depth (0-1)
   * @param frequency - Modulation frequency in Hz
   */
  private setupAmplitudeModulation(depth: number, frequency: number): void {
    // Create LFO for amplitude modulation
    this.aModOscillator = this.audioContext!.createOscillator();
    this.aModOscillator.frequency.value = frequency;
    
    // Create gain node for the modulation
    this.aModGain = this.audioContext!.createGain();
    
    // Connect the LFO to the gain's gain parameter
    this.aModOscillator.connect(this.aModGain.gain);
    
    // Configure the gain to oscillate around 0.5 based on depth
    this.aModGain.gain.value = 0.5;
    
    // Start the oscillator
    this.aModOscillator.start();
  }
  
  /**
   * Setup binaural beats
   * @param carrier - Carrier frequency in Hz
   * @param beatFreq - Beat frequency in Hz
   * @param intensity - Intensity of the effect (0-1)
   */
  private setupBinauralBeats(carrier: number, beatFreq: number, intensity: number): void {
    // Implementation details...
  }
  
  /**
   * Setup stereo panning modulation
   * @param depth - Depth of stereo effect (0-1)
   * @param frequency - Panning frequency in Hz
   */
  private setupStereoPanning(depth: number, frequency: number): void {
    // Implementation details...
  }
  
  /**
   * Setup frequency modulation (f-mod)
   * @param depth - Depth of frequency modulation (0-1)
   * @param modFreq - Modulation frequency in Hz
   * @param carrier - Carrier frequency in Hz
   */
  private setupFrequencyModulation(depth: number, modFreq: number, carrier: number): void {
    // Implementation details...
  }
  
  /**
   * Generate and play noise
   * @param type - Type of noise (white, pink, brown)
   * @param level - Volume level (0-1)
   */
  private generateNoise(type: NoiseType, level: number): void {
    // Implementation details...
  }

  /**
   * Stop playing audio
   */
  public stop(): void {
    if (!this.isPlaying) return;

    // Stop and disconnect all nodes
    this.oscillator?.stop();
    this.aModOscillator?.stop();
    this.noiseNode?.stop();
    this.fModOscillator?.stop();
    
    // Reset node references
    this.oscillator = null;
    this.aModOscillator = null;
    this.aModGain = null;
    this.stereoPanner = null;
    this.fModOscillator = null;
    this.noiseNode = null;
    
    this.isPlaying = false;
  }

  // Other methods (setters, cleanup, etc.)
}
```

### 2. Updated Types for Modulation Settings

```typescript
/**
 * Audio settings with all modulation parameters
 */
export interface ModulationSettings {
  carrierFrequency: number;     // Base tone frequency (Hz)
  beatFrequency: number;        // Target entrainment frequency (Hz)
  waveType: WaveType;           // Oscillator wave type
  volume: number;               // Master volume (0-1)
  aModDepth: number;            // Amplitude modulation depth (0-1)
  binauralIntensity: number;    // Binaural beat intensity (0-1)
  stereoDepth: number;          // Stereo panning depth (0-1)
  fModDepth: number;            // Frequency modulation depth (0-1)
  noiseType: NoiseType;         // Type of background noise
  noiseLevel: number;           // Level of noise (0-1)
  mixLevel: number;             // Balance between carrier and effects (0-1)
}

export type NoiseType = "white" | "pink" | "brown" | "none";

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  settings: ModulationSettings;
}

export type PresetCategory = 
  | "relaxation" 
  | "focus" 
  | "meditation" 
  | "sleep" 
  | "custom";
```

### 3. Noise Generator Implementation

```typescript
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
    // Implementation for pink noise generation
    // Uses filtering or a specific algorithm to create pink noise
    // with -3dB/octave spectrum
  }
  
  /**
   * Generate brown noise (deeper than pink noise)
   * @param audioContext - The audio context
   * @param duration - Duration in seconds
   * @returns An AudioBuffer containing brown noise
   */
  public static generateBrownNoise(audioContext: AudioContext, duration: number = 2): AudioBuffer {
    // Implementation for brown noise generation
    // Uses filtering or a specific algorithm to create brown noise
    // with -6dB/octave spectrum
  }
}
```

## Quality Assurance

### Testing Strategy

- Unit tests for audio engine and core functionalities
- Integration tests for the preset system
- End-to-end tests for key user flows
- Cross-browser testing for compatibility

### Performance Considerations

- Efficient audio generation to minimize CPU usage
- Optimized rendering with React Compiler
- Lazy loading of secondary components
- Optimized bundle size

### Accessibility

- Proper labeling of all controls
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Deployment Strategy

- CI/CD pipeline with GitHub Actions
- Deployment to Vercel or similar platform
- Analytics integration for usage metrics
- Error tracking for production issues

## Future Expansion Ideas

Beyond the already mentioned future features (custom presets, sharing, WAV export), here are additional ideas:

- **Scheduled Sessions**: Allow users to set up timed sessions
- **Progressive Entrainment**: Gradually change frequencies over time
- **Multi-User Support**: Accounts, profiles, and preset libraries
- **Mobile Apps**: Native apps for iOS and Android
- **Integration with Health Platforms**: Connect with systems like Apple Health or Google Fit
- **Guided Sessions**: Combine binaural beats with guided meditations
