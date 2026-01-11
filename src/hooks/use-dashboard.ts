import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services"
import type { DashboardPeakHoursParams, DashboardSummaryParams, DashboardTrendParams } from "@/types"

// Default stale time for dashboard data (30 seconds)
// This prevents refetch storms when navigating or changing filters
const DASHBOARD_STALE_TIME = 30 * 1000

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (params?: DashboardSummaryParams) => [...dashboardKeys.all, "summary", params] as const,
  reservationTrend: (params?: DashboardTrendParams) => [...dashboardKeys.all, "reservationTrend", params] as const,
  reservationsByPoly: (params?: DashboardTrendParams) => [...dashboardKeys.all, "reservationsByPoly", params] as const,
  patientAttendance: (params?: DashboardTrendParams) => [...dashboardKeys.all, "patientAttendance", params] as const,
  averageWaitingTime: (params?: DashboardTrendParams) => [...dashboardKeys.all, "averageWaitingTime", params] as const,
  clinicPeakHours: (params?: DashboardPeakHoursParams) => [...dashboardKeys.all, "clinicPeakHours", params] as const,
  bpjsVsGeneral: (params?: DashboardTrendParams) => [...dashboardKeys.all, "bpjsVsGeneral", params] as const,
}

export function useDashboardSummary(params?: DashboardSummaryParams) {
  return useQuery({
    queryKey: dashboardKeys.summary(params),
    queryFn: () => dashboardService.getSummary(params),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}

export function useDashboardReservationTrend(params?: DashboardTrendParams) {
  return useQuery({
    queryKey: dashboardKeys.reservationTrend(params),
    queryFn: () => dashboardService.getReservationTrend(params),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}

export function useDashboardReservationsByPoly(params?: DashboardTrendParams) {
  return useQuery({
    queryKey: dashboardKeys.reservationsByPoly(params),
    queryFn: () => dashboardService.getReservationsByPoly(params),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}

export function useDashboardPatientAttendance(params?: DashboardTrendParams) {
  return useQuery({
    queryKey: dashboardKeys.patientAttendance(params),
    queryFn: () => dashboardService.getPatientAttendance(params),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}

export function useDashboardAverageWaitingTime(params?: DashboardTrendParams) {
  return useQuery({
    queryKey: dashboardKeys.averageWaitingTime(params),
    queryFn: () => dashboardService.getAverageWaitingTime(params),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}

export function useDashboardClinicPeakHours(params?: DashboardPeakHoursParams) {
  return useQuery({
    queryKey: dashboardKeys.clinicPeakHours(params),
    queryFn: () => dashboardService.getClinicPeakHours(params),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}

export function useDashboardBpjsVsGeneral(params?: DashboardTrendParams) {
  return useQuery({
    queryKey: dashboardKeys.bpjsVsGeneral(params),
    queryFn: () => dashboardService.getBpjsVsGeneral(params),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: (previousData) => previousData,
  })
}
