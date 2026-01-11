import { api } from "@/lib/axios"
import type { ApiResponse, CheckupSchedule, CheckupScheduleListParams, CheckupScheduleRequest } from "@/types"

interface CheckupScheduleListResponse {
  status: "success" | "error"
  message: string
  data: CheckupSchedule[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export const checkupScheduleService = {
  getAll: async (params?: CheckupScheduleListParams) => {
    const response = await api.get<CheckupScheduleListResponse>("/api/checkup-schedule", { params })
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
