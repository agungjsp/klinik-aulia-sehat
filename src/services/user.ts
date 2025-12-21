import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, User } from "@/types"

// TODO: Remove mock data after BE credentials confirmed
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: "Super Admin",
    username: "superadmin",
    email: "superadmin@mail.com",
    poly_id: null,
    poly: null,
    roles: [{ id: 1, name: "Super Admin", created_at: "", updated_at: "", deleted_at: null }],
  },
  {
    id: 2,
    name: "Dr. Harris Arista",
    username: "harris",
    email: "harris@mail.com",
    poly_id: 1,
    poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null },
    roles: [{ id: 3, name: "Dokter", created_at: "", updated_at: "", deleted_at: null }],
  },
  {
    id: 3,
    name: "Siti Receptionist",
    username: "siti",
    email: "siti@mail.com",
    poly_id: null,
    poly: null,
    roles: [{ id: 4, name: "Resepsionis", created_at: "", updated_at: "", deleted_at: null }],
  },
]

const MOCK_TRASHED: User[] = []

const USE_MOCK = true // TODO: Set to false after BE credentials confirmed

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
    if (USE_MOCK) {
      let filtered = MOCK_USERS
      if (params?.search) {
        const s = params.search.toLowerCase()
        filtered = MOCK_USERS.filter(
          (u) =>
            u.name.toLowerCase().includes(s) ||
            u.username.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s)
        )
      }
      return {
        status: "success" as const,
        data: filtered,
        meta: { current_page: 1, last_page: 1, per_page: 10, total: filtered.length },
      }
    }
    const response = await api.get<PaginatedResponse<User>>("/api/users", { params })
    return response.data
  },

  getById: async (id: number) => {
    if (USE_MOCK) {
      const user = MOCK_USERS.find((u) => u.id === id)
      if (!user) throw new Error("User not found")
      return { status: "success" as const, data: user }
    }
    const response = await api.get<ApiResponse<User>>(`/api/users/${id}`)
    return response.data
  },

  create: async (data: UserCreateRequest) => {
    if (USE_MOCK) {
      const newUser: User = {
        id: Math.max(...MOCK_USERS.map((u) => u.id)) + 1,
        name: data.name,
        username: data.username,
        email: data.email,
        poly_id: data.poly_id || null,
        poly: data.poly_id ? { id: data.poly_id, name: "Poli", created_at: "", updated_at: "", deleted_at: null } : null,
        roles: data.roles.map((id) => ({ id, name: "Role", created_at: "", updated_at: "", deleted_at: null })),
      }
      MOCK_USERS.push(newUser)
      return { status: "success" as const, message: "User created successfully", data: newUser }
    }
    const response = await api.post<ApiResponse<User>>("/api/users", data)
    return response.data
  },

  update: async (id: number, data: UserUpdateRequest) => {
    if (USE_MOCK) {
      const idx = MOCK_USERS.findIndex((u) => u.id === id)
      if (idx === -1) throw new Error("User not found")
      MOCK_USERS[idx] = {
        ...MOCK_USERS[idx],
        name: data.name,
        username: data.username,
        email: data.email,
        poly_id: data.poly_id || null,
        roles: data.roles.map((rid) => ({ id: rid, name: "Role", created_at: "", updated_at: "", deleted_at: null })),
      }
      return { status: "success" as const, message: "User updated successfully", data: MOCK_USERS[idx] }
    }
    const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    if (USE_MOCK) {
      const idx = MOCK_USERS.findIndex((u) => u.id === id)
      if (idx === -1) throw new Error("User not found")
      const [deleted] = MOCK_USERS.splice(idx, 1)
      MOCK_TRASHED.push(deleted)
      return { status: "success" as const, message: "User deleted successfully" }
    }
    const response = await api.delete<ApiResponse<null>>(`/api/users/${id}`)
    return response.data
  },

  getTrashed: async (params?: { search?: string; page?: number; per_page?: number }) => {
    if (USE_MOCK) {
      return {
        status: "success" as const,
        data: MOCK_TRASHED,
        meta: { current_page: 1, last_page: 1, per_page: 10, total: MOCK_TRASHED.length },
      }
    }
    const response = await api.get<PaginatedResponse<User>>("/api/users/trashed", { params })
    return response.data
  },

  restore: async (id: number) => {
    if (USE_MOCK) {
      const idx = MOCK_TRASHED.findIndex((u) => u.id === id)
      if (idx === -1) throw new Error("User not found or not deleted")
      const [restored] = MOCK_TRASHED.splice(idx, 1)
      MOCK_USERS.push(restored)
      return { status: "success" as const, message: "User restored successfully", data: restored }
    }
    const response = await api.post<ApiResponse<User>>(`/api/users/${id}/restore`)
    return response.data
  },
}
