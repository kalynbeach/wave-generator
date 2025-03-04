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

The user interface is intuitive, responsive, and inspired by Brainaural's layout, allowing users to control various aspects of the sound generation.

- **Brainwave Frequency Control**: Slider to set the target brainwave frequency (delta, theta, alpha, beta, gamma ranges)
- **Carrier Frequency Control**: Setting the base frequency of the sound
- **Modulation Controls**: Separate sliders for each modulation type (a-mod, binaural, stereo, f-mod)
- **Noise Controls**: Adjusting noise type and level
- **Mix Level Control**: Balancing different audio elements
- **Preset Selection**: UI for selecting, saving, and managing presets
- **Tabbed Interface**: Organizing controls into logical groups (frequency, modulation, noise, output)
- **Responsive Design**: Adapting the UI to different screen sizes

### 3. Preset System

Presets allow users to quickly access sound configurations for specific purposes.

- **Built-in Presets**: Pre-configured settings for common use cases (relaxation, focus, sleep, etc.)
- **Preset Categories**: Organized by purpose (relaxation, focus, meditation, sleep)
- **Preset Loading**: Ability to load and use predefined configurations
- **Custom Presets**: Ability to save user-created configurations (future feature)

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

### Phase 2: Multiple Modulation Techniques (Completed)

- Enhanced the audio engine to support all modulation techniques:
  - Implemented amplitude modulation (a-mod) for isochronic tones
  - Improved binaural beat generation with intensity control
  - Added stereo/bilateral modulation for panning between channels
  - Implemented frequency modulation (f-mod) to vary carrier frequency
- Implemented background noise generation (white, pink, brown) and mixing
- Updated the UI with sliders for all modulation parameters
- Created a tabbed layout with grouped controls
- Implemented a preset system with built-in presets for various mental states
- Optimized for pure sine waves as the ideal waveform for brainwave entrainment

### Phase 3: Preset System and Visualization (Planned)

- Enhance the preset system to support user-saved presets
- Develop basic visualization for the audio
- Refine the UI based on user feedback
- Add session timer functionality

### Phase 4: Advanced Features (Planned)

- Implement audio export to WAV
- Add analytics to track usage patterns
- Develop preset sharing functionality
- Create mobile-responsive design optimizations

## Implementation Details

### Binaural Beat Generation

The core of the application uses the Web Audio API to create binaural beats. This is achieved by playing slightly different frequencies in each ear, causing the brain to perceive a third "beat" frequency equal to the difference between the two tones.

For example, if we play a 200 Hz tone in the left ear and a 210 Hz tone in the right ear, the brain perceives a 10 Hz beat, which falls in the alpha brainwave range associated with relaxation.

### Audio Chain Configuration

The audio processing chain is configured based on the selected modulation techniques:

1. **Oscillators**: Generate pure sine waves at specified frequencies
2. **Gain Nodes**: Control volume levels
3. **Modulation**: Apply selected effects (a-mod, stereo panning, f-mod)
4. **Noise Generation**: Mix in selected background noise
5. **Master Output**: Final volume control

## Quality Assurance

### Testing Strategy

- Unit tests for audio engine and core functionalities
- Integration tests for the preset system
- End-to-end tests for key user flows
- Cross-browser testing for compatibility

### Accessibility

- Proper labeling of all controls
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Future Expansion Ideas

Beyond the already mentioned future features (custom presets, sharing, WAV export), here are additional ideas:

- **Scheduled Sessions**: Allow users to set up timed sessions
- **Progressive Entrainment**: Gradually change frequencies over time
- **Multi-User Support**: Accounts, profiles, and preset libraries
- **Mobile Apps**: Native apps for iOS and Android
- **Integration with Health Platforms**: Connect with systems like Apple Health or Google Fit
- **Guided Sessions**: Combine binaural beats with guided meditations
