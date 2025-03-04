# wave-generator Notes

## Development Progress

### Phase 1: Foundation

- [x] Next.js project with Bun already set up
- [x] Some basic UI components already installed (button, slider, etc.)
- [x] Create the core audio engine for binaural beat generation
- [x] Implement the main WaveGenerator component
- [x] Update the homepage to use the WaveGenerator component

### Implementation Plan

1. ✅ Create the AudioEngine class in lib/audio/engine.ts
2. ✅ Implement the WaveGenerator component in components/wave-generator.tsx
3. ✅ Update app/page.tsx to use the WaveGenerator component
4. ✅ Test basic functionality

### Notes

- The AudioEngine uses Web Audio API to generate binaural beats with different frequencies in each ear
- The WaveGenerator component provides a user interface with sliders for controlling:
  - Carrier Frequency (the base frequency)
  - Beat Frequency (the difference between left and right ear frequencies)
  - Volume level
- Based on analysis of Brainaural interface, we've identified multiple modulation techniques important for brainwave entrainment:
  - Amplitude Modulation (a-mod): Creates isochronic tones by pulsing the volume at the target brainwave frequency
  - Binaural Beats: Traditional method using frequency differences between ears
  - Stereo/Bilateral: Panning sound between left and right channels at the brainwave frequency
  - Frequency Modulation (f-mod): Varying the carrier frequency at the brainwave rate
- Sine waves are generally preferred for brainwave entrainment due to their purity and gentleness, making wave type selection less critical for this application
- For the UI, we'll adopt a Brainaural-like approach with separate sliders for each modulation type

### Next Steps (Phase 2: Multiple Modulation Techniques)

#### Implementation Plan for Phase 2

We'll enhance the audio engine and UI to support all modulation techniques outlined in the project documents. Here's a detailed breakdown of the implementation steps:

1. **Update Type Definitions**
   - Extend `ModulationSettings` interface to include all modulation parameters
   - Create types for presets and preset categories
   - Add noise type definitions

2. **Enhance the Audio Engine**
   - Add support for amplitude modulation (a-mod)
     - Create LFO to modulate volume at the brainwave frequency
     - Implement depth control for modulation intensity
   - Improve binaural beat generation
     - Add intensity control
     - Optimize stereo separation
   - Implement stereo/bilateral modulation
     - Create StereoPannerNode with LFO control
     - Implement depth control
   - Add frequency modulation (f-mod)
     - Create oscillator to modulate carrier frequency
     - Implement depth control
   - Refactor the play method to accept a complete settings object

3. **Implement Noise Generation**
   - Create a NoiseGenerator utility class
   - Implement algorithms for white, pink, and brown noise
   - Add noise mixing with main tones

4. **Create a Preset System**
   - Define preset categories (relaxation, focus, meditation, sleep)
   - Create built-in presets for each frequency range:
     - Delta waves (0.5-4 Hz) for sleep
     - Theta waves (4-8 Hz) for meditation
     - Alpha waves (8-13 Hz) for relaxation
     - Beta waves (13-30 Hz) for focus
   - Add special presets like Schumann Resonance (7.83 Hz)

5. **Update the UI**
   - Reorganize the WaveGenerator component to include all controls
   - Group controls by function (frequency, modulation, noise, etc.)
   - Add preset selection dropdown
   - Ensure all parameters are reactive and update the audio in real-time

#### Technical Implementation Details

**Amplitude Modulation (a-mod)**

```typescript
// Creating an LFO for amplitude modulation
const aModOscillator = audioContext.createOscillator();
aModOscillator.frequency.value = brainwaveFrequency;

const aModGain = audioContext.createGain();
aModGain.gain.value = 0.5; // Starting point

// Connect LFO to gain parameter
aModOscillator.connect(aModGain.gain);
aModOscillator.start();

// Connect audio signal through the modulated gain
oscillator.connect(aModGain);
aModGain.connect(masterGain);
```

**Stereo Panning Modulation**

```typescript
// Creating an LFO for panning modulation
const panLFO = audioContext.createOscillator();
panLFO.frequency.value = brainwaveFrequency;

const stereoPanner = audioContext.createStereoPanner();
stereoPanner.pan.value = 0; // Center

// Connect LFO to pan parameter
panLFO.connect(stereoPanner.pan);
panLFO.start();

// Connect audio signal through the panner
oscillator.connect(stereoPanner);
stereoPanner.connect(masterGain);
```

**Pink Noise Generation Algorithm**

```typescript
// Basic pink noise generation approach
function generatePinkNoise(audioContext, duration = 2) {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = duration * sampleRate;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);
  
  // Pink noise requires filtering - we use a basic approximation
  const b0 = 0.99765; // Filter coefficients
  const b1 = 0.0990460;
  const b2 = 0.0947331;
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel);
    let white = 0;
    let pink = [0, 0, 0]; // Filter state
    
    for (let i = 0; i < bufferSize; i++) {
      white = Math.random() * 2 - 1;
      
      // Pink noise filter
      pink[0] = b0 * pink[0] + white * 0.5362;
      pink[1] = b1 * pink[1] + white * 0.2598;
      pink[2] = b2 * pink[2] + white * 0.0417;
      
      channelData[i] = (pink[0] + pink[1] + pink[2]) * 0.3;
    }
  }
  
  return buffer;
}
```

#### Challenges and Solutions

1. **Challenge**: Combining multiple modulation techniques in a balanced way
   **Solution**: Implement mix levels for each modulation type, and provide presets with balanced settings

2. **Challenge**: Creating an intuitive UI for many parameters
   **Solution**: Group controls logically and use collapsible sections to avoid overwhelming users

3. **Challenge**: Efficient noise generation
   **Solution**: Generate noise buffers with reasonable duration (2-5 seconds) and loop them

4. **Challenge**: Smooth transitions when changing parameters
   **Solution**: Use AudioParam.linearRampToValueAtTime for smooth parameter changes
