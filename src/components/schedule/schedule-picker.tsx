import { useMemo } from "react"
import { Clock, Users, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Schedule, Reservation } from "@/types"

interface SchedulePickerProps {
  schedules: Schedule[]
  reservations: Reservation[]
  selectedScheduleId: number | null | undefined
  onSelect: (scheduleId: number) => void
  isLoading?: boolean
  disabled?: boolean
}

interface ScheduleCardInfo {
  schedule: Schedule
  quota: number | null
  used: number
  remaining: number
  isFull: boolean
}

export function SchedulePicker({
  schedules,
  reservations,
  selectedScheduleId,
  onSelect,
  isLoading = false,
  disabled = false,
}: SchedulePickerProps) {
  // Compute usage for each schedule
  const scheduleInfoList = useMemo<ScheduleCardInfo[]>(() => {
    return schedules.map((schedule) => {
      const quota = schedule.quota
      const used = reservations.filter((r) => r.schedule_id === schedule.id).length

      if (quota === null || quota === undefined) {
        return {
          schedule,
          quota: null,
          used,
          remaining: Infinity,
          isFull: false,
        }
      }

      const remaining = Math.max(0, quota - used)
      return {
        schedule,
        quota,
        used,
        remaining,
        isFull: remaining === 0,
      }
    })
  }, [schedules, reservations])

  // Group by doctor
  const groupedByDoctor = useMemo(() => {
    const groups: Record<string, ScheduleCardInfo[]> = {}
    for (const info of scheduleInfoList) {
      const doctorName = info.schedule.doctor?.name || "Dokter Tidak Diketahui"
      if (!groups[doctorName]) {
        groups[doctorName] = []
      }
      groups[doctorName].push(info)
    }

    // Sort within each group by start_time
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.schedule.start_time.localeCompare(b.schedule.start_time))
    }

    return groups
  }, [scheduleInfoList])

  const doctorNames = Object.keys(groupedByDoctor).sort()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="font-medium">Tidak ada jadwal tersedia</p>
        <p className="text-sm">Pilih poli lain atau hubungi administrator</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {doctorNames.map((doctorName) => {
        const doctorSchedules = groupedByDoctor[doctorName]
        const doctorPoly = doctorSchedules[0]?.schedule.doctor?.poly?.name

        return (
          <div key={doctorName} className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{doctorName}</h4>
              {doctorPoly && (
                <Badge variant="outline" className="text-xs">
                  {doctorPoly}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {doctorSchedules.map((info) => (
                <ScheduleCard
                  key={info.schedule.id}
                  info={info}
                  isSelected={selectedScheduleId === info.schedule.id}
                  onSelect={() => !info.isFull && !disabled && onSelect(info.schedule.id)}
                  disabled={disabled || info.isFull}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ScheduleCardProps {
  info: ScheduleCardInfo
  isSelected: boolean
  onSelect: () => void
  disabled: boolean
}

function ScheduleCard({ info, isSelected, onSelect, disabled }: ScheduleCardProps) {
  const { schedule, quota, used, remaining, isFull } = info
  const hasQuota = quota !== null

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full text-left p-3 rounded-lg border-2 transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected && !isFull && "border-primary bg-primary/5 shadow-sm",
        !isSelected && !isFull && "border-muted hover:border-primary/50 hover:bg-muted/50",
        isFull && "border-destructive/30 bg-destructive/5 cursor-not-allowed opacity-70",
        disabled && !isFull && "cursor-not-allowed opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">
            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
          </span>
        </div>
        {isSelected && !isFull && (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        )}
        {isFull && (
          <Badge variant="destructive" className="text-xs shrink-0">
            Penuh
          </Badge>
        )}
      </div>

      {hasQuota && (
        <div className="mt-2 flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Kuota</span>
              <span className={cn(
                "font-medium",
                isFull ? "text-destructive" : remaining <= 3 ? "text-amber-600" : "text-green-600"
              )}>
                {remaining}/{quota}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all rounded-full",
                  isFull ? "bg-destructive" : remaining <= 3 ? "bg-amber-500" : "bg-green-500"
                )}
                style={{ width: `${Math.min(100, (used / quota) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {!hasQuota && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>Tanpa batas kuota</span>
        </div>
      )}
    </button>
  )
}

// Also export a simple summary component for selected schedule
interface SelectedScheduleSummaryProps {
  schedule: Schedule | undefined
  reservations: Reservation[]
  onClear?: () => void
}

export function SelectedScheduleSummary({ schedule, reservations, onClear }: SelectedScheduleSummaryProps) {
  if (!schedule) return null

  const used = reservations.filter((r) => r.schedule_id === schedule.id).length
  const quota = schedule.quota
  const hasQuota = quota !== null && quota !== undefined
  const remaining = hasQuota ? Math.max(0, quota - used) : null
  const isFull = hasQuota && remaining === 0

  return (
    <div className={cn(
      "p-3 rounded-lg border flex items-center justify-between gap-4",
      isFull 
        ? "bg-destructive/10 border-destructive/30" 
        : "bg-primary/5 border-primary/30"
    )}>
      <div className="flex items-center gap-3">
        <CheckCircle2 className={cn("h-5 w-5", isFull ? "text-destructive" : "text-primary")} />
        <div>
          <p className="font-medium text-sm">{schedule.doctor?.name}</p>
          <p className="text-xs text-muted-foreground">
            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
            {hasQuota && (
              <span className={cn("ml-2", isFull ? "text-destructive" : "text-green-600")}>
                • Sisa: {remaining}/{quota}
              </span>
            )}
          </p>
        </div>
      </div>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Ganti
        </button>
      )}
    </div>
  )
}
