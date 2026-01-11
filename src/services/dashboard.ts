import { api } from "@/lib/axios"
import type {
  ApiResponse,
  DashboardAverageWaitingTimeItem,
  DashboardBpjsVsGeneralItem,
  DashboardPatientAttendance,
  DashboardPeakHourItem,
  DashboardPeakHoursParams,
  DashboardReservationsByPolyItem,
  DashboardSummaryItem,
  DashboardSummaryParams,
  DashboardTrendItem,
  DashboardTrendParams,
} from "@/types"

export const dashboardService = {
  /**
   * Get dashboard summary (Total Queue, Total Patients, Completed, No Show)
   */
  getSummary: async (params?: DashboardSummaryParams) => {
    const response = await api.get<ApiResponse<DashboardSummaryItem[]>>("/api/dashboard/summary", { params })
    return response.data
  },

  /**
   * Get reservation trend data (total reservations per poly over time)
   * - year only: monthly data
   * - year + month: daily data
   * - year + month + day: single day data
   */
  getReservationTrend: async (params?: DashboardTrendParams) => {
    const response = await api.get<ApiResponse<DashboardTrendItem[]>>("/api/dashboard/reservation-trend", { params })
    return response.data
  },

  /**
   * Get reservations comparison by poly (pie chart data)
   */
  getReservationsByPoly: async (params?: DashboardTrendParams) => {
    const response = await api.get<ApiResponse<DashboardReservationsByPolyItem[]>>("/api/dashboard/reservations-by-poly", { params })
    return response.data
  },

  /**
   * Get patient attendance rate (attended vs not attended)
   */
  getPatientAttendance: async (params?: DashboardTrendParams) => {
    const response = await api.get<ApiResponse<DashboardPatientAttendance>>("/api/dashboard/patient-attendance", { params })
    return response.data
  },

  /**
   * Get average waiting time per poly
   */
  getAverageWaitingTime: async (params?: DashboardTrendParams) => {
    const response = await api.get<ApiResponse<DashboardAverageWaitingTimeItem[]>>("/api/dashboard/average-waiting-time", { params })
    return response.data
  },

  /**
   * Get clinic peak hours distribution
   */
  getClinicPeakHours: async (params?: DashboardPeakHoursParams) => {
    const response = await api.get<ApiResponse<DashboardPeakHourItem[]>>("/api/dashboard/clinic-peak-hours", { params })
    return response.data
  },

  /**
   * Get BPJS vs General patient comparison over time
   */
  getBpjsVsGeneral: async (params?: DashboardTrendParams) => {
    const response = await api.get<ApiResponse<DashboardBpjsVsGeneralItem[]>>("/api/dashboard/bpjs-vs-general", { params })
    return response.data
  },
}
