import { api } from "@/lib/axios"
import type {
  CallNextQueueRequest,
  CallNextQueueResponse,
  CurrentQueueResponse,
  PaginatedDataResponse,
  Queue,
  QueueBroadcastResponse,
  QueueListParams,
} from "@/types"

export const queueService = {
  /**
   * Get paginated queue list with filters
   */
  getAll: async (params?: QueueListParams) => {
    const response = await api.get<PaginatedDataResponse<Queue>>("/api/queue", { params })
    return response.data
  },

  /**
   * Get current queue numbers for a poly on a specific date
   * Returns the queue numbers currently in ANAMNESA and WITH_DOCTOR statuses
   */
  getCurrent: async (params: { poly_id: number; date: string }) => {
    const response = await api.get<CurrentQueueResponse>("/api/queue/current", { params })
    return response.data
  },

  /**
   * Call the next patient in queue
   * - Finishes current WITH_DOCTOR queue (status 4 → 5)
   * - Calls next WAITING_DOCTOR queue (status 3 → 4)
   */
  callNext: async (data: CallNextQueueRequest) => {
    const response = await api.patch<CallNextQueueResponse>("/api/queue/call-next", data)
    return response.data
  },

  /**
   * Broadcast current queue status via Laravel Reverb
   * Useful for triggering manual updates to display screens
   */
  broadcastCurrent: async () => {
    const response = await api.post<QueueBroadcastResponse>("/api/queue/current/broadcast")
    return response.data
  },
}
