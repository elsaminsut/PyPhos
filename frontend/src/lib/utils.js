import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

import { jwtDecode } from "jwt-decode"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isTokenValid(token) {
    if (!token) return false
    try {
        const { exp } = jwtDecode(token)
        return exp * 1000 > Date.now()
    } catch {
        return false
    }
}

export function getCompassDirection(azimuth) {
  // Azimuth convention used across the app: South is 0°, West is positive, East is negative.
  const COMPASS_DIRECTIONS = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"]
  const normalized = ((azimuth % 360) + 360) % 360
  return COMPASS_DIRECTIONS[Math.round(normalized / 45) % 8]
}