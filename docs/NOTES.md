# wave-generator Notes

## Development Progress

### Phase 1: Foundation

- [x] Next.js project with Bun already set up
- [x] Some basic UI components already installed (button, slider, etc.)
- [x] Create the core audio engine for binaural beat generation
- [x] Implement the main WaveGenerator component
- [x] Update the homepage to use the WaveGenerator component

### Phase 2: Multiple Modulation Techniques

- [x] Update Type Definitions
  - [x] Extend `ModulationSettings` interface to include all modulation parameters
  - [x] Create types for presets and preset categories
  - [x] Add noise type definitions

- [x] Enhance the Audio Engine
  - [x] Add support for amplitude modulation (a-mod)
  - [x] Improve binaural beat generation with intensity control
  - [x] Implement stereo/bilateral modulation
  - [x] Add frequency modulation (f-mod)
  - [x] Refactor the play method to accept a complete settings object

- [x] Implement Noise Generation
  - [x] Create a NoiseGenerator utility class
  - [x] Implement algorithms for white, pink, and brown noise
  - [x] Add noise mixing with main tones

- [x] Create a Preset System
  - [x] Define preset categories (relaxation, focus, meditation, sleep)
  - [x] Create built-in presets for each frequency range
  - [x] Add special presets like Schumann Resonance (7.83 Hz)

- [x] Update the UI
  - [x] Reorganize the WaveGenerator component with a tabbed interface
  - [x] Group controls by function (frequency, modulation, noise, output)
  - [x] Add preset selection dropdown
  - [x] Make all parameters reactive and update the audio in real-time

### Notes on Phase 2 Implementation

#### Audio Engine Enhancements

The AudioEngine class was significantly enhanced to support multiple modulation techniques:

- **Amplitude Modulation (a-mod)**: Implemented using a Low Frequency Oscillator (LFO) connected to a gain node's gain parameter to create pulsing volume effects (isochronic tones).
- **Binaural Beat Intensity**: Added an intensity parameter that controls the magnitude of frequency difference between left and right channels.
- **Stereo Panning**: Implemented using StereoPannerNode with an LFO to control the pan parameter.
- **Frequency Modulation (f-mod)**: Created by connecting an LFO to the frequency parameter of the carrier oscillators.
- **Simplified to use only sine waves**: We determined that pure sine waves are ideal for brainwave entrainment, so we removed the wave type options and optimized the engine to use sine waves exclusively.

#### Noise Generation

The NoiseGenerator class creates different types of noise by generating specific audio buffers:

- **White Noise**: Equal energy at all frequencies, created using random samples.
- **Pink Noise**: Equal energy per octave, created using a filtering algorithm.
- **Brown Noise**: Deeper bass content, also using filtering but with a steeper slope.

Each noise type has different characteristics that complement the brainwave entrainment effects.

#### Preset System

The preset system organizes configurations by purpose:

- **Delta Presets**: For deep sleep and healing (0.5-4 Hz)
- **Theta Presets**: For meditation and creativity (4-8 Hz)
- **Alpha Presets**: For relaxation and calmness (8-13 Hz)
- **Beta Presets**: For focus and alertness (13-30 Hz)

The Schumann Resonance preset (7.83 Hz) was included as it aligns with Earth's electromagnetic field frequency.

#### UI Improvements

The UI was completely reorganized using a tabbed interface to group related controls:

- **Frequency Tab**: Controls for carrier and beat frequencies
- **Modulation Tab**: Controls for all modulation techniques (binaural, a-mod, stereo, f-mod)
- **Noise Tab**: Controls for noise type and level
- **Output Tab**: Controls for master volume and mix balance

#### Component Implementation

- Properly installed shadcn/ui components using the CLI tool (`bunx --bun shadcn@canary add label select tabs`) rather than creating custom components
- Created a cleaner, more maintainable component structure
- Implemented a preset dropdown for quick access to different configurations

### Challenges and Solutions

1. **Challenge**: Combining multiple modulation techniques in a balanced way
   **Solution**: Implemented mix levels for each modulation type, and provided presets with balanced settings

2. **Challenge**: Creating an intuitive UI for many parameters
   **Solution**: Used a tabbed interface to group controls logically, preventing the UI from becoming overwhelming

3. **Challenge**: Efficient noise generation
   **Solution**: Generated noise buffers with reasonable duration (2-5 seconds) and looped them

4. **Challenge**: Smooth transitions when changing parameters
   **Solution**: Used AudioParam.linearRampToValueAtTime for smooth parameter changes

5. **Challenge**: Ensuring the application uses only sine waves for optimal brainwave entrainment
   **Solution**: Removed wave type options entirely and simplified the audio engine to always use sine waves

6. **Challenge**: Proper implementation of UI components
   **Solution**: Used shadcn/ui CLI to properly install components rather than creating custom ones

## Next Steps (Phase 3: Preset System Enhancement and Visualization)

### Implementation Plan for Phase 3

1. **Enhance the Preset System**
   - Add functionality to create and save custom presets
   - Implement preset management (edit, delete, rename)

2. **Add Audio Visualization**
   - Create a real-time waveform display
   - Add frequency spectrum visualization
   - Implement brainwave frequency indicator

3. **Add Timer Functionality**
   - Create session duration controls
   - Implement gradual fade-out at session end
   - Add optional alerts/notifications
