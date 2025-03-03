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

The heart of the application is the audio engine that generates binaural beats. This will be implemented using the Web Audio API.

- **Audio Context Management**: Creating and managing audio contexts
- **Oscillator Management**: Generating sine waves with precise frequencies
- **Binaural Beat Generation**: Creating beats by playing slightly different frequencies in each ear
- **Volume Control**: Managing the volume of the audio output
- **Wave Mixing**: Mixing different waveforms (sine, square, sawtooth, etc.)
- **Background Noise Generation**: Adding white, pink, or brown noise as a carrier

### 2. User Interface

The user interface will be intuitive and responsive, allowing users to control various aspects of the sound generation.

- **Main Control Panel**: Primary controls for frequency, wave type, and volume
- **Advanced Settings Panel**: More detailed controls for fine-tuning the sound
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

### Phase 1: Foundation

- Set up the Next.js project with Bun
- Implement basic UI components using Tailwind and shadcn/ui
- Create the core audio engine with basic binaural beat generation

### Phase 2: Core Features

- Implement the main control panel with essential settings
- Create the preset system with several built-in presets
- Develop basic visualization for the audio

### Phase 3: Enhanced Features

- Add advanced sound settings (wave mixing, noise generation, etc.)
- Implement user authentication for saving custom presets
- Create mobile-responsive design

### Phase 4: Future Features

- Develop preset sharing functionality
- Implement audio export to WAV
- Add analytics to track usage patterns

## Example Implementations

### 1. Basic Audio Engine Setup

```typescript
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
```

### 2. Main Controls Component

```tsx
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AudioEngine } from "@/lib/audio/engine";

/**
 * Main WaveGenerator component
 */
export default function WaveGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [beatFreq, setBeatFreq] = useState(7.83); // Schumann resonance
  const [volume, setVolume] = useState(0.5);
  
  const audioEngine = new AudioEngine();
  
  useEffect(() => {
    audioEngine.initialize();
    
    return () => {
      audioEngine.cleanup();
    };
  }, []);
  
  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
    } else {
      audioEngine.play(carrierFreq, beatFreq, volume);
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioEngine.setVolume(newVolume);
  };
  
  const handleCarrierChange = (value: number[]) => {
    setCarrierFreq(value[0]);
    if (isPlaying) {
      audioEngine.stop();
      audioEngine.play(value[0], beatFreq, volume);
    }
  };
  
  const handleBeatChange = (value: number[]) => {
    setBeatFreq(value[0]);
    if (isPlaying) {
      audioEngine.stop();
      audioEngine.play(carrierFreq, value[0], volume);
    }
  };
  
  return (
    <div className="p-6 bg-background rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Wave Generator</h2>
        <Button 
          variant={isPlaying ? "destructive" : "default"} 
          onClick={togglePlay}
        >
          {isPlaying ? "Stop" : "Play"}
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Carrier Frequency: {carrierFreq} Hz
          </label>
          <Slider 
            min={50} 
            max={500} 
            step={1} 
            value={[carrierFreq]} 
            onValueChange={handleCarrierChange} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Beat Frequency: {beatFreq} Hz
          </label>
          <Slider 
            min={0.5} 
            max={40} 
            step={0.1} 
            value={[beatFreq]} 
            onValueChange={handleBeatChange} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Volume: {Math.round(volume * 100)}%
          </label>
          <Slider 
            min={0} 
            max={1} 
            step={0.01} 
            value={[volume]} 
            onValueChange={handleVolumeChange} 
          />
        </div>
      </div>
    </div>
  );
}
```

### 3. Preset System Implementation

```typescript
/**
 * Preset type definition
 */
export interface Preset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  settings: {
    carrierFrequency: number;
    beatFrequency: number;
    waveType: WaveType;
    noiseLevel: number;
    noiseType: NoiseType;
    volume: number;
  };
}

export type PresetCategory = 
  | "relaxation" 
  | "focus" 
  | "meditation" 
  | "sleep" 
  | "custom";

export type WaveType = "sine" | "square" | "sawtooth" | "triangle";
export type NoiseType = "white" | "pink" | "brown" | "none";

/**
 * Preset service for managing presets
 */
export class PresetService {
  private static readonly STORAGE_KEY = "wave-generator-presets";
  
  /**
   * Get built-in presets
   */
  public static getBuiltInPresets(): Preset[] {
    return [
      {
        id: "deep-meditation",
        name: "Deep Meditation",
        description: "Theta waves for deep meditation",
        category: "meditation",
        settings: {
          carrierFrequency: 200,
          beatFrequency: 6,
          waveType: "sine",
          noiseLevel: 0.1,
          noiseType: "pink",
          volume: 0.5
        }
      },
      {
        id: "focus",
        name: "Enhanced Focus",
        description: "Beta waves for concentration and focus",
        category: "focus",
        settings: {
          carrierFrequency: 220,
          beatFrequency: 15,
          waveType: "sine",
          noiseLevel: 0,
          noiseType: "none",
          volume: 0.4
        }
      },
      {
        id: "deep-sleep",
        name: "Deep Sleep",
        description: "Delta waves for deep, restful sleep",
        category: "sleep",
        settings: {
          carrierFrequency: 180,
          beatFrequency: 2.5,
          waveType: "sine",
          noiseLevel: 0.2,
          noiseType: "brown",
          volume: 0.35
        }
      }
    ];
  }
  
  /**
   * Get user-saved presets
   */
  public static getUserPresets(): Preset[] {
    if (typeof window === "undefined") return [];
    
    const storedPresets = localStorage.getItem(this.STORAGE_KEY);
    
    if (!storedPresets) return [];
    
    try {
      return JSON.parse(storedPresets);
    } catch (error) {
      console.error("Failed to parse saved presets", error);
      return [];
    }
  }
  
  /**
   * Save a new user preset
   */
  public static savePreset(preset: Omit<Preset, "id">): Preset {
    const presets = this.getUserPresets();
    const newPreset: Preset = {
      ...preset,
      id: crypto.randomUUID()
    };
    
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify([...presets, newPreset])
    );
    
    return newPreset;
  }
  
  /**
   * Delete a user preset
   */
  public static deletePreset(presetId: string): boolean {
    const presets = this.getUserPresets();
    const updatedPresets = presets.filter(p => p.id !== presetId);
    
    if (presets.length === updatedPresets.length) {
      return false;
    }
    
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(updatedPresets)
    );
    
    return true;
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
