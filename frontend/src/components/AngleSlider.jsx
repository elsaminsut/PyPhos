"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

// Azimuth convention used across the app: South is 0°, West is positive, East is negative.
const COMPASS_DIRECTIONS = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"]

export function getCompassDirection(azimuth) {
  const normalized = ((azimuth % 360) + 360) % 360
  return COMPASS_DIRECTIONS[Math.round(normalized / 45) % 8]
}

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
