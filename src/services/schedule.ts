import { api } from "@/lib/axios"
import type { ApiResponse, Schedule, ScheduleRequest } from "@/types"

interface ScheduleListParams {
  doctor_id?: number
  date?: string
  month?: number
  year?: number
}

export const scheduleService = {
  getAll: async (params?: ScheduleListParams) => {
    const { data } = await api.get<ApiResponse<Schedule[]>>("/api/schedule", { params })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ApiResponse<Schedule>>(`/api/schedule/${id}`)
    return data
  },

  create: async (payload: ScheduleRequest) => {
    const { data } = await api.post<ApiResponse<Schedule>>("/api/schedule", payload)
    return data
  },

  update: async (id: number, payload: ScheduleRequest) => {
    const { data } = await api.put<ApiResponse<Schedule>>(`/api/schedule/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/api/schedule/${id}`)
    return data
  },
}
