import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queueService } from "@/services/queue"
import type { QueueCreateRequest, QueueUpdateStatusRequest, QueueStatus } from "@/types"

interface QueueListParams {
  date?: string
  poly_id?: number
  doctor_id?: number
  status?: QueueStatus
}

export const useQueueList = (params?: QueueListParams) => {
  return useQuery({
    queryKey: ["queues", params],
    queryFn: () => queueService.getAll(params),
    refetchInterval: 30000, // Auto refresh every 30s
  })
}

export const useQueueCreate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QueueCreateRequest) => queueService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["queues"] }),
  })
}

export const useQueueUpdateStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QueueUpdateStatusRequest }) =>
      queueService.updateStatus(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["queues"] }),
  })
}

export const useQueueDelete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => queueService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["queues"] }),
  })
}
