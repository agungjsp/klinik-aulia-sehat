import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedDataResponse, ReminderConfig, ReminderConfigRequest } from "@/types"

export interface ReminderConfigListParams {
  page?: number
  per_page?: number
}

export const reminderConfigService = {
  getAll: async (params?: ReminderConfigListParams) => {
    const response = await api.get<PaginatedDataResponse<ReminderConfig>>("/api/reminder-configs", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<ReminderConfig>>(`/api/reminder-configs/${id}`)
    return response.data
  },

  create: async (data: ReminderConfigRequest) => {
    const response = await api.post<ApiResponse<ReminderConfig>>("/api/reminder-configs", data)
    return response.data
  },

  update: async (id: number, data: ReminderConfigRequest) => {
    const response = await api.put<ApiResponse<ReminderConfig>>(`/api/reminder-configs/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/reminder-configs/${id}`)
    return response.data
  },
}
