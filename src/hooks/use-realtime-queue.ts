import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getEcho } from "@/lib/echo"
import { queueKeys } from "./use-queue"
import { reservationKeys } from "./use-reservation"
import type { QueueUpdatedEvent, PolyQueueStatus, Poly } from "@/types"

// Throttle time in milliseconds - prevents refetch storms
const THROTTLE_MS = 500

// Channel name for queue updates (broadcasts all polies data)
const QUEUE_CHANNEL = "queue-channel"

interface UseRealtimeQueueOptions {
  /** Poly ID to filter status for (requires polies to be provided) */
  polyId?: number
  /** List of polies to look up poly name from polyId */
  polies?: Poly[]
  /** Direct poly name (alternative to polyId + polies) */
  polyName?: string
  /** Enable/disable the subscription */
  enabled?: boolean
}

/**
 * Normalize poly name for matching with WebSocket event keys
 * Removes "Poli " prefix and converts to lowercase
 */
function normalizePolyName(name: string): string {
  return name.toLowerCase().replace(/poli\s*/i, "").trim()
}

/**
 * Hook to subscribe to realtime queue updates via Laravel Reverb
 * 
 * The backend broadcasts all polies' queue status in a single event.
 * You can filter by polyId (with polies array) or polyName.
 * 
 * Usage with polyId:
 * ```tsx
 * function QueuePage() {
 *   const { data: polyData } = usePolyList()
 *   useRealtimeQueue({ 
 *     polyId: selectedPolyId, 
 *     polies: polyData?.data,
 *     enabled: true 
 *   })
 * }
 * ```
 * 
 * Usage with polyName:
 * ```tsx
 * function DisplayPage() {
 *   const { queueStatus } = useRealtimeQueue({ polyName: "umum", enabled: true })
 * }
 * ```
 */
export function useRealtimeQueue({ 
  polyId, 
  polies, 
  polyName: directPolyName, 
  enabled = true 
}: UseRealtimeQueueOptions = {}) {
  const queryClient = useQueryClient()
  const lastInvalidationRef = useRef<number>(0)
  const [queueStatus, setQueueStatus] = useState<PolyQueueStatus | null>(null)
  const [allPoliesStatus, setAllPoliesStatus] = useState<QueueUpdatedEvent | null>(null)

  // Determine poly name from polyId or direct polyName
  const polyName = directPolyName ?? (
    polyId && polies 
      ? polies.find(p => p.id === polyId)?.name 
      : undefined
  )

  // Use ref to store latest polyName without causing effect re-runs
  const polyNameRef = useRef(polyName)
  polyNameRef.current = polyName

  // Use ref for queryClient to avoid dependency issues
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  useEffect(() => {
    if (!enabled) return

    const echo = getEcho()
    if (!echo) return

    console.log(`Subscribing to realtime channel: ${QUEUE_CHANNEL}`)

    const channel = echo.channel(QUEUE_CHANNEL)
    
    const handleQueueUpdated = (event: QueueUpdatedEvent) => {
      const now = Date.now()
      
      console.log("Queue updated event received:", event)
      
      // Update local state with all polies data
      setAllPoliesStatus(event)
      
      // Update specific poly status if polyName is available
      const currentPolyName = polyNameRef.current
      if (currentPolyName) {
        const normalizedPolyName = normalizePolyName(currentPolyName)
        const status = event[normalizedPolyName] || null
        setQueueStatus(status)
      }
      
      // Throttle query invalidation to prevent refetch storms
      if (now - lastInvalidationRef.current < THROTTLE_MS) {
        console.log("Queue update throttled, skipping cache invalidation")
        return
      }
      
      lastInvalidationRef.current = now

      // Invalidate queue-related queries to trigger refetch
      queryClientRef.current.invalidateQueries({ queryKey: queueKeys.all })
      queryClientRef.current.invalidateQueries({ queryKey: reservationKeys.all })
    }

    channel.listen(".queue.updated", handleQueueUpdated)

    return () => {
      console.log(`Unsubscribing from realtime channel: ${QUEUE_CHANNEL}`)
      channel.stopListening(".queue.updated", handleQueueUpdated)
      echo.leaveChannel(QUEUE_CHANNEL)
    }
  }, [enabled]) // Only re-subscribe when enabled changes

  return { queueStatus, allPoliesStatus }
}

/**
 * Hook to subscribe to realtime queue updates for all polies
 * Returns the full event payload with all polies' status
 */
export function useRealtimeQueueAll(enabled = true) {
  const { allPoliesStatus } = useRealtimeQueue({ enabled })
  return { allPoliesStatus }
}

/**
 * Get queue status for a specific poly from the event payload
 */
export function getPolyQueueStatus(event: QueueUpdatedEvent, polyName: string): PolyQueueStatus | null {
  const normalizedPolyName = normalizePolyName(polyName)
  return event[normalizedPolyName] || null
}
