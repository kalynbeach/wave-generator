/**
 * Type definitions for audio functionality
 */

export type WaveType = "sine" | "square" | "sawtooth" | "triangle";

export type NoiseType = "white" | "pink" | "brown" | "none";

export interface AudioSettings {
  carrierFrequency: number;
  beatFrequency: number;
  waveType: WaveType;
  volume: number;
}

export interface ExtendedAudioSettings extends AudioSettings {
  noiseLevel: number;
  noiseType: NoiseType;
} 