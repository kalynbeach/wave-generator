"use client";

import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type WaveGeneratorControlProps = {
  name: string;
  value: number;
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  tooltip?: string;
};

export default function WaveGeneratorControl({
  name,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  tooltip = "",
}: WaveGeneratorControlProps) {
  const id = name.toLowerCase().replace(/\s+/g, "-");
  const isPercentage = unit === "%";
  const displayValue = isPercentage ? value * 100 : value;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange([isPercentage ? newValue / 100 : newValue]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="font-semibold">
          {name}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Input
          type="number"
          id={id}
          value={displayValue}
          onChange={handleInputChange}
          className="w-20 ml-auto font-mono"
          min={isPercentage ? min * 100 : min}
          max={isPercentage ? max * 100 : max}
          step={isPercentage ? step * 100 : step}
        />
        {unit && <span className="text-sm font-semibold">{unit}</span>}
      </div>
      <Slider
        id={`${id}-slider`}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={onChange}
      />
    </div>
  );
}
