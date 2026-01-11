import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedDataResponse, Patient, PatientUpdateRequest } from "@/types"

export interface PatientListParams {
  search?: string
  page?: number
  per_page?: number
}

export const patientService = {
  getAll: async (params?: PatientListParams) => {
    const response = await api.get<PaginatedDataResponse<Patient>>("/api/patients", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Patient>>(`/api/patients/${id}`)
    return response.data
  },

  update: async (id: number, data: PatientUpdateRequest) => {
    const response = await api.put<ApiResponse<Patient>>(`/api/patients/${id}`, data)
    return response.data
  },
}
