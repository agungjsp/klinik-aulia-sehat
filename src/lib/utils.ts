import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Poly } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a poly name is "Poli Umum" (case-insensitive)
 */
export function isPoliUmum(name: string): boolean {
  return name.toLowerCase().includes("umum")
}

/**
 * Sort polies with "Poli Umum" first, then alphabetically
 */
export function sortPoliesWithUmumFirst<T extends { name: string }>(polies: T[]): T[] {
  return [...polies].sort((a, b) => {
    const aIsUmum = isPoliUmum(a.name)
    const bIsUmum = isPoliUmum(b.name)
    if (aIsUmum && !bIsUmum) return -1
    if (!aIsUmum && bIsUmum) return 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * Find Poli Umum from a list of polies, or return the first one
 */
export function findPoliUmum(polies: Poly[]): Poly | undefined {
  return polies.find((p) => isPoliUmum(p.name)) ?? polies[0]
}

/**
 * Get the default poly ID (Poli Umum or first available)
 */
export function getDefaultPolyId(polies: Poly[], userPolyId?: number | null): number | undefined {
  if (userPolyId) return userPolyId
  const poliUmum = findPoliUmum(polies)
  return poliUmum?.id
}
