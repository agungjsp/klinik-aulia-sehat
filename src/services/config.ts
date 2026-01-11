import { api } from "@/lib/axios"
import type { ApiResponse, Config, ConfigRequest } from "@/types"

export const configService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Config[]>>("/api/configs")
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Config>>(`/api/configs/${id}`)
    return response.data
  },

  create: async (data: ConfigRequest) => {
    const response = await api.post<ApiResponse<Config>>("/api/configs", data)
    return response.data
  },

  update: async (id: number, data: ConfigRequest) => {
    const response = await api.put<ApiResponse<Config>>(`/api/configs/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/configs/${id}`)
    return response.data
  },
}
