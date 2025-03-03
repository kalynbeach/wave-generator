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

- Enhance the audio engine to support all modulation techniques:
  - Implement amplitude modulation (a-mod)
  - Improve binaural beat generation
  - Add stereo/bilateral modulation
  - Implement frequency modulation (f-mod)
- Add background noise generation (white, pink, brown)
- Update the UI to include sliders for all modulation parameters
- Create a more Brainaural-like layout with grouped controls
- Create a basic preset system with presets for various mental states (alpha, beta, theta, delta frequencies)
