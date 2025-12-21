import { api } from "@/lib/axios"
import type { ApiResponse, Role } from "@/types"

export const roleService = {
  getAll: async (search?: string) => {
    const params = search ? { search } : {}
    const response = await api.get<ApiResponse<Role[]>>("/api/roles", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Role>>(`/api/roles/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Role>>("/api/roles", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Role>>(`/api/roles/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/roles/${id}`)
    return response.data
  },

  getTrashed: async () => {
    const response = await api.get<ApiResponse<Role[]>>("/api/roles/trashed")
    return response.data
  },

  restore: async (id: number) => {
    const response = await api.post<ApiResponse<Role>>(`/api/roles/${id}/restore`)
    return response.data
  },
}
