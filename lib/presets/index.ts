/**
 * Preset system for the wave-generator
 */
import { ModulationSettings, Preset, PresetCategory } from "../types/audio";

/**
 * Preset categories with descriptions
 */
export const PRESET_CATEGORIES: { id: PresetCategory; name: string; description: string }[] = [
  { 
    id: "relaxation", 
    name: "Relaxation", 
    description: "For calm and relaxation" 
  },
  { 
    id: "focus", 
    name: "Focus", 
    description: "For concentration and productivity" 
  },
  { 
    id: "meditation", 
    name: "Meditation", 
    description: "For deeper meditative states" 
  },
  { 
    id: "sleep", 
    name: "Sleep", 
    description: "For better sleep and insomnia relief" 
  },
  { 
    id: "custom", 
    name: "Custom", 
    description: "Your saved presets" 
  }
];

/**
 * Built-in presets for the wave-generator
 */
export const BUILT_IN_PRESETS: Preset[] = [
  // Delta wave presets (0.5-4 Hz) - deep sleep
  {
    id: "deep-sleep",
    name: "Deep Sleep",
    description: "Delta waves for deep sleep (2 Hz)",
    category: "sleep",
    settings: {
      carrierFrequency: 200,
      beatFrequency: 2,
      volume: 0.6,
      aModDepth: 0.3,
      binauralIntensity: 1,
      stereoDepth: 0,
      fModDepth: 0,
      noiseType: "brown",
      noiseLevel: 0.2,
      mixLevel: 0.7
    }
  },
  {
    id: "healing-delta",
    name: "Healing Delta",
    description: "Delta waves for physical healing (3.5 Hz)",
    category: "sleep",
    settings: {
      carrierFrequency: 180,
      beatFrequency: 3.5,
      volume: 0.6,
      aModDepth: 0.2,
      binauralIntensity: 1,
      stereoDepth: 0,
      fModDepth: 0.1,
      noiseType: "brown",
      noiseLevel: 0.15,
      mixLevel: 0.7
    }
  },
  
  // Theta wave presets (4-8 Hz) - meditation, creativity
  {
    id: "deep-meditation",
    name: "Deep Meditation",
    description: "Theta waves for deep meditation (6 Hz)",
    category: "meditation",
    settings: {
      carrierFrequency: 250,
      beatFrequency: 6,
      volume: 0.65,
      aModDepth: 0.4,
      binauralIntensity: 0.8,
      stereoDepth: 0.3,
      fModDepth: 0.1,
      noiseType: "pink",
      noiseLevel: 0.1,
      mixLevel: 0.8
    }
  },
  {
    id: "creativity-boost",
    name: "Creativity Boost",
    description: "Theta waves for enhanced creativity (7 Hz)",
    category: "meditation",
    settings: {
      carrierFrequency: 200,
      beatFrequency: 7,
      volume: 0.6,
      aModDepth: 0.35,
      binauralIntensity: 0.7,
      stereoDepth: 0.4,
      fModDepth: 0.1,
      noiseType: "brown",
      noiseLevel: 0.05,
      mixLevel: 0.8
    }
  },
  {
    id: "schumann-resonance",
    name: "Schumann Resonance",
    description: "Earth's electromagnetic field frequency (7.83 Hz)",
    category: "meditation",
    settings: {
      carrierFrequency: 220,
      beatFrequency: 7.83,
      volume: 0.6,
      aModDepth: 0.3,
      binauralIntensity: 0.9,
      stereoDepth: 0.2,
      fModDepth: 0.1,
      noiseType: "none",
      noiseLevel: 0,
      mixLevel: 1.0
    }
  },
  
  // Alpha wave presets (8-13 Hz) - relaxation, calmness
  {
    id: "relaxed-alpha",
    name: "Relaxed Alpha",
    description: "Alpha waves for relaxation (10 Hz)",
    category: "relaxation",
    settings: {
      carrierFrequency: 200,
      beatFrequency: 10,
      volume: 0.6,
      aModDepth: 0.5,
      binauralIntensity: 0.8,
      stereoDepth: 0.3,
      fModDepth: 0.1,
      noiseType: "pink",
      noiseLevel: 0.1,
      mixLevel: 0.8
    }
  },
  {
    id: "stress-relief",
    name: "Stress Relief",
    description: "Alpha waves for stress reduction (8.5 Hz)",
    category: "relaxation",
    settings: {
      carrierFrequency: 220,
      beatFrequency: 8.5,
      volume: 0.65,
      aModDepth: 0.4,
      binauralIntensity: 0.7,
      stereoDepth: 0.4,
      fModDepth: 0.1,
      noiseType: "pink",
      noiseLevel: 0.15,
      mixLevel: 0.7
    }
  },
  
  // Beta wave presets (13-30 Hz) - focus, alertness
  {
    id: "focus-beta",
    name: "Focus Beta",
    description: "Beta waves for focus and concentration (15 Hz)",
    category: "focus",
    settings: {
      carrierFrequency: 180,
      beatFrequency: 15,
      volume: 0.55,
      aModDepth: 0.6,
      binauralIntensity: 0.7,
      stereoDepth: 0.3,
      fModDepth: 0.2,
      noiseType: "white",
      noiseLevel: 0.05,
      mixLevel: 0.9
    }
  },
  {
    id: "high-alertness",
    name: "High Alertness",
    description: "Higher beta waves for mental alertness (20 Hz)",
    category: "focus",
    settings: {
      carrierFrequency: 200,
      beatFrequency: 20,
      volume: 0.5,
      aModDepth: 0.7,
      binauralIntensity: 0.6,
      stereoDepth: 0.4,
      fModDepth: 0.3,
      noiseType: "white",
      noiseLevel: 0.05,
      mixLevel: 0.9
    }
  }
];

/**
 * Get a preset by its ID
 * @param id - The ID of the preset to retrieve
 * @returns The preset or undefined if not found
 */
export function getPresetById(id: string): Preset | undefined {
  return BUILT_IN_PRESETS.find(preset => preset.id === id);
}

/**
 * Get all presets in a specific category
 * @param category - The category to filter by
 * @returns An array of presets in the category
 */
export function getPresetsByCategory(category: PresetCategory): Preset[] {
  return BUILT_IN_PRESETS.filter(preset => preset.category === category);
}

/**
 * Get the default preset
 * @returns The default preset
 */
export function getDefaultPreset(): ModulationSettings {
  return {
    carrierFrequency: 200,
    beatFrequency: 7.83, // Schumann resonance
    volume: 0.5,
    aModDepth: 0,
    binauralIntensity: 1,
    stereoDepth: 0,
    fModDepth: 0,
    noiseType: "none",
    noiseLevel: 0,
    mixLevel: 1.0
  };
} 