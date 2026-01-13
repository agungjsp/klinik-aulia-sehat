import { useEffect } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, CalendarDays, Users, Clock, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { usePolyList, useScheduleList, useCurrentQueue, useStatusList } from "@/hooks"
import { useAntreanSummary } from "@/hooks/use-antrean-summary"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"
import { cn } from "@/lib/utils"
import type { Reservation, Schedule } from "@/types"

interface AntreanHeaderProps {
  title: string
  date: string
  selectedPolyId: number | null
  selectedScheduleId?: number | null
  reservations: Reservation[]
  onPolyChange: (polyId: number | null) => void
  onScheduleChange?: (scheduleId: number | null) => void
  onRefresh: () => void
  showPolySelector?: boolean
}

export function AntreanHeader({
  title,
  date,
  selectedPolyId,
  selectedScheduleId,
  reservations,
  onPolyChange,
  onScheduleChange,
  onRefresh,
  showPolySelector = true,
}: AntreanHeaderProps) {
  const { data: polyData, isLoading: polyLoading } = usePolyList()
  const { data: scheduleData, isLoading: scheduleLoading } = useScheduleList({
    month: new Date(date).getMonth() + 1,
    year: new Date(date).getFullYear(),
    date,
  })
  const { data: statusData } = useStatusList()
  const { data: currentQueueData } = useCurrentQueue(
    selectedPolyId ? { poly_id: selectedPolyId, date } : null
  )

  const polies = polyData?.data || []
  const schedules = scheduleData?.data || []
  const statuses = statusData?.data || []

  const { statusCounts, quotaInfo, availableSchedules } = useAntreanSummary({
    reservations,
    statuses,
    selectedPolyId,
    selectedScheduleId,
    schedules,
  })

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId)
  const selectedPoly = polies.find((p) => p.id === selectedPolyId)

  // Auto-select single schedule if available and not already selected
  useEffect(() => {
    if (
      availableSchedules.length === 1 &&
      !selectedScheduleId &&
      onScheduleChange &&
      !scheduleLoading
    ) {
      onScheduleChange(availableSchedules[0].id)
    }
  }, [availableSchedules, selectedScheduleId, onScheduleChange, scheduleLoading])

  // Format queue number helper
  const formatQueueNumber = (num: number | string | null | undefined) => {
    if (num === null || num === undefined) return "--"
    return String(num).padStart(3, "0")
  }

  return (
    <div className="space-y-4">
      {/* Context Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {format(new Date(date), "EEEE, d MMMM yyyy", { locale: localeId })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showPolySelector && (
            <Select
              value={selectedPolyId ? String(selectedPolyId) : undefined}
              onValueChange={(v) => onPolyChange(v === "all" ? null : Number(v))}
            >
              <SelectTrigger className="w-[200px]">
                {polyLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <SelectValue placeholder="Pilih Poli" />
                )}
              </SelectTrigger>
              <SelectContent>
                {polies.map((poly) => (
                  <SelectItem key={poly.id} value={String(poly.id)}>
                    {poly.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!showPolySelector && selectedPoly && (
            <Badge variant="outline" className="text-base px-3 py-1">
              {selectedPoly.name}
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Schedule + Current Numbers */}
      {selectedPolyId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Schedule Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground">Jadwal Dokter</h3>
                </div>
                {scheduleLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : availableSchedules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Tidak ada jadwal tersedia</p>
                ) : (
                  <div className="space-y-2">
                    {availableSchedules.length > 1 && onScheduleChange ? (
                      <Select
                        value={selectedScheduleId ? String(selectedScheduleId) : undefined}
                        onValueChange={(v) => onScheduleChange(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jadwal" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSchedules.map((schedule) => (
                            <SelectItem key={schedule.id} value={String(schedule.id)}>
                              {schedule.doctor?.name || "Dokter"} - {schedule.start_time.slice(0, 5)} -{" "}
                              {schedule.end_time.slice(0, 5)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : selectedSchedule || (availableSchedules.length === 1 && availableSchedules[0]) ? (
                      <div>
                        <p className="font-medium">
                          {(selectedSchedule || availableSchedules[0])?.doctor?.name || "Dokter"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedSchedule || availableSchedules[0])?.start_time.slice(0, 5)} - {(selectedSchedule || availableSchedules[0])?.end_time.slice(0, 5)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Pilih jadwal</p>
                    )}
                    {quotaInfo && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Kuota:</span>
                        <span className={cn("font-medium", quotaInfo.isFull && "text-destructive")}>
                          {quotaInfo.used}/{quotaInfo.quota} ({quotaInfo.remaining} tersisa)
                        </span>
                        {quotaInfo.isFull && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Called Numbers */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Nomor Terpanggil</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Anamnesa</p>
                    <p className="text-2xl font-bold">
                      {currentQueueData?.data?.queue_number_anamnesa
                        ? formatQueueNumber(currentQueueData.data.queue_number_anamnesa)
                        : "--"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Dengan Dokter</p>
                    <p className="text-2xl font-bold">
                      {currentQueueData?.data?.queue_number_with_doctor
                        ? formatQueueNumber(currentQueueData.data.queue_number_with_doctor)
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statusCounts.map(({ statusName, count, label }) => {
          const config = QUEUE_STATUS_CONFIG[statusName]
          const iconMap = {
            WAITING: Clock,
            ANAMNESA: Activity,
            WAITING_DOCTOR: Clock,
            WITH_DOCTOR: Activity,
            DONE: CheckCircle,
            NO_SHOW: XCircle,
            CANCELLED: XCircle,
          }
          const Icon = iconMap[statusName] || Users

          return (
            <Card key={statusName} className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn("h-4 w-4", config?.color || "text-muted-foreground")} />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
