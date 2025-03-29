"use client";

import { useState, useEffect, useRef } from "react";
import { Waves } from "lucide-react";
import type { ModulationSettings, NoiseType } from "@/lib/types/audio";
import { AudioEngine } from "@/lib/audio/engine";
import {
  BUILT_IN_PRESETS,
  PRESET_CATEGORIES,
  getDefaultPreset,
  getPresetById,
} from "@/lib/presets";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import WaveGeneratorControl from "@/components/wave-generator-control";

export default function WaveGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<ModulationSettings>(
    getDefaultPreset()
  );
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    audioEngineRef.current.initialize();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioEngineRef.current) return;

    if (isPlaying) {
      audioEngineRef.current.stop();
    } else {
      audioEngineRef.current.play(settings);
    }
    setIsPlaying(!isPlaying);
  };

  const updateSetting = <K extends keyof ModulationSettings>(
    key: K,
    value: ModulationSettings[K]
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };

      if (isPlaying && audioEngineRef.current) {
        audioEngineRef.current.updateSettings({ [key]: value });
      }

      if (currentPresetId) {
        setCurrentPresetId(null);
      }

      return newSettings;
    });
  };

  const handleSliderChange = (
    key: keyof ModulationSettings,
    values: number[]
  ) => {
    updateSetting(key, values[0]);
  };

  const loadPreset = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (!preset) return;

    setSettings(preset.settings);
    setCurrentPresetId(presetId);

    if (isPlaying && audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current.play(preset.settings);
    }
  };

  const handlePresetSelect = (value: string) => {
    loadPreset(value);
  };

  const handleNoiseTypeChange = (value: string) => {
    updateSetting("noiseType", value as NoiseType);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-mono font-bold">
            WaveGenerator
          </CardTitle>
          <CardDescription></CardDescription>
        </div>
        <Button
          variant={isPlaying ? "destructive" : "default"}
          onClick={togglePlay}
          className="px-8"
        >
          {isPlaying ? "Stop" : "Play"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="mb-6">
          <Label htmlFor="preset-select" className="mb-2 block">
            Preset
          </Label>
          <Select
            value={currentPresetId || ""}
            onValueChange={handlePresetSelect}
          >
            <SelectTrigger id="preset-select">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {PRESET_CATEGORIES.filter((cat) => cat.id !== "custom").map(
                (category) => (
                  <div key={category.id} className="p-1">
                    <div className="text-xs text-muted-foreground font-semibold px-2 py-1">
                      {category.name}
                    </div>
                    {BUILT_IN_PRESETS.filter(
                      (preset) => preset.category === category.id
                    ).map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </div>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3 p-4 py-4 border border-accent rounded-sm">
          <span className="text-lg font-bold">Frequency</span>
          <WaveGeneratorControl
            name="Carrier Frequency"
            value={settings.carrierFrequency}
            onChange={(values) =>
              handleSliderChange("carrierFrequency", values)
            }
            min={50}
            max={1000}
            step={1}
            unit="Hz"
            tooltip="Primary frequency for brainwave entrainment"
          />
          <WaveGeneratorControl
            name="Beat Frequency"
            value={settings.beatFrequency}
            onChange={(values) => handleSliderChange("beatFrequency", values)}
            min={0.5}
            max={40}
            step={0.1}
            unit="Hz"
            tooltip="Frequency difference between left and right channels"
          />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Waves className="w-5 h-5" />
            <span className="text-sm">
              {settings.beatFrequency <= 4
                ? "Delta"
                : settings.beatFrequency <= 8
                ? "Theta"
                : settings.beatFrequency <= 13
                ? "Alpha"
                : settings.beatFrequency <= 30
                ? "Beta"
                : "Gamma"}{" "}
              wave range
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-4 py-4 border border-accent rounded-sm">
          <span className="text-lg font-bold">Modulation</span>
          <WaveGeneratorControl
            name="Binaural Intensity"
            value={settings.binauralIntensity}
            onChange={(values) =>
              handleSliderChange("binauralIntensity", values)
            }
            min={0}
            max={1}
            step={0.01}
            unit="%"
            tooltip="Differences in frequency between left and right ears"
          />
          <WaveGeneratorControl
            name="Amplitude Modulation"
            value={settings.aModDepth}
            onChange={(values) => handleSliderChange("aModDepth", values)}
            min={0}
            max={1}
            step={0.01}
            unit="%"
            tooltip="Pulsing volume at the target frequency (isochronic tones)"
          />
          <WaveGeneratorControl
            name="Stereo Panning"
            value={settings.stereoDepth}
            onChange={(values) => handleSliderChange("stereoDepth", values)}
            min={0}
            max={1}
            step={0.01}
            unit="%"
            tooltip="Panning between left and right channels"
          />
          <WaveGeneratorControl
            name="Frequency Modulation"
            value={settings.fModDepth}
            onChange={(values) => handleSliderChange("fModDepth", values)}
            min={0}
            max={1}
            step={0.01}
            unit="%"
            tooltip="Variations in the carrier frequency"
          />
        </div>
        <div className="flex flex-col gap-3 p-4 py-4 border border-accent rounded-sm">
          <span className="text-lg font-bold">Noise</span>
          <div className="space-y-2">
            <Label htmlFor="noise-type">Noise Type</Label>
            <Select
              value={settings.noiseType}
              onValueChange={handleNoiseTypeChange}
            >
              <SelectTrigger id="noise-type">
                <SelectValue placeholder="Select noise type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="white">White</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground pl-2">
              {settings.noiseType === "white"
                ? "White noise has equal power at all frequencies"
                : settings.noiseType === "pink"
                ? "Pink noise has equal power per octave, sounds more natural"
                : settings.noiseType === "brown"
                ? "Brown noise has more bass, like ocean waves"
                : "No background noise"}
            </div>
          </div>
          {settings.noiseType !== "none" && (
            <WaveGeneratorControl
              name="Noise Level"
              value={settings.noiseLevel}
              onChange={(values) => handleSliderChange("noiseLevel", values)}
              min={0}
              max={1}
              step={0.01}
              unit="%"
              tooltip="Volume level of the background noise"
            />
          )}
        </div>
        <div className="flex flex-col gap-3 p-4 py-4 border border-accent rounded-sm">
          <span className="text-lg font-bold">Output</span>
          <WaveGeneratorControl
            name="Tone/Effect Balance"
            value={settings.mixLevel}
            onChange={(values) => handleSliderChange("mixLevel", values)}
            min={0}
            max={1}
            step={0.01}
            unit="%"
            tooltip="Balance between carrier tone and modulation effects"
          />
          <WaveGeneratorControl
            name="Volume"
            value={settings.volume}
            onChange={(values) => handleSliderChange("volume", values)}
            min={0}
            max={1}
            step={0.01}
            unit="%"
            tooltip="Overall output volume"
          />
        </div>
      </CardContent>
    </Card>
  );
}
