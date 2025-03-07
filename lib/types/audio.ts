/**
 * Type definitions for audio functionality
 */

export type NoiseType = "white" | "pink" | "brown" | "none";

export interface AudioSettings {
  carrierFrequency: number;
  beatFrequency: number;
  volume: number;
}

export interface ModulationSettings extends AudioSettings {
  aModDepth: number; // Amplitude modulation depth (0-1)
  binauralIntensity: number; // Binaural beat intensity (0-1)
  stereoDepth: number; // Stereo panning depth (0-1)
  fModDepth: number; // Frequency modulation depth (0-1)
  noiseType: NoiseType; // Type of background noise
  noiseLevel: number; // Level of noise (0-1)
  mixLevel: number; // Balance between carrier and effects (0-1)
}

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

export interface ExtendedAudioSettings extends AudioSettings {
  noiseLevel: number;
  noiseType: NoiseType;
}
