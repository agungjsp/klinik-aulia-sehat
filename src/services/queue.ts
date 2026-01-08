import type { ApiResponse, Queue, QueueCreateRequest, QueueUpdateStatusRequest, QueueStatus, QueueStatusHistory } from "@/types"
import { format } from "date-fns"

const USE_MOCK = true
const mockCurrentUser = { id: 1, name: "Admin" }

const mockPatients = [
  { id: 1, name: "Ahmad Sudirman", nik: "3201010101010001", phone: "081234567001", birth_date: "1985-03-15", address: "Jl. Merdeka No. 1", created_at: "2025-01-01", updated_at: "2025-01-01" },
  { id: 2, name: "Siti Rahayu", nik: "3201010101010002", phone: "081234567002", birth_date: "1990-07-22", address: "Jl. Sudirman No. 5", created_at: "2025-01-01", updated_at: "2025-01-01" },
  { id: 3, name: "Budi Santoso", nik: "3201010101010003", phone: "081234567003", birth_date: "1978-11-08", address: "Jl. Gatot Subroto No. 10", created_at: "2025-01-01", updated_at: "2025-01-01" },
  { id: 4, name: "Dewi Lestari", nik: "3201010101010004", phone: "081234567004", birth_date: "1995-01-30", address: "Jl. Asia Afrika No. 15", created_at: "2025-01-01", updated_at: "2025-01-01" },
  { id: 5, name: "Eko Prasetyo", nik: "3201010101010005", phone: "081234567005", birth_date: "1982-09-12", address: "Jl. Diponegoro No. 20", created_at: "2025-01-01", updated_at: "2025-01-01" },
]

const mockPoly = { id: 1, name: "Poli Umum", created_at: "2025-01-01", updated_at: "2025-01-01", deleted_at: null }
const mockDoctor = { id: 3, name: "dr. Harris Aulia", username: "harris", email: "harris@mail.com", poly_id: 1, poly: mockPoly, roles: [{ id: 2, name: "Dokter", created_at: "", updated_at: "", deleted_at: null }] }
const mockSchedule = { id: 1, doctor_id: 3, date: format(new Date(), "yyyy-MM-dd"), start_time: "08:00:00", end_time: "12:00:00", created_at: "", updated_at: "", deleted_at: null, doctor: mockDoctor }

const createHistory = (status: QueueStatus, time: string): QueueStatusHistory => ({
  status, changed_at: time, changed_by: mockCurrentUser.id, changed_by_name: mockCurrentUser.name,
})

// Updated mock data with new status names
let mockQueues: Queue[] = [
  { id: 1, queue_number: "A001", patient_id: 1, patient: mockPatients[0], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "DONE", check_in_time: "07:30:00", anamnesa_time: "07:45:00", consultation_time: "08:05:00", done_time: "08:20:00", queue_date: format(new Date(), "yyyy-MM-dd"), status_history: [createHistory("WAITING", "07:30:00"), createHistory("DONE", "08:20:00")], created_at: "", updated_at: "" },
  { id: 2, queue_number: "A002", patient_id: 2, patient: mockPatients[1], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "WITH_DOCTOR", check_in_time: "07:35:00", anamnesa_time: "07:50:00", consultation_time: "08:25:00", done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), status_history: [createHistory("WAITING", "07:35:00"), createHistory("WITH_DOCTOR", "08:25:00")], created_at: "", updated_at: "" },
  { id: 3, queue_number: "A003", patient_id: 3, patient: mockPatients[2], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "WAITING_DOCTOR", check_in_time: "07:40:00", anamnesa_time: "08:00:00", consultation_time: null, done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), status_history: [createHistory("WAITING", "07:40:00"), createHistory("WAITING_DOCTOR", "08:20:00")], created_at: "", updated_at: "" },
  { id: 4, queue_number: "A004", patient_id: 4, patient: mockPatients[3], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "ANAMNESA", check_in_time: "07:45:00", anamnesa_time: "08:30:00", consultation_time: null, done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), status_history: [createHistory("WAITING", "07:45:00"), createHistory("ANAMNESA", "08:30:00")], created_at: "", updated_at: "" },
  { id: 5, queue_number: "A005", patient_id: 5, patient: mockPatients[4], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "WAITING", check_in_time: "07:50:00", anamnesa_time: null, consultation_time: null, done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), status_history: [createHistory("WAITING", "07:50:00")], created_at: "", updated_at: "" },
]

let nextId = 6, nextQueueNum = 6
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const STATUS_ORDER: Record<QueueStatus, number> = { WITH_DOCTOR: 0, WAITING_DOCTOR: 1, ANAMNESA: 2, WAITING: 3, DONE: 4, NO_SHOW: 5, CANCELLED: 6 }

