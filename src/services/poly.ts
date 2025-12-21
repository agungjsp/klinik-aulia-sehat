import { api } from "@/lib/axios"
import type { ApiResponse, Poly } from "@/types"

// TODO: Remove mock data after BE credentials confirmed
const MOCK_POLI: Poly[] = [
  { id: 1, name: "Poli Umum", created_at: "2025-12-13T12:28:59.000000Z", updated_at: "2025-12-13T12:28:59.000000Z", deleted_at: null },
  { id: 2, name: "Poli Gigi", created_at: "2025-12-13T12:29:53.000000Z", updated_at: "2025-12-13T12:29:53.000000Z", deleted_at: null },
  { id: 3, name: "Poli Anak", created_at: "2025-12-14T10:00:00.000000Z", updated_at: "2025-12-14T10:00:00.000000Z", deleted_at: null },
]

const MOCK_TRASHED: Poly[] = [
  { id: 4, name: "Poli Mata", created_at: "2025-12-14T10:00:00.000000Z", updated_at: "2025-12-15T10:00:00.000000Z", deleted_at: "2025-12-15T10:00:00.000000Z" },
]

const USE_MOCK = true // TODO: Set to false after BE credentials confirmed

export const polyService = {
  getAll: async (search?: string) => {
    if (USE_MOCK) {
      const filtered = search
        ? MOCK_POLI.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : MOCK_POLI
      return { status: "success" as const, data: filtered }
    }
    const params = search ? { search } : {}
    const response = await api.get<ApiResponse<Poly[]>>("/api/poly", { params })
    return response.data
  },

  getById: async (id: number) => {
    if (USE_MOCK) {
      const poly = MOCK_POLI.find((p) => p.id === id)
      if (!poly) throw new Error("Poly not found")
      return { status: "success" as const, data: poly }
    }
    const response = await api.get<ApiResponse<Poly>>(`/api/poly/${id}`)
    return response.data
  },

  create: async (data: { name: string }) => {
    if (USE_MOCK) {
      const newPoly: Poly = {
        id: Math.max(...MOCK_POLI.map((p) => p.id)) + 1,
        name: data.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }
      MOCK_POLI.push(newPoly)
      return { status: "success" as const, message: "Poly created successfully", data: newPoly }
    }
    const response = await api.post<ApiResponse<Poly>>("/api/poly", data)
    return response.data
  },

  update: async (id: number, data: { name: string }) => {
    if (USE_MOCK) {
      const idx = MOCK_POLI.findIndex((p) => p.id === id)
      if (idx === -1) throw new Error("Poly not found")
      MOCK_POLI[idx] = { ...MOCK_POLI[idx], ...data, updated_at: new Date().toISOString() }
      return { status: "success" as const, message: "Poly updated successfully", data: MOCK_POLI[idx] }
    }
    const response = await api.put<ApiResponse<Poly>>(`/api/poly/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    if (USE_MOCK) {
      const idx = MOCK_POLI.findIndex((p) => p.id === id)
      if (idx === -1) throw new Error("Poly not found")
      const [deleted] = MOCK_POLI.splice(idx, 1)
      deleted.deleted_at = new Date().toISOString()
      MOCK_TRASHED.push(deleted)
      return { status: "success" as const, message: "Poly deleted successfully" }
    }
    const response = await api.delete<ApiResponse<null>>(`/api/poly/${id}`)
    return response.data
  },

  getTrashed: async () => {
    if (USE_MOCK) {
      return { status: "success" as const, data: MOCK_TRASHED }
    }
    const response = await api.get<ApiResponse<Poly[]>>("/api/poly/trashed")
    return response.data
  },

  restore: async (id: number) => {
    if (USE_MOCK) {
      const idx = MOCK_TRASHED.findIndex((p) => p.id === id)
      if (idx === -1) throw new Error("Poly not found or not deleted")
      const [restored] = MOCK_TRASHED.splice(idx, 1)
      restored.deleted_at = null
      restored.updated_at = new Date().toISOString()
      MOCK_POLI.push(restored)
      return { status: "success" as const, message: "Poly restored successfully", data: restored }
    }
    const response = await api.post<ApiResponse<Poly>>(`/api/poly/${id}/restore`)
    return response.data
  },
}
