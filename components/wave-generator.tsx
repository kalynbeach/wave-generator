"use client";

import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioEngine } from "@/lib/audio/engine";
// import { WaveType } from "@/lib/types/audio";

/**
 * Main WaveGenerator component
 */
export default function WaveGenerator() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [beatFreq, setBeatFreq] = useState(7.83); // Schumann resonance
  const [volume, setVolume] = useState(0.5);
  // Wave type will be implemented in a future update
  // const [waveType, setWaveType] = useState<WaveType>("sine");
  
  const audioEngineRef = useRef<AudioEngine | null>(null);
  
  useEffect(() => {
    // Initialize audio engine
    audioEngineRef.current = new AudioEngine();
    audioEngineRef.current.initialize();
    
    // Cleanup on unmount
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
      audioEngineRef.current.play(carrierFreq, beatFreq, volume);
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!audioEngineRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioEngineRef.current.setVolume(newVolume);
  };
  
  const handleCarrierChange = (value: number[]) => {
    if (!audioEngineRef.current) return;
    
    const newCarrierFreq = value[0];
    setCarrierFreq(newCarrierFreq);
    
    if (isPlaying) {
      audioEngineRef.current.stop();
      audioEngineRef.current.play(newCarrierFreq, beatFreq, volume);
    }
  };
  
  const handleBeatChange = (value: number[]) => {
    if (!audioEngineRef.current) return;
    
    const newBeatFreq = value[0];
    setBeatFreq(newBeatFreq);
    
    if (isPlaying) {
      audioEngineRef.current.stop();
      audioEngineRef.current.play(carrierFreq, newBeatFreq, volume);
    }
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-mono font-bold">WaveGenerator</CardTitle>
        <Button 
          variant={isPlaying ? "destructive" : "default"} 
          onClick={togglePlay}
          className="px-8"
        >
          {isPlaying ? "Stop" : "Play"}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Carrier Frequency: {carrierFreq} Hz
          </label>
          <Slider 
            min={50} 
            max={500} 
            step={1} 
            value={[carrierFreq]} 
            onValueChange={handleCarrierChange} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Beat Frequency: {beatFreq.toFixed(2)} Hz
          </label>
          <Slider 
            min={0.5} 
            max={40} 
            step={0.1} 
            value={[beatFreq]} 
            onValueChange={handleBeatChange} 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Volume: {Math.round(volume * 100)}%
          </label>
          <Slider 
            min={0} 
            max={1} 
            step={0.01} 
            value={[volume]} 
            onValueChange={handleVolumeChange} 
          />
        </div>
      </CardContent>
    </Card>
  );
} 