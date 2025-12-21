import type { ApiResponse, Queue, QueueCreateRequest, QueueUpdateStatusRequest, QueueStatus } from "@/types"
import { format } from "date-fns"

// Mock data flag - set to false when API is ready
const USE_MOCK = true

// Mock data
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

let mockQueues: Queue[] = [
  { id: 1, queue_number: "A001", patient_id: 1, patient: mockPatients[0], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "DONE", registration_time: "07:30:00", arrival_time: "07:45:00", serving_time: "08:05:00", done_time: "08:20:00", queue_date: format(new Date(), "yyyy-MM-dd"), created_at: "", updated_at: "" },
  { id: 2, queue_number: "A002", patient_id: 2, patient: mockPatients[1], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "IN_SERVICE", registration_time: "07:35:00", arrival_time: "07:50:00", serving_time: "08:25:00", done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), created_at: "", updated_at: "" },
  { id: 3, queue_number: "A003", patient_id: 3, patient: mockPatients[2], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "WAITING", registration_time: "07:40:00", arrival_time: "08:00:00", serving_time: null, done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), created_at: "", updated_at: "" },
  { id: 4, queue_number: "A004", patient_id: 4, patient: mockPatients[3], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "WAITING", registration_time: "07:45:00", arrival_time: "08:10:00", serving_time: null, done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), created_at: "", updated_at: "" },
  { id: 5, queue_number: "A005", patient_id: 5, patient: mockPatients[4], poly_id: 1, poly: mockPoly, doctor_id: 3, doctor: mockDoctor, schedule_id: 1, schedule: mockSchedule, status: "WAITING", registration_time: "07:50:00", arrival_time: "08:15:00", serving_time: null, done_time: null, queue_date: format(new Date(), "yyyy-MM-dd"), created_at: "", updated_at: "" },
]

let nextId = 6
let nextQueueNum = 6

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const queueService = {
  getAll: async (params?: { date?: string; poly_id?: number; doctor_id?: number; status?: QueueStatus }): Promise<ApiResponse<Queue[]>> => {
    if (USE_MOCK) {
      await delay(300)
      let filtered = [...mockQueues]
      if (params?.date) filtered = filtered.filter(q => q.queue_date === params.date)
      if (params?.poly_id) filtered = filtered.filter(q => q.poly_id === params.poly_id)
      if (params?.doctor_id) filtered = filtered.filter(q => q.doctor_id === params.doctor_id)
      if (params?.status) filtered = filtered.filter(q => q.status === params.status)
      // Sort by status priority then arrival_time
      filtered.sort((a, b) => {
        const statusOrder: Record<string, number> = { IN_SERVICE: 0, WAITING: 1, DONE: 2, NO_SHOW: 3, CANCELLED: 4 }
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status]
        }
        if (a.arrival_time && b.arrival_time) return a.arrival_time.localeCompare(b.arrival_time)
        if (a.arrival_time) return -1
        if (b.arrival_time) return 1
        return a.registration_time.localeCompare(b.registration_time)
      })
      return { status: "success", data: filtered }
    }
    // TODO: Real API call
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
      const patient = mockPatients.find(p => p.nik === data.patient_nik) || {
        id: mockPatients.length + 1,
        name: data.patient_name,
        nik: data.patient_nik,
        phone: data.patient_phone,
        birth_date: "1990-01-01",
        address: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const newQueue: Queue = {
        id: nextId++,
        queue_number: `A${String(nextQueueNum++).padStart(3, "0")}`,
        patient_id: patient.id,
        patient,
        poly_id: data.poly_id,
        poly: mockPoly,
        doctor_id: data.doctor_id,
        doctor: mockDoctor,
        schedule_id: data.schedule_id,
        schedule: mockSchedule,
        status: "WAITING",
        registration_time: format(new Date(), "HH:mm:ss"),
        arrival_time: format(new Date(), "HH:mm:ss"),
        serving_time: null,
        done_time: null,
        queue_date: data.queue_date,
        notes: data.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockQueues.push(newQueue)
      return { status: "success", data: newQueue, message: "Antrean berhasil didaftarkan" }
    }
    throw new Error("API not implemented")
  },

  updateStatus: async (id: number, data: QueueUpdateStatusRequest): Promise<ApiResponse<Queue>> => {
    if (USE_MOCK) {
      await delay(200)
      const idx = mockQueues.findIndex(q => q.id === id)
      if (idx === -1) return { status: "error", message: "Queue not found" }
      
      const now = format(new Date(), "HH:mm:ss")
      mockQueues[idx] = { 
        ...mockQueues[idx], 
        status: data.status,
        serving_time: data.status === "IN_SERVICE" ? now : mockQueues[idx].serving_time,
        done_time: (data.status === "DONE" || data.status === "NO_SHOW") ? now : mockQueues[idx].done_time,
        updated_at: new Date().toISOString(),
      }
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
}
