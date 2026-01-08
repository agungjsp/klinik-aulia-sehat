import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse, Patient } from "@/types"

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
  name?: string
  nik?: string
  phone?: string
  birth_date?: string
  address?: string
  bpjs_number?: string
}

export interface PatientSearchParams {
  search?: string
  nik?: string
  page?: number
  per_page?: number
}

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK = true // Set to false when backend is ready

const mockPatients: Patient[] = [
  { id: 1, name: "Siti Nurhaliza", nik: "3301234567890001", phone: "081234567890", birth_date: "1990-01-15", address: "Jl. Merdeka No. 10, Semarang", bpjs_number: "0001234567890", created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: 2, name: "Budi Santoso", nik: "3301234567890002", phone: "081234567891", birth_date: "1985-05-20", address: "Jl. Pahlawan No. 5, Semarang", bpjs_number: "0001234567891", created_at: "2024-01-02", updated_at: "2024-01-02" },
  { id: 3, name: "Agus Hermanto", nik: "3301234567890003", phone: "081234567892", birth_date: "1978-10-08", address: "Jl. Sudirman No. 25, Semarang", created_at: "2024-01-03", updated_at: "2024-01-03" },
  { id: 4, name: "Dewi Lestari", nik: "3301234567890004", phone: "081234567893", birth_date: "1992-03-25", address: "Jl. Ahmad Yani No. 100, Semarang", bpjs_number: "0001234567893", created_at: "2024-01-04", updated_at: "2024-01-04" },
  { id: 5, name: "Hendra Wijaya", nik: "3301234567890005", phone: "081234567894", birth_date: "1988-07-12", address: "Jl. Diponegoro No. 55, Semarang", created_at: "2024-01-05", updated_at: "2024-01-05" },
  { id: 6, name: "Maya Sari", nik: "3301234567890006", phone: "081234567895", birth_date: "2000-02-14", address: "Jl. Pemuda No. 30, Semarang", bpjs_number: "0001234567895", created_at: "2024-01-06", updated_at: "2024-01-06" },
  { id: 7, name: "Rendra Kusuma", nik: "3301234567890007", phone: "081234567896", birth_date: "1995-11-08", address: "Jl. Gajahmada No. 12, Semarang", created_at: "2024-01-07", updated_at: "2024-01-07" },
  { id: 8, name: "Kartini Rahayu", nik: "3301234567890008", phone: "081234567897", birth_date: "1955-04-21", address: "Jl. Kartini No. 1, Semarang", bpjs_number: "0001234567897", created_at: "2024-01-08", updated_at: "2024-01-08" },
  { id: 9, name: "Ahmad Fadli", nik: "3301234567890009", phone: "081234567898", birth_date: "1970-08-17", address: "Jl. Veteran No. 45, Semarang", created_at: "2024-01-09", updated_at: "2024-01-09" },
  { id: 10, name: "Rina Marlina", nik: "3301234567890010", phone: "081234567899", birth_date: "1983-12-01", address: "Jl. MT Haryono No. 88, Semarang", bpjs_number: "0001234567899", created_at: "2024-01-10", updated_at: "2024-01-10" },
]

// ============================================
// PATIENT SERVICE
// ============================================
export const patientService = {
  getAll: async (params?: PatientSearchParams): Promise<PaginatedResponse<Patient>> => {
    if (USE_MOCK) {
      let filtered = [...mockPatients]
      
      // Filter by search (name or NIK)
      if (params?.search) {
        const q = params.search.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.nik.includes(q) ||
          p.phone.includes(q)
        )
      }
      
      // Filter by exact NIK
      if (params?.nik) {
        filtered = filtered.filter(p => p.nik === params.nik)
      }
      
      const page = params?.page || 1
      const per_page = params?.per_page || 10
      const start = (page - 1) * per_page
      const paginated = filtered.slice(start, start + per_page)
      
      return {
        status: "success",
        data: paginated,
        meta: {
          current_page: page,
          last_page: Math.ceil(filtered.length / per_page),
          per_page,
          total: filtered.length,
        }
      }
    }
    
    const response = await api.get<PaginatedResponse<Patient>>("/api/patients", { params })
    return response.data
  },

  searchByNik: async (nik: string): Promise<Patient | null> => {
    if (USE_MOCK) {
      const found = mockPatients.find(p => p.nik === nik)
      return found ?? null
    }
    
    try {
      const response = await api.get<ApiResponse<Patient>>(`/api/patients/nik/${nik}`)
      return response.data.data ?? null
    } catch {
      return null
    }
  },

  getById: async (id: number): Promise<ApiResponse<Patient>> => {
    if (USE_MOCK) {
      const patient = mockPatients.find(p => p.id === id)
      if (!patient) throw new Error("Patient not found")
      return { status: "success", data: patient, message: "Success" }
    }
    
    const response = await api.get<ApiResponse<Patient>>(`/api/patients/${id}`)
    return response.data
  },

  create: async (data: PatientCreateRequest): Promise<ApiResponse<Patient>> => {
    if (USE_MOCK) {
      const newPatient: Patient = {
        id: mockPatients.length + 1,
        name: data.name,
        nik: data.nik,
        phone: data.phone,
        birth_date: data.birth_date,
        address: data.address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockPatients.push(newPatient)
      return { status: "success", data: newPatient, message: "Patient created successfully" }
    }
    
    const response = await api.post<ApiResponse<Patient>>("/api/patients", data)
    return response.data
  },

  update: async (id: number, data: PatientUpdateRequest): Promise<ApiResponse<Patient>> => {
    if (USE_MOCK) {
      const index = mockPatients.findIndex(p => p.id === id)
      if (index === -1) throw new Error("Patient not found")
      
      mockPatients[index] = { 
        ...mockPatients[index], 
        ...data, 
        updated_at: new Date().toISOString() 
      }
      return { status: "success", data: mockPatients[index], message: "Patient updated successfully" }
    }
    
    const response = await api.put<ApiResponse<Patient>>(`/api/patients/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    if (USE_MOCK) {
      const index = mockPatients.findIndex(p => p.id === id)
      if (index !== -1) mockPatients.splice(index, 1)
      return { status: "success", data: null, message: "Patient deleted successfully" }
    }
    
    const response = await api.delete<ApiResponse<null>>(`/api/patients/${id}`)
    return response.data
  },
}
