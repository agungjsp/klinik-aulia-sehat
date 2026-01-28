import { api } from "@/lib/axios"
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

export const reservationService = {
  getAll: async (params?: ReservationListParams) => {
    const response = await api.get<PaginatedDataResponse<Reservation>>("/api/reservations", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ reservation: Reservation }>>(`/api/reservations/${id}`)
    return response.data
  },

  create: async (data: ReservationCreateRequest) => {
    const response = await api.post<ReservationCreateResponse>("/api/reservations", data)
    return response.data
  },

  update: async (id: number, data: ReservationUpdateRequest) => {
    const response = await api.put<ApiResponse<{ patient: import("@/types").Patient; reservation: Reservation }>>(
      `/api/reservations/${id}`,
      data
    )
    return response.data
  },

  /**
   * Transition reservation to a new status using workflow endpoints
   */
  transition: async (id: number, action: ReservationTransitionAction) => {
    const response = await api.patch<ReservationTransitionResponse>(`/api/reservations/${id}/status`, {
      status: action,
    })
    return response.data
  },

  // Convenience methods for each transition
  toAnamnesa: async (id: number) => reservationService.transition(id, "anamnesa"),
  toWaitingDoctor: async (id: number) => reservationService.transition(id, "waitingdoctor"),
  toWithDoctor: async (id: number) => reservationService.transition(id, "withdoctor"),
  toDone: async (id: number) => reservationService.transition(id, "done"),
  toNoShow: async (id: number) => reservationService.transition(id, "noshow"),
  toCancelled: async (id: number) => reservationService.transition(id, "cancelled"),
}
