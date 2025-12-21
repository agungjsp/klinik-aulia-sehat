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
