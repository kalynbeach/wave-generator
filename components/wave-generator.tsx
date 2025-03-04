"use client";

import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AudioEngine } from "@/lib/audio/engine";
import { ModulationSettings, NoiseType } from "@/lib/types/audio";
import { BUILT_IN_PRESETS, PRESET_CATEGORIES, getDefaultPreset, getPresetById } from "@/lib/presets";

/**
 * Main WaveGenerator component for brainwave entrainment
 */
export default function WaveGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<ModulationSettings>(getDefaultPreset());
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
    setSettings(prev => {
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
  
  const handleSliderChange = (key: keyof ModulationSettings, values: number[]) => {
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-mono font-bold">WaveGenerator</CardTitle>
          <CardDescription>Advanced Brainwave Entrainment Tool</CardDescription>
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
          <Label htmlFor="preset-select" className="mb-2 block">Preset</Label>
          <Select value={currentPresetId || ""} onValueChange={handlePresetSelect}>
            <SelectTrigger id="preset-select">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {PRESET_CATEGORIES.filter(cat => cat.id !== "custom").map((category) => (
                <div key={category.id} className="p-1">
                  <div className="text-xs text-muted-foreground font-semibold px-2 py-1">
                    {category.name}
                  </div>
                  {BUILT_IN_PRESETS.filter(preset => preset.category === category.id).map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="frequency" className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="frequency">Frequency</TabsTrigger>
            <TabsTrigger value="modulation">Modulation</TabsTrigger>
            <TabsTrigger value="noise">Noise</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          
          <TabsContent value="frequency" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="carrier-freq">
                Carrier Frequency: {settings.carrierFrequency} Hz
              </Label>
              <Slider 
                id="carrier-freq"
                min={50} 
                max={500} 
                step={1} 
                value={[settings.carrierFrequency]} 
                onValueChange={(values) => handleSliderChange("carrierFrequency", values)} 
              />
              <div className="text-xs text-muted-foreground pl-2">
                Using pure sine waves for optimal brainwave entrainment
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="beat-freq">
                Beat Frequency: {settings.beatFrequency.toFixed(2)} Hz
              </Label>
              <Slider 
                id="beat-freq"
                min={0.5} 
                max={40} 
                step={0.1} 
                value={[settings.beatFrequency]} 
                onValueChange={(values) => handleSliderChange("beatFrequency", values)} 
              />
              <div className="text-xs text-muted-foreground pl-2">
                {settings.beatFrequency <= 4 ? "Delta" : 
                 settings.beatFrequency <= 8 ? "Theta" : 
                 settings.beatFrequency <= 13 ? "Alpha" : 
                 settings.beatFrequency <= 30 ? "Beta" : "Gamma"} wave range
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="modulation" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="binaural-intensity">
                Binaural Intensity: {Math.round(settings.binauralIntensity * 100)}%
              </Label>
              <Slider 
                id="binaural-intensity"
                min={0} 
                max={1} 
                step={0.01} 
                value={[settings.binauralIntensity]} 
                onValueChange={(values) => handleSliderChange("binauralIntensity", values)} 
              />
              <div className="text-xs text-muted-foreground pl-2">
                Differences in frequency between left and right ears
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amod-depth">
                Amplitude Modulation: {Math.round(settings.aModDepth * 100)}%
              </Label>
              <Slider 
                id="amod-depth"
                min={0} 
                max={1} 
                step={0.01} 
                value={[settings.aModDepth]} 
                onValueChange={(values) => handleSliderChange("aModDepth", values)} 
              />
              <div className="text-xs text-muted-foreground pl-2">
                Pulsing volume at the target frequency (isochronic tones)
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stereo-depth">
                Stereo Panning: {Math.round(settings.stereoDepth * 100)}%
              </Label>
              <Slider 
                id="stereo-depth"
                min={0} 
                max={1} 
                step={0.01} 
                value={[settings.stereoDepth]} 
                onValueChange={(values) => handleSliderChange("stereoDepth", values)} 
              />
              <div className="text-xs text-muted-foreground pl-2">
                Panning between left and right channels
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fmod-depth">
                Frequency Modulation: {Math.round(settings.fModDepth * 100)}%
              </Label>
              <Slider 
                id="fmod-depth"
                min={0} 
                max={1} 
                step={0.01} 
                value={[settings.fModDepth]} 
                onValueChange={(values) => handleSliderChange("fModDepth", values)} 
              />
              <div className="text-xs text-muted-foreground pl-2">
                Variations in the carrier frequency
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="noise" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="noise-type">Noise Type</Label>
              <Select value={settings.noiseType} onValueChange={handleNoiseTypeChange}>
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
                {settings.noiseType === "white" ? "White noise has equal power at all frequencies" :
                 settings.noiseType === "pink" ? "Pink noise has equal power per octave, sounds more natural" :
                 settings.noiseType === "brown" ? "Brown noise has more bass, like ocean waves" :
                 "No background noise"}
              </div>
            </div>
            
            {settings.noiseType !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="noise-level">
                  Noise Level: {Math.round(settings.noiseLevel * 100)}%
                </Label>
                <Slider 
                  id="noise-level"
                  min={0} 
                  max={1} 
                  step={0.01} 
                  value={[settings.noiseLevel]} 
                  onValueChange={(values) => handleSliderChange("noiseLevel", values)} 
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="output" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mix-level">
                Tone/Effect Balance: {Math.round(settings.mixLevel * 100)}%
              </Label>
              <Slider 
                id="mix-level"
                min={0} 
                max={1} 
                step={0.01} 
                value={[settings.mixLevel]} 
                onValueChange={(values) => handleSliderChange("mixLevel", values)} 
              />
              <div className="text-xs text-muted-foreground pl-2">
                Balance between carrier tone and modulation effects
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volume">
                Volume: {Math.round(settings.volume * 100)}%
              </Label>
              <Slider 
                id="volume"
                min={0} 
                max={1} 
                step={0.01} 
                value={[settings.volume]} 
                onValueChange={(values) => handleSliderChange("volume", values)} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <div className="p-4 text-center text-xs text-muted-foreground">
        <p>
          Best experienced with stereo headphones. Binaural beats require stereo audio to be effective.
        </p>
      </div>
    </Card>
  );
} 