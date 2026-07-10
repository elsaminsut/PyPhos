"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function AngleSlider({ name, min, max, value, onValueChange, onValueCommitted }) {
  return (
    <div className="grid w-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`slider-${name}`}>{name}</Label>
        <span className="text-sm text-muted-foreground">
          {value}°
        </span>
      </div>
      <Slider
        id={`slider-${name}`}
        value={[value]}
        onValueChange={(v) => onValueChange(Array.isArray(v) ? v[0] : v)}
        onValueCommitted={(v) => onValueCommitted(Array.isArray(v) ? v[0] : v)}
        min={min}
        max={max}
        step={0.1}
      />
    </div>
  )
}
