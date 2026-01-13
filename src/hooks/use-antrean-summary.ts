import { useMemo } from "react"
import type { Reservation, Status, Schedule, QueueStatusName } from "@/types"

interface UseAntreanSummaryParams {
  reservations: Reservation[]
  statuses: Status[]
  selectedPolyId: number | null
  selectedScheduleId?: number | null
  schedules?: Schedule[]
}

interface StatusCount {
  statusName: QueueStatusName
  count: number
  label: string
}

interface QuotaInfo {
  quota: number | null
  used: number
  remaining: number
  isFull: boolean
}

export function useAntreanSummary({
  reservations,
  statuses,
  selectedPolyId,
  selectedScheduleId,
  schedules = [],
}: UseAntreanSummaryParams) {
  // Filter reservations by poly and date
  const filteredReservations = useMemo(() => {
    if (!selectedPolyId) return reservations
    return reservations.filter((r) => r.poly_id === selectedPolyId)
  }, [reservations, selectedPolyId])

  // Calculate status counts
  const statusCounts = useMemo<StatusCount[]>(() => {
    const statusNames: QueueStatusName[] = [
      "WAITING",
      "ANAMNESA",
      "WAITING_DOCTOR",
      "WITH_DOCTOR",
      "DONE",
      "NO_SHOW",
      "CANCELLED",
    ]

    return statusNames.map((statusName) => {
      const statusId = statuses.find((s) => s.status_name === statusName)?.id
      const count = filteredReservations.filter((r) => r.status_id === statusId).length
      const status = statuses.find((s) => s.status_name === statusName)
      return {
        statusName,
        count,
        label: status?.label || statusName,
      }
    })
  }, [filteredReservations, statuses])

  // Calculate quota info for selected schedule
  const quotaInfo = useMemo<QuotaInfo | null>(() => {
    if (!selectedScheduleId) return null

    const schedule = schedules.find((s) => s.id === selectedScheduleId)
    if (!schedule) return null

    const quota = schedule.quota
    if (quota === null || quota === undefined) return null

    const reservationsForSchedule = filteredReservations.filter(
      (r) => r.schedule_id === selectedScheduleId
    ).length

    const remaining = Math.max(0, quota - reservationsForSchedule)
    const isFull = remaining === 0

    return { quota, used: reservationsForSchedule, remaining, isFull }
  }, [selectedScheduleId, schedules, filteredReservations])

  // Get schedules for selected poly and date
  const availableSchedules = useMemo(() => {
    if (!selectedPolyId) return []
    return schedules.filter((s) => s.doctor?.poly_id === selectedPolyId)
  }, [schedules, selectedPolyId])

  // Total count
  const totalCount = filteredReservations.length

  return {
    filteredReservations,
    statusCounts,
    quotaInfo,
    availableSchedules,
    totalCount,
  }
}
