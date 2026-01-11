import { api } from "@/lib/axios"
import type { ApiResponse, Status, StatusRequest } from "@/types"

export const statusService = {
  getAll: async (search?: string) => {
    const params = search ? { search } : {}
    const response = await api.get<ApiResponse<Status[]>>("/api/status", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Status>>(`/api/status/${id}`)
    return response.data
  },

  create: async (data: StatusRequest) => {
    const response = await api.post<ApiResponse<Status>>("/api/status", data)
    return response.data
  },

  update: async (id: number, data: StatusRequest) => {
    const response = await api.put<ApiResponse<Status>>(`/api/status/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/status/${id}`)
    return response.data
  },

  getTrashed: async () => {
    const response = await api.get<ApiResponse<Status[]>>("/api/status/trashed")
    return response.data
  },

  restore: async (id: number) => {
    const response = await api.post<ApiResponse<Status>>(`/api/status/${id}/restore`)
    return response.data
  },
}
