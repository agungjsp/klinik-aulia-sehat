import { api } from "@/lib/axios"
import type { ApiResponse, Role } from "@/types"

// TODO: Remove mock data after BE credentials confirmed
const MOCK_ROLES: Role[] = [
  { id: 1, name: "Super Admin", created_at: "2025-12-13T11:44:46.000000Z", updated_at: "2025-12-13T11:44:46.000000Z", deleted_at: null },
  { id: 2, name: "Admin", created_at: "2025-12-13T12:01:21.000000Z", updated_at: "2025-12-13T12:01:21.000000Z", deleted_at: null },
  { id: 3, name: "Dokter", created_at: "2025-12-13T13:49:27.000000Z", updated_at: "2025-12-13T13:49:27.000000Z", deleted_at: null },
  { id: 4, name: "Resepsionis", created_at: "2025-12-14T10:00:00.000000Z", updated_at: "2025-12-14T10:00:00.000000Z", deleted_at: null },
]

const MOCK_TRASHED: Role[] = []

const USE_MOCK = true // TODO: Set to false after BE credentials confirmed

export const roleService = {
  getAll: async (search?: string) => {
    if (USE_MOCK) {
      const filtered = search
        ? MOCK_ROLES.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
        : MOCK_ROLES
      return { status: "success" as const, data: filtered }
    }
    const params = search ? { search } : {}
    const response = await api.get<ApiResponse<Role[]>>("/api/roles", { params })
    return response.data
  },

  getById: async (id: number) => {
    if (USE_MOCK) {
      const role = MOCK_ROLES.find((r) => r.id === id)
      if (!role) throw new Error("Role not found")
      return { status: "success" as const, data: role }
    }
    const response = await api.get<ApiResponse<Role>>(`/api/roles/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    if (USE_MOCK) {
      const newRole: Role = {
        id: Math.max(...MOCK_ROLES.map((r) => r.id)) + 1,
        name: data.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }
      MOCK_ROLES.push(newRole)
      return { status: "success" as const, message: "Role created successfully", data: newRole }
    }
    const response = await api.post<ApiResponse<Role>>("/api/roles", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    if (USE_MOCK) {
      const idx = MOCK_ROLES.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error("Role not found")
      MOCK_ROLES[idx] = { ...MOCK_ROLES[idx], ...data, updated_at: new Date().toISOString() }
      return { status: "success" as const, message: "Role updated successfully", data: MOCK_ROLES[idx] }
    }
    const response = await api.put<ApiResponse<Role>>(`/api/roles/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    if (USE_MOCK) {
      const idx = MOCK_ROLES.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error("Role not found")
      const [deleted] = MOCK_ROLES.splice(idx, 1)
      deleted.deleted_at = new Date().toISOString()
      MOCK_TRASHED.push(deleted)
      return { status: "success" as const, message: "Role deleted successfully" }
    }
    const response = await api.delete<ApiResponse<null>>(`/api/roles/${id}`)
    return response.data
  },

  getTrashed: async () => {
    if (USE_MOCK) {
      return { status: "success" as const, data: MOCK_TRASHED }
    }
    const response = await api.get<ApiResponse<Role[]>>("/api/roles/trashed")
    return response.data
  },

  restore: async (id: number) => {
    if (USE_MOCK) {
      const idx = MOCK_TRASHED.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error("Role not found or not deleted")
      const [restored] = MOCK_TRASHED.splice(idx, 1)
      restored.deleted_at = null
      restored.updated_at = new Date().toISOString()
      MOCK_ROLES.push(restored)
      return { status: "success" as const, message: "Role restored successfully", data: restored }
    }
    const response = await api.post<ApiResponse<Role>>(`/api/roles/${id}/restore`)
    return response.data
  },
}
