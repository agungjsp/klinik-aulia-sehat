import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queueService } from "@/services"
import type { CallNextQueueRequest, QueueListParams } from "@/types"

export const queueKeys = {
  all: ["queue"] as const,
  list: (params?: QueueListParams) => [...queueKeys.all, "list", params] as const,
  current: (params: { poly_id: number; date: string }) => [...queueKeys.all, "current", params] as const,
}

export function useQueueList(params?: QueueListParams) {
  return useQuery({
    queryKey: queueKeys.list(params),
    queryFn: () => queueService.getAll(params),
    staleTime: 10 * 1000, // 10 seconds - prevents duplicate fetches
    refetchInterval: 30000, // Auto refresh every 30s
    placeholderData: (previousData) => previousData,
  })
}

export function useCurrentQueue(params: { poly_id: number; date: string } | null) {
  return useQuery({
    queryKey: queueKeys.current(params!),
    queryFn: () => queueService.getCurrent(params!),
    enabled: params !== null,
    refetchInterval: 10000, // Refresh every 10s for display screens
  })
}

export function useCallNextQueue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CallNextQueueRequest) => queueService.callNext(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all })
      queryClient.invalidateQueries({ queryKey: ["reservation"] })
    },
  })
}

export function useBroadcastCurrentQueue() {
  return useMutation({
    mutationFn: () => queueService.broadcastCurrent(),
  })
}
