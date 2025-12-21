import { api } from "@/lib/axios"
import type { ApiResponse, Poly } from "@/types"

export const polyService = {
  getAll: async (search?: string) => {
    const params = search ? { search } : {}
    const response = await api.get<ApiResponse<Poly[]>>("/api/poly", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Poly>>(`/api/poly/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    const response = await api.post<ApiResponse<Poly>>("/api/poly", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    const response = await api.put<ApiResponse<Poly>>(`/api/poly/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/poly/${id}`)
    return response.data
  },

  getTrashed: async () => {
    const response = await api.get<ApiResponse<Poly[]>>("/api/poly/trashed")
    return response.data
  },

  restore: async (id: number) => {
    const response = await api.post<ApiResponse<Poly>>(`/api/poly/${id}/restore`)
    return response.data
  },
}
