"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { getCompassDirection } from "@/lib/utils"


export function AngleSlider({ name, min, max, value, onValueChange, tag }) {
  return (
    <div className="grid w-full gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`slider-${name}`}>{name}</Label>
        <span className="text-sm text-muted-foreground">
          {value}°{tag && ` · ${getCompassDirection(value)}`}
        </span>
      </div>
      <Slider
        id={`slider-${name}`}
        value={[value]}
        onValueChange={(v) => onValueChange(Array.isArray(v) ? v[0] : v)}
        min={min}
        max={max}
      />
    </div>
  )
}
