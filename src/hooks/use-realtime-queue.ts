import { useEffect, useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getEcho } from "@/lib/echo"
import { queueKeys } from "./use-queue"
import { reservationKeys } from "./use-reservation"
import type { QueueUpdatedEvent } from "@/types"

// Throttle time in milliseconds - prevents refetch storms
const THROTTLE_MS = 500

interface UseRealtimeQueueOptions {
  polyId: number
  enabled?: boolean
}

/**
 * Hook to subscribe to realtime queue updates via Laravel Reverb
 * 
 * When a queue is updated on the server, this hook will automatically
 * invalidate the relevant TanStack Query caches, triggering a refetch.
 * 
 * Includes throttling to prevent refetch storms from rapid event bursts.
 * 
 * Usage:
 * ```tsx
 * function DisplayPage() {
 *   useRealtimeQueue({ polyId: 1, enabled: true })
 *   // ... rest of component
 * }
 * ```
 */
export function useRealtimeQueue({ polyId, enabled = true }: UseRealtimeQueueOptions) {
  const queryClient = useQueryClient()
  const lastInvalidationRef = useRef<number>(0)

  const handleQueueUpdated = useCallback(
    (event: QueueUpdatedEvent) => {
      const now = Date.now()
      
      // Throttle: ignore if we invalidated within THROTTLE_MS
      if (now - lastInvalidationRef.current < THROTTLE_MS) {
        console.log("Queue update throttled, skipping refetch")
        return
      }
      
      lastInvalidationRef.current = now
      console.log("Queue updated event received:", event)

      // Invalidate queue-related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
    },
    [queryClient]
  )

  useEffect(() => {
    if (!enabled) return

    const echo = getEcho()
    if (!echo) return

    const channelName = `queue.poly.${polyId}`
    
    console.log(`Subscribing to realtime channel: ${channelName}`)

    const channel = echo.channel(channelName)
    channel.listen("queue.updated", handleQueueUpdated)

    return () => {
      console.log(`Unsubscribing from realtime channel: ${channelName}`)
      channel.stopListening("queue.updated", handleQueueUpdated)
      echo.leaveChannel(channelName)
    }
  }, [polyId, enabled, handleQueueUpdated])
}

/**
 * Hook to subscribe to realtime queue updates for multiple polis
 * 
 * Includes throttling to prevent refetch storms from rapid event bursts.
 */
export function useRealtimeQueueMultiple(polyIds: number[], enabled = true) {
  const queryClient = useQueryClient()
  const lastInvalidationRef = useRef<number>(0)

  const handleQueueUpdated = useCallback(
    (event: QueueUpdatedEvent) => {
      const now = Date.now()
      
      // Throttle: ignore if we invalidated within THROTTLE_MS
      if (now - lastInvalidationRef.current < THROTTLE_MS) {
        console.log("Queue update throttled, skipping refetch")
        return
      }
      
      lastInvalidationRef.current = now
      console.log("Queue updated event received:", event)

      // Invalidate queue-related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
    },
    [queryClient]
  )

  useEffect(() => {
    if (!enabled || polyIds.length === 0) return

    const echo = getEcho()
    if (!echo) return

    const channels = polyIds.map((polyId) => {
      const channelName = `queue.poly.${polyId}`
      console.log(`Subscribing to realtime channel: ${channelName}`)
      
      const channel = echo.channel(channelName)
      channel.listen("queue.updated", handleQueueUpdated)
      
      return { channelName, channel }
    })

    return () => {
      channels.forEach(({ channelName, channel }) => {
        console.log(`Unsubscribing from realtime channel: ${channelName}`)
        channel.stopListening("queue.updated", handleQueueUpdated)
        echo.leaveChannel(channelName)
      })
    }
  }, [polyIds, enabled, handleQueueUpdated])
}
