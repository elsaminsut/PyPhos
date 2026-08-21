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