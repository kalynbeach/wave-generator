# wave-generator Overview

I want to build an advanced binaural sound generator app called `wave-generator` to use as a brainwave entrainment tool.

`wave-generator` is a Bun-based Next.js 15 app using React 19, Tailwind CSS v4, shadcn/ui components, the Web Audio API, and other modern libraries and APIs.

Inspiration: [BrainAural](https://brainaural.com/)

## What is Brainwave Entrainment?

Brainwave entrainment refers to the brain's electrical response to rhythmic sensory stimulation, such as pulses of sound or light. When the brain is presented with a stimulus at a specific frequency, it tends to synchronize or "entrain" to that frequency. This technology can be used to guide the brain into states that have been associated with relaxation, focus, meditation, and sleep.

Different frequency ranges correspond to different mental states:

- **Delta (0.5-4 Hz)**: Deep sleep, healing
- **Theta (4-8 Hz)**: Deep relaxation, meditation, creativity
- **Alpha (8-13 Hz)**: Relaxed alertness, calmness
- **Beta (13-30 Hz)**: Active thinking, focus, alertness
- **Gamma (30+ Hz)**: Higher mental activity, perception

## Modulation Techniques

The app uses several techniques to create brainwave entrainment effects:

1. **Binaural Beats**: When slightly different frequencies are played in each ear, the brain perceives a third "beat" frequency equal to the difference.

2. **Amplitude Modulation (a-mod)**: Creates isochronic tones by pulsing the volume at the target brainwave frequency.

3. **Stereo/Bilateral Modulation**: Pans sound between left and right audio channels at the brainwave frequency.

4. **Frequency Modulation (f-mod)**: Varies the carrier frequency at the brainwave rate.

These techniques can be used individually or combined for enhanced effects.

## Features

### Initial Features

- UI with controls for carrier (main) frequency, brainwave frequency, and volume level
- Multiple modulation techniques:
  - Binaural beat generation
  - Amplitude modulation (isochronic tones)
  - Stereo/bilateral panning
  - Frequency modulation
- Background noise generation (white, pink, brown)
- Mix level controls to balance different audio elements
- Presets for various mental states (meditation, focus, sleep, etc.)

### Future Features

- Create and save custom sound settings presets
- Share presets with others via links
- Download sounds as WAV files
- Audio visualization
- Progressive entrainment (gradually changing frequencies)
- Timer for sessions
