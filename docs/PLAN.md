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

- Enhance the audio engine to support all modulation techniques (a-mod, binaural, stereo, f-mod)
- Implement background noise generation and mixing
- Update the UI with sliders for all modulation parameters
- Create a more Brainaural-like layout with grouped controls

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
  private stereoPanner: StereoPannerNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isPlaying: boolean = false;
  
  // Modulation parameters
  private aModDepth: number = 0.5; // 0-1
  private binauralBeatFreq: number = 7.83; // Hz
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
    
    // Create stereo panner
    this.stereoPanner = this.audioContext.createStereoPanner();
    
    // Create noise gain
    this.noiseGain = this.audioContext.createGain();
    this.noiseGain.connect(this.masterGain);
  }

  /**
   * Start playing with current settings
   * @param carrierFrequency - The carrier frequency in Hz
   * @param brainwaveFrequency - The target brainwave frequency in Hz
   * @param volume - Master volume level from 0 to 1
   */
  public play(carrierFrequency: number, brainwaveFrequency: number, volume: number): void {
    if (!this.audioContext) {
      this.initialize();
    }

    if (this.isPlaying) {
      this.stop();
    }
    
    // Set parameters
    this.binauralBeatFreq = brainwaveFrequency;
    this.masterGain!.gain.value = volume;
    
    // Create and configure oscillator
    this.oscillator = this.audioContext!.createOscillator();
    this.oscillator.frequency.value = carrierFrequency;
    
    // Configure stereo output
    const merger = this.audioContext!.createChannelMerger(2);
    
    // Setup channel routing
    if (this.aModDepth > 0) {
      // Setup amplitude modulation
      this.setupAmplitudeModulation(brainwaveFrequency);
    }
    
    if (this.binauralBeatFreq > 0) {
      // Setup binaural beats
      this.setupBinauralBeats(carrierFrequency, brainwaveFrequency);
    }
    
    if (this.stereoDepth > 0) {
      // Setup stereo panning modulation
      this.setupStereoPanning(brainwaveFrequency);
    }
    
    if (this.fModDepth > 0) {
      // Setup frequency modulation
      this.setupFrequencyModulation(carrierFrequency, brainwaveFrequency);
    }
    
    if (this.noiseLevel > 0) {
      // Generate and play noise
      this.generateNoise();
    }
    
    // Connect oscillator to proper outputs based on modulation types
    // ... implementation details ...
    
    // Start oscillator
    this.oscillator.start();
    this.isPlaying = true;
  }
  
  /**
   * Setup amplitude modulation (a-mod)
   */
  private setupAmplitudeModulation(frequency: number): void {
    // Implementation for amplitude modulation
    // Creates a gain node with periodic gain changes at the brainwave frequency
  }
  
  /**
   * Setup binaural beats
   */
  private setupBinauralBeats(carrier: number, beatFreq: number): void {
    // Implementation for binaural beats
    // Creates two oscillators with frequency difference equal to beatFreq
  }
  
  /**
   * Setup stereo panning modulation
   */
  private setupStereoPanning(frequency: number): void {
    // Implementation for stereo panning
    // Creates a StereoPannerNode with values oscillating at the brainwave frequency
  }
  
  /**
   * Setup frequency modulation
   */
  private setupFrequencyModulation(carrier: number, modFreq: number): void {
    // Implementation for frequency modulation
    // Modulates the oscillator's frequency at the brainwave rate
  }
  
  /**
   * Generate noise (white, pink, or brown)
   */
  private generateNoise(): void {
    // Implementation for noise generation
    // Creates an audio buffer with the appropriate noise spectrum
  }

  /**
   * Stop playing audio
   */
  public stop(): void {
    if (!this.isPlaying) return;

    this.oscillator?.stop();
    this.noiseSource?.stop();
    this.oscillator = null;
    this.noiseSource = null;
    this.isPlaying = false;
  }

  /**
   * Set amplitude modulation depth
   */
  public setAModDepth(depth: number): void {
    this.aModDepth = depth;
    // Update if playing
  }
  
  /**
   * Set binaural beat intensity
   */
  public setBinauralIntensity(intensity: number): void {
    // Update binaural intensity if playing
  }
  
  /**
   * Set stereo panning depth
   */
  public setStereoDepth(depth: number): void {
    this.stereoDepth = depth;
    // Update if playing
  }
  
  /**
   * Set frequency modulation depth
   */
  public setFModDepth(depth: number): void {
    this.fModDepth = depth;
    // Update if playing
  }
  
  /**
   * Set noise level
   */
  public setNoiseLevel(level: number): void {
    this.noiseLevel = level;
    if (this.noiseGain) {
      this.noiseGain.gain.value = level;
    }
  }
  
  /**
   * Set mix level between carrier and effects
   */
  public setMixLevel(level: number): void {
    this.mixLevel = level;
    // Update balance between carrier and effects
  }

  /**
   * Set master volume
   */
  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
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
    this.stereoPanner = null;
    this.noiseGain = null;
  }
}
```

### 2. Updated Types for Modulation Settings

```typescript
/**
 * Audio settings with all modulation parameters
 */
export interface ModulationSettings {
  brainwaveFrequency: number;   // Target entrainment frequency (Hz)
  carrierFrequency: number;     // Base tone frequency (Hz)
  aModDepth: number;            // Amplitude modulation (0-1)
  binauralIntensity: number;    // Binaural beat intensity (0-1)
  stereoDepth: number;          // Stereo panning depth (0-1)
  fModDepth: number;            // Frequency modulation depth (0-1)
  noiseType: NoiseType;         // Type of background noise
  noiseLevel: number;           // Level of noise (0-1)
  mixLevel: number;             // Balance between carrier and effects (0-1)
  volume: number;               // Master volume (0-1)
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
