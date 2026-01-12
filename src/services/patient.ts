import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedDataResponse, Patient } from "@/types"

// ============================================
// REQUEST INTERFACES
// ============================================
export interface PatientCreateRequest {
  name: string
  nik: string
  phone: string
  birth_date: string
  address?: string
  bpjs_number?: string
}

export interface PatientUpdateRequest {
  patient_name: string
  whatsapp_number: string
  no_bpjs?: string | null
  email?: string | null
}

export interface PatientSearchParams {
  search?: string
  nik?: string
  page?: number
  per_page?: number
}

// ============================================
// PATIENT SERVICE
// ============================================
export const patientService = {
  getAll: async (params?: PatientSearchParams): Promise<PaginatedDataResponse<Patient>> => {
    const response = await api.get<PaginatedDataResponse<Patient>>("/api/patients", { params })
    return response.data
  },

  searchByNik: async (nik: string): Promise<Patient | null> => {
    try {
      const response = await api.get<ApiResponse<Patient>>(`/api/patients/nik/${nik}`)
      return response.data.data ?? null
    } catch {
      return null
    }
  },

  getById: async (id: number): Promise<ApiResponse<Patient>> => {
    const response = await api.get<ApiResponse<Patient>>(`/api/patients/${id}`)
    return response.data
  },

  create: async (data: PatientCreateRequest): Promise<ApiResponse<Patient>> => {
    const response = await api.post<ApiResponse<Patient>>("/api/patients", data)
    return response.data
  },

  update: async (id: number, data: PatientUpdateRequest): Promise<ApiResponse<Patient>> => {
    const response = await api.put<ApiResponse<Patient>>(`/api/patients/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/api/patients/${id}`)
    return response.data
  },
}