export const queueService = {
  getAll: async (params?: { date?: string; poly_id?: number; doctor_id?: number; status?: QueueStatus }): Promise<ApiResponse<Queue[]>> => {
    if (USE_MOCK) {
      await delay(300)
      let filtered = [...mockQueues]
      if (params?.date) filtered = filtered.filter(q => q.queue_date === params.date)
      if (params?.poly_id) filtered = filtered.filter(q => q.poly_id === params.poly_id)
      if (params?.doctor_id) filtered = filtered.filter(q => q.doctor_id === params.doctor_id)
      if (params?.status) filtered = filtered.filter(q => q.status === params.status)
      filtered.sort((a, b) => {
        if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
        return a.check_in_time.localeCompare(b.check_in_time)
      })
      return { status: "success", data: filtered }
    }
    throw new Error("API not implemented")
  },

  getById: async (id: number): Promise<ApiResponse<Queue>> => {
    if (USE_MOCK) {
      await delay(200)
      const queue = mockQueues.find(q => q.id === id)
      if (!queue) return { status: "error", message: "Queue not found" }
      return { status: "success", data: queue }
    }
    throw new Error("API not implemented")
  },

  create: async (data: QueueCreateRequest): Promise<ApiResponse<Queue>> => {
    if (USE_MOCK) {
      await delay(300)
      const patient = mockPatients.find(p => p.nik === data.patient_nik) || { id: mockPatients.length + 1, name: data.patient_name, nik: data.patient_nik, phone: data.patient_phone, birth_date: "1990-01-01", address: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      const now = format(new Date(), "HH:mm:ss")
      const newQueue: Queue = {
        id: nextId++, queue_number: `A${String(nextQueueNum++).padStart(3, "0")}`, patient_id: patient.id, patient, poly_id: data.poly_id, poly: mockPoly, doctor_id: data.doctor_id, doctor: mockDoctor, schedule_id: data.schedule_id, schedule: mockSchedule,
        status: "WAITING", check_in_time: now, anamnesa_time: null, consultation_time: null, done_time: null, queue_date: data.queue_date, notes: data.notes, status_history: [createHistory("WAITING", now)], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
      mockQueues.push(newQueue)
      return { status: "success", data: newQueue, message: "Pasien berhasil didaftarkan" }
    }
    throw new Error("API not implemented")
  },

  updateStatus: async (id: number, data: QueueUpdateStatusRequest): Promise<ApiResponse<Queue>> => {
    if (USE_MOCK) {
      await delay(200)
      const idx = mockQueues.findIndex(q => q.id === id)
      if (idx === -1) return { status: "error", message: "Queue not found" }
      const now = format(new Date(), "HH:mm:ss")
      const queue = mockQueues[idx]
      const updates: Partial<Queue> = { status: data.status, updated_at: new Date().toISOString(), status_history: [...queue.status_history, createHistory(data.status, now)] }
      if (data.status === "ANAMNESA" && !queue.anamnesa_time) updates.anamnesa_time = now
      if (data.status === "WITH_DOCTOR" && !queue.consultation_time) updates.consultation_time = now
      if (data.status === "DONE" || data.status === "NO_SHOW" || data.status === "CANCELLED") updates.done_time = now
      mockQueues[idx] = { ...queue, ...updates }
      return { status: "success", data: mockQueues[idx], message: "Status berhasil diupdate" }
    }
    throw new Error("API not implemented")
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    if (USE_MOCK) {
      await delay(200)
      mockQueues = mockQueues.filter(q => q.id !== id)
      return { status: "success", message: "Antrean berhasil dihapus" }
    }
    throw new Error("API not implemented")
  },

  checkQueue: async (code: string): Promise<ApiResponse<Queue> & { position?: number }> => {
    if (USE_MOCK) {
      await delay(300)
      const today = format(new Date(), "yyyy-MM-dd")
      const queue = mockQueues.find(q => q.queue_number.toUpperCase() === code.toUpperCase() && q.queue_date === today)
      if (!queue) return { status: "error", message: "Antrean tidak ditemukan" }
      // Calculate position (how many people ahead)
      const activeStatuses: QueueStatus[] = ["WAITING", "ANAMNESA", "WAITING_DOCTOR"]
      if (!activeStatuses.includes(queue.status)) return { status: "success", data: queue, position: 0 }
      const ahead = mockQueues.filter(q => 
        q.queue_date === today && 
        activeStatuses.includes(q.status) && 
        q.check_in_time < queue.check_in_time
      ).length
      return { status: "success", data: queue, position: ahead }
    }
    throw new Error("API not implemented")
  },
}
