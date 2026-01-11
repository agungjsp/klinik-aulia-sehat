import { api } from "@/lib/axios"
import type {
  BpjsVsGeneralReportItem,
  BusyHourReportItem,
  NoShowCancelledReportItem,
  PatientVisitReportItem,
  PolyPerformanceReportItem,
  ReportParams,
  ReportResponse,
  UserActivityReportItem,
  WaitingTimeReportItem,
} from "@/types"

/**
 * Helper to download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Build query string for array params like status[]
 */
function buildParams(params?: ReportParams): Record<string, string | number | undefined> {
  if (!params) return {}
  
  const result: Record<string, string | number | undefined> = {
    date_from: params.date_from,
    date_to: params.date_to,
    poly_id: params.poly_id,
    insurance_type: params.insurance_type,
    user_id: params.user_id,
    page: params.page,
    per_page: params.per_page,
  }
  
  // Handle status array - axios will convert to status[]=1&status[]=2
  if (params.status && params.status.length > 0) {
    params.status.forEach((s, i) => {
      result[`status[${i}]`] = s
    })
  }
  
  return result
}

export const reportsService = {
  // ============================================
  // Patient Visits Report
  // ============================================
  getPatientVisits: async (params?: ReportParams) => {
    const response = await api.get<ReportResponse<PatientVisitReportItem>>("/api/reports/patient-visits", {
      params: buildParams(params),
    })
    return response.data
  },

  exportPatientVisits: async (params?: ReportParams) => {
    const response = await api.get("/api/reports/patient-visits/export", {
      params: buildParams(params),
      responseType: "blob",
    })
    const filename = `laporan-kunjungan-pasien-${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(response.data, filename)
  },

  // ============================================
  // No Show & Cancelled Report
  // ============================================
  getNoShowCancelled: async (params?: ReportParams) => {
    const response = await api.get<ReportResponse<NoShowCancelledReportItem>>("/api/reports/no-show-cancelled", {
      params: buildParams(params),
    })
    return response.data
  },

  exportNoShowCancelled: async (params?: ReportParams) => {
    const response = await api.get("/api/reports/no-show-cancelled/export", {
      params: buildParams(params),
      responseType: "blob",
    })
    const filename = `laporan-noshow-cancelled-${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(response.data, filename)
  },

  // ============================================
  // BPJS vs General Report
  // ============================================
  getBpjsVsGeneral: async (params?: ReportParams) => {
    const response = await api.get<ReportResponse<BpjsVsGeneralReportItem>>("/api/reports/bpjs-vs-general", {
      params: buildParams(params),
    })
    return response.data
  },

  exportBpjsVsGeneral: async (params?: ReportParams) => {
    const response = await api.get("/api/reports/bpjs-vs-general/export", {
      params: buildParams(params),
      responseType: "blob",
    })
    const filename = `laporan-bpjs-vs-umum-${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(response.data, filename)
  },

  // ============================================
  // Poly Performance Report
  // ============================================
  getPolyPerformance: async (params?: ReportParams) => {
    const response = await api.get<ReportResponse<PolyPerformanceReportItem>>("/api/reports/poly-performance", {
      params: buildParams(params),
    })
    return response.data
  },

  exportPolyPerformance: async (params?: ReportParams) => {
    const response = await api.get("/api/reports/poly-performance/export", {
      params: buildParams(params),
      responseType: "blob",
    })
    const filename = `laporan-kinerja-poli-${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(response.data, filename)
  },

  // ============================================
  // Waiting Time Report
  // ============================================
  getWaitingTime: async (params?: ReportParams) => {
    const response = await api.get<ReportResponse<WaitingTimeReportItem>>("/api/reports/waiting-time", {
      params: buildParams(params),
    })
    return response.data
  },

  exportWaitingTime: async (params?: ReportParams) => {
    const response = await api.get("/api/reports/waiting-time/export", {
      params: buildParams(params),
      responseType: "blob",
    })
    const filename = `laporan-waktu-tunggu-${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(response.data, filename)
  },

  // ============================================
  // Busy Hour Report
  // ============================================
  getBusyHour: async (params?: ReportParams) => {
    const response = await api.get<ReportResponse<BusyHourReportItem>>("/api/reports/busy-hour", {
      params: buildParams(params),
    })
    return response.data
  },

  exportBusyHour: async (params?: ReportParams) => {
    const response = await api.get("/api/reports/busy-hour/export", {
      params: buildParams(params),
      responseType: "blob",
    })
    const filename = `laporan-jam-sibuk-${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(response.data, filename)
  },

  // ============================================
  // User Activity Report
  // ============================================
  getUserActivity: async (params?: ReportParams) => {
    const response = await api.get<ReportResponse<UserActivityReportItem>>("/api/reports/user-activity", {
      params: buildParams(params),
    })
    return response.data
  },

  exportUserActivity: async (params?: ReportParams) => {
    const response = await api.get("/api/reports/user-activity/export", {
      params: buildParams(params),
      responseType: "blob",
    })
    const filename = `laporan-aktivitas-user-${new Date().toISOString().slice(0, 10)}.xlsx`
    downloadBlob(response.data, filename)
  },
}
