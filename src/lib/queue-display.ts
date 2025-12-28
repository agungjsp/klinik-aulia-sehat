import type { Poly } from "@/types"

/**
 * Group queues by Poli ID
 */
export function groupQueuesByPoly<T extends { poly: Poly }>(queues: T[]): Map<number, T[]> {
  const grouped = new Map<number, T[]>()
  
  for (const queue of queues) {
    const polyId = queue.poly.id
    if (!grouped.has(polyId)) {
      grouped.set(polyId, [])
    }
    grouped.get(polyId)!.push(queue)
  }
  
  return grouped
}

/**
 * Get unique Polis from a list of queues
 */
export function getUniquePolis<T extends { poly: Poly }>(queues: T[]): Poly[] {
  const polyMap = new Map<number, Poly>()
  for (const queue of queues) {
    if (!polyMap.has(queue.poly.id)) {
      polyMap.set(queue.poly.id, queue.poly)
    }
  }
  return Array.from(polyMap.values())
}
