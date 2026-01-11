// ============================================
// API Response Types
// ============================================
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

// Alternative paginated response format used by some endpoints
export interface PaginatedDataResponse<T> {
  status: "success" | "error"
  message?: string
  data: {
    current_page: number
    data: T[]
    first_page_url: string
    from: number | null
    last_page: number
    last_page_url: string
    links: PaginationLink[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number | null
    total: number
  }
}

export interface PaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

// ============================================
// Auth Types
// ============================================
export interface User {
  id: number
  name: string
  username: string
  email: string
  email_verified_at: string | null
  poly_id: number | null
  poly: Poly | null
  roles: Role[]
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
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

export interface PermanentTokenResponse {
  status: "success" | "error"
  message: string
  data?: {
    token_name: string
    token: string
  }
}

// ============================================
// Master Data Types
// ============================================
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

export interface Status {
  id: number
  status_name: string
  label: string
  information: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface StatusRequest {
  status_name: string
  label: string
  information: string
}

export interface Schedule {
  id: number
  doctor_id: number
  date: string
  start_time: string
  end_time: string
  quota?: number | null
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
  quota?: number | null
}

// ============================================
// Patient Types (Backend-aligned)
// ============================================
export interface Patient {
  id: number
  patient_name: string
  no_bpjs: string | null
  whatsapp_number: string
  email: string | null
  chat_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PatientUpdateRequest {
  patient_name: string
  whatsapp_number: string
  no_bpjs?: string | null
  email?: string | null
}

// ============================================
// Queue Types (Backend-aligned)
// ============================================
export type QueueStatusName =
  | "WAITING"
  | "ANAMNESA"
  | "WAITING_DOCTOR"
  | "WITH_DOCTOR"
  | "DONE"
  | "NO_SHOW"
  | "CANCELLED"

// Keep for backward compatibility during migration
export type QueueStatus = QueueStatusName

export interface Queue {
  id: number
  reservation_id: number
  poly_id: number
  queue_number: number | string
  date: string
  re_reservation_time: string
  call_time: string | null
  number_of_calls?: number
  notification_status?: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  reservation?: Reservation
}

export interface QueueListParams {
  poly_id?: number
  status_id?: number
  date?: string
  page?: number
  per_page?: number
}

export interface CurrentQueueResponse {
  status: "success" | "error"
  message: string
  queue_number_anamnesa: number | null
  queue_number_with_doctor: number | null
}

export interface CallNextQueueRequest {
  poly_id: string | number
  date: string
}

export interface CallNextQueueResponse {
  status: "success" | "error"
  message: string
  queue_number_with_doctor: number | null
  webhook_status?: string
  webhook_message?: string
  data?: {
    finished: Reservation | null
    current: Reservation | null
  }
}

// ============================================
// Reservation Types
// ============================================
export interface Reservation {
  id: number
  patient_id: number
  poly_id: number
  schedule_id: number | null
  date: string
  bpjs: boolean
  status_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  patient?: Patient
  queue?: Queue
  status?: Status
  poly?: Poly
}

export interface ReservationListParams {
  page?: number
  per_page?: number
  poly_id?: number
  status_id?: number
  date?: string
  search?: string
}

export interface ReservationCreateRequest {
  patient_name: string
  no_bpjs?: string | null
  whatsapp_number: string
  email?: string | null
  poly_id: number
  schedule_id?: number | null
  bpjs: boolean
  date: string
}

export interface ReservationUpdateRequest {
  patient_name: string
  no_bpjs?: string | null
  whatsapp_number: string
  email?: string | null
  poly_id: number
  bpjs: boolean
  date: string
}

export interface ReservationCreateResponse {
  status: "success" | "error"
  message: string
  data?: {
    patient: Patient
    reservation: Reservation
    queue: Queue
  }
}

export interface ReservationTransitionResponse {
  status: "success" | "error"
  message: string
  webhook_status?: string
  webhook_message?: string
  data?: {
    queue_number?: number
    number_of_calls?: number
    call_time?: string
    reservation: Reservation
  }
}

export type ReservationTransitionAction =
  | "anamnesa"
  | "waitingdoctor"
  | "withdoctor"
  | "done"
  | "noshow"
  | "cancelled"

// ============================================
// Configuration Types
// ============================================
export interface MessageTemplate {
  id: number
  template_name: string
  message: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MessageTemplateRequest {
  template_name: string
  message: string
}

export interface ReminderConfig {
  id: number
  message_template_id: number
  reminder_offset: number
  reminder_patient_count: number
  reminder_type: "QUEUE" | string
  created_at: string
  updated_at: string
  deleted_at: string | null
  message_template?: MessageTemplate
}

export interface ReminderConfigRequest {
  message_template_id: number
  reminder_offset: number
  reminder_patient_count: number
  reminder_type: string
}

export interface WhatsappConfig {
  id: number
  whatsapp_number: string
  waha_api_url: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WhatsappConfigRequest {
  whatsapp_number: string
  waha_api_url: string
}

export interface Config {
  id: number
  name: string
  value: string
  created_at: string | null
  updated_at: string
  deleted_at: string | null
}

export interface ConfigRequest {
  name: string
  value: string
}

export interface Faq {
  id: number
  name: string
  file: string
  directory?: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CheckupSchedule {
  id: number
  patient_id: number
  poly_id: number
  date: string
  description: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  patient?: Patient
  poly?: Poly
}

export interface CheckupScheduleRequest {
  patient_id: number
  poly_id: number
  date: string
  description: string
}

export interface CheckupScheduleListParams {
  search?: string
  patient_id?: number
  poly_id?: number
  date?: string
  page?: number
  per_page?: number
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardSummaryItem {
  name: string
  value: number
}

export interface DashboardSummaryParams {
  date?: string
  poly_id?: number
}

export interface DashboardTrendParams {
  year?: number
  month?: number
  day?: number
  poly_id?: number
}

export interface DashboardTrendItem {
  label: string
  [polyName: string]: string | number // dynamic poly names as keys
}

export interface DashboardReservationsByPolyItem {
  name: string
  value: number
}

export interface DashboardPatientAttendance {
  summary: {
    attended: number
    not_attended: number
    total: number
    attendance_rate: number
  }
  chart: Array<{
    name: string
    value: number
  }>
}

export interface DashboardAverageWaitingTimeItem {
  name: string
  avg_waiting_time: string
}

export interface DashboardPeakHoursParams {
  date?: string
  poly_id?: number
}

export interface DashboardPeakHourItem {
  hour: string
  value: number
}

export interface DashboardBpjsVsGeneralItem {
  label: string
  bpjs: number
  general: number
}

// ============================================
// Report Types
// ============================================
export interface ReportParams {
  date_from?: string
  date_to?: string
  poly_id?: number
  insurance_type?: "BPJS" | "GENERAL"
  status?: number[]
  user_id?: number
  page?: number
  per_page?: number
}

export interface ReportPagination {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface PatientVisitReportItem {
  date: string
  reservation_number: number
  patient_name: string
  poly: string
  insurance_type: "BPJS" | "GENERAL"
  status: string
  registration_time: string
  call_time: string | null
  waiting_time_minutes: number | null
}

export interface NoShowCancelledReportItem {
  date: string
  poly: string
  total_reservations: number
  no_show: number
  cancelled: number
  ratio_percent: number
}

export interface BpjsVsGeneralReportItem {
  date: string
  poly: string
  total_bpjs: number
  total_general: number
  bpjs_percentage: number
  general_percentage: number
}

export interface PolyPerformanceReportItem {
  date: string
  poly: string
  total_patients: number
  average_waiting_time_minutes: number | null
  no_show_rate_percent: number
  peak_hour: string
}

export interface WaitingTimeReportItem {
  date: string
  poly: string
  average_waiting_time_minutes: number | null
  longest_waiting_time_minutes: number | null
  fastest_waiting_time_minutes: number | null
}

export interface BusyHourReportItem {
  date: string
  poly: string
  total_reservations: number
  [hour: string]: string | number // dynamic hour keys like "06:00", "07:00", etc.
}

export interface UserActivityReportItem {
  user: string
  role: string
  activity: string
  date: string
  reservation_id: number
}

export interface ReportResponse<T> {
  status: "success" | "error"
  message: string
  data: T[]
  pagination: ReportPagination
}

// ============================================
// Realtime Types
// ============================================
export interface QueueBroadcastResponse {
  status: "success" | "error"
  message: string
  data?: {
    queue_number_anamnesa: number | null
    queue_number_with_doctor: number | null
  }
}

export interface QueueUpdatedEvent {
  queue_number_anamnesa: number | null
  queue_number_with_doctor: number | null
}

// ============================================
// Legacy types for backward compatibility
// Keep these during migration, remove later
// ============================================
/** @deprecated Use Patient with backend fields instead */
export interface LegacyPatient {
  id: number
  name: string
  nik: string
  phone: string
  birth_date: string
  address?: string
  bpjs_number?: string
  created_at: string
  updated_at: string
}

/** @deprecated Use reservation/queue workflow instead */
export interface LegacyQueue {
  id: number
  queue_number: string
  patient_id: number
  patient: LegacyPatient
  poly_id: number
  poly: Poly
  doctor_id: number
  doctor: User
  schedule_id: number
  schedule: Schedule
  status: QueueStatus
  check_in_time: string
  anamnesa_time: string | null
  consultation_time: string | null
  done_time: string | null
  queue_date: string
  notes?: string
  status_history: QueueStatusHistory[]
  created_at: string
  updated_at: string
}

/** @deprecated Use ReservationTransitionAction instead */
export interface QueueStatusHistory {
  status: QueueStatus
  changed_at: string
  changed_by: number
  changed_by_name: string
  notes?: string
}

/** @deprecated Use ReservationCreateRequest instead */
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

/** @deprecated Use reservation transition endpoints instead */
export interface QueueUpdateStatusRequest {
  status: QueueStatus
}
