import { useQuery, useMutation } from "@tanstack/react-query"
import { reportsService } from "@/services"
import type { ReportParams } from "@/types"

export const reportKeys = {
  all: ["reports"] as const,
  patientVisits: (params?: ReportParams) => [...reportKeys.all, "patientVisits", params] as const,
  noShowCancelled: (params?: ReportParams) => [...reportKeys.all, "noShowCancelled", params] as const,
  bpjsVsGeneral: (params?: ReportParams) => [...reportKeys.all, "bpjsVsGeneral", params] as const,
  polyPerformance: (params?: ReportParams) => [...reportKeys.all, "polyPerformance", params] as const,
  waitingTime: (params?: ReportParams) => [...reportKeys.all, "waitingTime", params] as const,
  busyHour: (params?: ReportParams) => [...reportKeys.all, "busyHour", params] as const,
  userActivity: (params?: ReportParams) => [...reportKeys.all, "userActivity", params] as const,
}

// ============================================
// Patient Visits Report
// ============================================
export function usePatientVisitsReport(params?: ReportParams) {
  return useQuery({
    queryKey: reportKeys.patientVisits(params),
    queryFn: () => reportsService.getPatientVisits(params),
  })
}

export function useExportPatientVisits() {
  return useMutation({
    mutationFn: (params?: ReportParams) => reportsService.exportPatientVisits(params),
  })
}

// ============================================
// No Show & Cancelled Report
// ============================================
export function useNoShowCancelledReport(params?: ReportParams) {
  return useQuery({
    queryKey: reportKeys.noShowCancelled(params),
    queryFn: () => reportsService.getNoShowCancelled(params),
  })
}

export function useExportNoShowCancelled() {
  return useMutation({
    mutationFn: (params?: ReportParams) => reportsService.exportNoShowCancelled(params),
  })
}

// ============================================
// BPJS vs General Report
// ============================================
export function useBpjsVsGeneralReport(params?: ReportParams) {
  return useQuery({
    queryKey: reportKeys.bpjsVsGeneral(params),
    queryFn: () => reportsService.getBpjsVsGeneral(params),
  })
}

export function useExportBpjsVsGeneral() {
  return useMutation({
    mutationFn: (params?: ReportParams) => reportsService.exportBpjsVsGeneral(params),
  })
}

// ============================================
// Poly Performance Report
// ============================================
export function usePolyPerformanceReport(params?: ReportParams) {
  return useQuery({
    queryKey: reportKeys.polyPerformance(params),
    queryFn: () => reportsService.getPolyPerformance(params),
  })
}

export function useExportPolyPerformance() {
  return useMutation({
    mutationFn: (params?: ReportParams) => reportsService.exportPolyPerformance(params),
  })
}

// ============================================
// Waiting Time Report
// ============================================
export function useWaitingTimeReport(params?: ReportParams) {
  return useQuery({
    queryKey: reportKeys.waitingTime(params),
    queryFn: () => reportsService.getWaitingTime(params),
  })
}

export function useExportWaitingTime() {
  return useMutation({
    mutationFn: (params?: ReportParams) => reportsService.exportWaitingTime(params),
  })
}

// ============================================
// Busy Hour Report
// ============================================
export function useBusyHourReport(params?: ReportParams) {
  return useQuery({
    queryKey: reportKeys.busyHour(params),
    queryFn: () => reportsService.getBusyHour(params),
  })
}

export function useExportBusyHour() {
  return useMutation({
    mutationFn: (params?: ReportParams) => reportsService.exportBusyHour(params),
  })
}

// ============================================
// User Activity Report
// ============================================
export function useUserActivityReport(params?: ReportParams) {
  return useQuery({
    queryKey: reportKeys.userActivity(params),
    queryFn: () => reportsService.getUserActivity(params),
  })
}

export function useExportUserActivity() {
  return useMutation({
    mutationFn: (params?: ReportParams) => reportsService.exportUserActivity(params),
  })
}
