import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, User } from "@/types"

export interface UserCreateRequest {
  name: string
  username: string
  email: string
  password: string
  password_confirmation: string
  roles: number[]
  poly_id?: number | null
}

export interface UserUpdateRequest {
  name: string
  username: string
  email: string
  password?: string
  password_confirmation?: string
  roles: number[]
  poly_id?: number | null
}

export const userService = {
  getAll: async (params?: { search?: string; page?: number; per_page?: number }) => {
    const response = await api.get<PaginatedResponse<User>>("/api/users", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<User>>(`/api/users/${id}`)
    return response.data
  },

  create: async (data: UserCreateRequest) => {
    const response = await api.post<ApiResponse<User>>("/api/users", data)
    return response.data
  },

  update: async (id: number, data: UserUpdateRequest) => {
    const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/users/${id}`)
    return response.data
  },

  getTrashed: async (params?: { search?: string; page?: number; per_page?: number }) => {
    const response = await api.get<PaginatedResponse<User>>("/api/users/trashed", { params })
    return response.data
  },

  restore: async (id: number) => {
    const response = await api.post<ApiResponse<User>>(`/api/users/${id}/restore`)
    return response.data
  },
}
