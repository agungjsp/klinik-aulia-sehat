// API Response Types
export interface ApiResponse<T> {
  status: "success" | "error"
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  status: "success" | "error"
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Auth Types
export interface User {
  id: number
  name: string
  username: string
  email: string
  poly_id: number | null
  poly: Poly | null
  roles: Role[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  status: "success" | "error"
  message: string
  token?: string
  type?: "Bearer"
  user?: User
}

// Master Data Types
export interface Role {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Poly {
  id: number
  name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Schedule {
  id: number
  doctor_id: number
  date: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  doctor?: User
}

export interface ScheduleRequest {
  doctor_id: number | string
  date: string
  start_time: string
  end_time: string
}


// Queue/Antrean Types
export type QueueStatus = 
  | "CHECKED_IN"       // Sudah daftar ulang (timestamp = urutan antrean)
  | "IN_ANAMNESA"      // Sedang anamnesis dengan perawat
  | "WAITING_DOCTOR"   // Selesai anamnesa, menunggu dipanggil dokter
  | "IN_CONSULTATION"  // Sedang konsultasi dengan dokter
  | "DONE"             // Selesai
  | "NO_SHOW"          // Tidak hadir
  | "CANCELLED"        // Dibatalkan

export interface Patient {
  id: number
  name: string
  nik: string
  phone: string
  birth_date: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Queue {
  id: number
  queue_number: string
  patient_id: number
  patient: Patient
  poly_id: number
  poly: Poly
  doctor_id: number
  doctor: User
  schedule_id: number
  schedule: Schedule
  status: QueueStatus
  check_in_time: string        // Waktu daftar ulang (penentu urutan)
  anamnesa_time: string | null
  consultation_time: string | null
  done_time: string | null
  queue_date: string
  notes?: string
  status_history: QueueStatusHistory[]
  created_at: string
  updated_at: string
}

export interface QueueStatusHistory {
  status: QueueStatus
  changed_at: string
  changed_by: number
  changed_by_name: string
  notes?: string
}

export interface QueueCreateRequest {
  patient_id?: number
  patient_name: string
  patient_nik: string
  patient_phone: string
  poly_id: number
  doctor_id: number
  schedule_id: number
  queue_date: string
  notes?: string
}

export interface QueueUpdateStatusRequest {
  status: QueueStatus
}
