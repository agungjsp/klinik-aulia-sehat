import { api } from "@/lib/axios"
import { isAxiosError } from "axios"
import type {
  ApiResponse,
  PaginatedDataResponse,
  Reservation,
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationListParams,
  ReservationTransitionAction,
  ReservationTransitionResponse,
  ReservationUpdateRequest,
} from "@/types"

interface MaxCallsErrorResponse {
  status: "error"
  message: string
  data?: {
    number_of_calls: number
  }
}

export const reservationService = {
  getAll: async (params?: ReservationListParams) => {
    const response = await api.get<PaginatedDataResponse<Reservation>>("/api/reservation", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ reservation: Reservation }>>(`/api/reservation/${id}`)
    return response.data
  },

  create: async (data: ReservationCreateRequest) => {
    const response = await api.post<ReservationCreateResponse>("/api/reservation", data)
    return response.data
  },

  update: async (id: number, data: ReservationUpdateRequest) => {
    const response = await api.put<ApiResponse<{ patient: import("@/types").Patient; reservation: Reservation }>>(
      `/api/reservation/${id}`,
      data
    )
    return response.data
  },

  /**
   * Transition reservation to a new status using workflow endpoints
   * Note: The API endpoint uses /api/queue/{id} but {id} is actually the reservation ID
   */
  transition: async (reservationId: number, action: ReservationTransitionAction) => {
    const response = await api.patch<ReservationTransitionResponse>(`/api/queue/${reservationId}/${action}`)
    return response.data
  },

  /**
   * Transition with auto-noshow handling for max calls exceeded
   * When API returns "Maximum number of calls reached", automatically mark as NO_SHOW
   * Note: The API endpoint uses /api/queue/{id} but {id} is actually the reservation ID
   */
  transitionWithAutoNoShow: async (reservationId: number, action: ReservationTransitionAction) => {
    try {
      const response = await api.patch<ReservationTransitionResponse>(`/api/queue/${reservationId}/${action}`)
      return { ...response.data, autoNoShow: false }
    } catch (error) {
      if (isAxiosError<MaxCallsErrorResponse>(error)) {
        const errorData = error.response?.data
        if (errorData?.message?.includes("Maximum number of calls reached")) {
          // Automatically transition to NO_SHOW
          const noShowResponse = await api.patch<ReservationTransitionResponse>(`/api/queue/${reservationId}/noshow`)
          return { ...noShowResponse.data, autoNoShow: true }
        }
      }
      throw error
    }
  },

  // Convenience methods for each transition
  toAnamnesa: async (id: number) => reservationService.transitionWithAutoNoShow(id, "anamnesa"),
  toWaitingDoctor: async (id: number) => reservationService.transition(id, "waitingdoctor"),
  toWithDoctor: async (id: number) => reservationService.transitionWithAutoNoShow(id, "withdoctor"),
  toDone: async (id: number) => reservationService.transition(id, "done"),
  toNoShow: async (id: number) => reservationService.transition(id, "noshow"),
  toCancelled: async (id: number) => reservationService.transition(id, "cancelled"),
}
