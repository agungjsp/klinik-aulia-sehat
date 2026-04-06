import { api } from "@/lib/axios"
import type { ApiResponse, CheckupSchedule, CheckupScheduleListParams, CheckupScheduleRequest, PaginatedResponse } from "@/types"

export const checkupScheduleService = {
  getAll: async (params?: CheckupScheduleListParams) => {
    const response = await api.get<PaginatedResponse<CheckupSchedule>>("/api/checkup-schedule", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<CheckupSchedule>>(`/api/checkup-schedule/${id}`)
    return response.data
  },

  create: async (data: CheckupScheduleRequest) => {
    const response = await api.post<ApiResponse<CheckupSchedule>>("/api/checkup-schedule", data)
    return response.data
  },

  update: async (id: number, data: CheckupScheduleRequest) => {
    const response = await api.put<ApiResponse<CheckupSchedule>>(`/api/checkup-schedule/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/checkup-schedule/${id}`)
    return response.data
  },
}
