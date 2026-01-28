import { useState, useMemo, useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
 
import { XCircle, Plus, Filter, AlertTriangle, CalendarDays } from "lucide-react"
import {
  useReservationList,
  useReservationCreate,
  useReservationToNoShow,
  useReservationToCancelled,
  usePolyList,
  useScheduleList,
  useStatusList,
  useRealtimeQueue,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { SchedulePicker, SelectedScheduleSummary } from "@/components/schedule"
import { AntreanHeader } from "@/components/antrean"
import { useAuthStore } from "@/stores/auth"
import { cn } from "@/lib/utils"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"
import { getApiErrorMessage } from "@/lib/api-error"
import type { Poly, Reservation, QueueStatusName, Schedule } from "@/types"

const EMPTY_POLIES: Poly[] = []
const EMPTY_RESERVATIONS: Reservation[] = []

const antreanSearchSchema = z.object({
  polyId: z.number().optional(),
  date: z.string().optional(),
  scheduleId: z.number().optional(),
})

export const Route = createFileRoute("/administrasi/antrean")({
  component: AdministrasiAntreanPage,
  validateSearch: antreanSearchSchema,
})

// Registration form schema - schedule_id is now REQUIRED
const registerSchema = z.object({
  patient_name: z.string().min(1, "Nama pasien wajib diisi"),
  whatsapp_number: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  no_bpjs: z.string().optional(),
  bpjs: z.boolean(),
  poly_id: z.number({ message: "Pilih poli" }),
  schedule_id: z.number({ message: "Pilih jadwal dokter" }),
  date: z.string(),
})

type RegisterForm = z.infer<typeof registerSchema>


function AdministrasiAntreanPage() {
  const navigate = useNavigate({ from: "/administrasi/antrean" })
  const search = Route.useSearch() ?? {}
  const { user } = useAuthStore()
  const today = format(new Date(), "yyyy-MM-dd")

  // Get selected poly/date from search params or defaults
  const selectedPolyId = search.polyId ?? (user?.poly_id ?? null)
  const selectedDate = search.date ?? today
  const selectedScheduleId = search.scheduleId ?? null

  // Fetch reservations for selected date
  const { data: reservationData, isLoading, refetch } = useReservationList({ date: selectedDate })
  const { data: statusData } = useStatusList()
  const { data: polyData, isLoading: polyLoading } = usePolyList()

  // Realtime updates for selected poly
  useRealtimeQueue({
    polyId: selectedPolyId ?? 0,
    enabled: selectedPolyId !== null,
  })

  // Create mutation
  const createReservationMutation = useReservationCreate()
  const noShowMutation = useReservationToNoShow()
  const cancelledMutation = useReservationToCancelled()

  // Set default poly if not set and we have polies
  const polies = polyData?.data ?? EMPTY_POLIES
  useEffect(() => {
    if (!selectedPolyId && polies.length > 0 && !search.polyId) {
      const defaultPolyId = user?.poly_id ?? polies[0]?.id
      if (defaultPolyId) {
        navigate({
          search: (prev) => ({ ...prev, polyId: defaultPolyId }),
          replace: true,
        })
      }
    }
  }, [selectedPolyId, polies, user?.poly_id, navigate, search.polyId])

  // Filter state (for list view, can still show "all")
  const [filterPoly, setFilterPoly] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    reservation: Reservation
    action: "noshow" | "cancelled"
    title: string
    description: string
  } | null>(null)

  // Registration form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const { data: scheduleData, isLoading: scheduleLoading } = useScheduleList({
    month: new Date(selectedDate).getMonth() + 1,
    year: new Date(selectedDate).getFullYear(),
    date: selectedDate,
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      bpjs: false,
      date: selectedDate,
    },
  })

  const formPolyId = watch("poly_id")
  const formScheduleId = watch("schedule_id")
  const isBpjs = watch("bpjs")
  const schedules = scheduleData?.data || []
  const filteredSchedules = formPolyId
    ? schedules.filter((s: Schedule) => s.doctor?.poly_id === formPolyId && s.date === selectedDate)
    : []
  const statuses = statusData?.data || []
  const reservations = reservationData?.data?.data ?? EMPTY_RESERVATIONS

  // Get selected schedule object (from form or search params)
  const selectedSchedule = schedules.find((s: Schedule) => s.id === (formScheduleId || selectedScheduleId))

  // Compute quota info for selected schedule
  const quotaInfo = useMemo(() => {
    if (!selectedSchedule) return null

    const quota = selectedSchedule.quota
    if (quota === null || quota === undefined) return null

    const scheduleId = formScheduleId || selectedScheduleId
    const reservationsForSchedule = reservations.filter(
      (r: Reservation) => r.schedule_id === scheduleId
    ).length

    const remaining = Math.max(0, quota - reservationsForSchedule)
    const isFull = remaining === 0

    return { quota, used: reservationsForSchedule, remaining, isFull }
  }, [selectedSchedule, reservations, formScheduleId, selectedScheduleId])

  // Get status name from id
  const getStatusName = (statusId: number): QueueStatusName | undefined => {
    return statuses.find((s) => s.id === statusId)?.status_name as QueueStatusName | undefined
  }

  // Filter Logic
  const filteredReservations = reservations.filter((reservation: Reservation) => {
    const polyMatch = filterPoly === "all" || String(reservation.poly_id) === filterPoly

    let statusMatch = true
    const statusName = reservation.status?.status_name || getStatusName(reservation.status_id)
    if (filterStatus === "all") {
      statusMatch = true
    } else if (filterStatus === "IN_PROGRESS") {
      statusMatch = ["ANAMNESA", "WAITING_DOCTOR", "WITH_DOCTOR"].includes(statusName || "")
    } else {
      statusMatch = statusName === filterStatus
    }

    return polyMatch && statusMatch
  })

  // Handle poly/schedule change from header
  const handlePolyChange = (polyId: number | null) => {
    navigate({
      search: (prev) => ({ ...prev, polyId: polyId ?? undefined, scheduleId: undefined }),
    })
  }

  const handleScheduleChange = (scheduleId: number | null) => {
    navigate({
      search: (prev) => ({ ...prev, scheduleId: scheduleId ?? undefined }),
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleAction = (
    reservation: Reservation,
    action: "noshow" | "cancelled",
    title: string,
    description: string
  ) => {
    setPendingAction({ reservation, action, title, description })
    setConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    try {
      const queueId = pendingAction.reservation.queue?.id
      if (!queueId) {
        toast.error("Data antrean tidak tersedia.")
        return
      }
      if (pendingAction.action === "noshow") {
        await noShowMutation.mutateAsync(queueId)
        toast.success("Pasien ditandai tidak hadir")
      } else {
        await cancelledMutation.mutateAsync(queueId)
        toast.success("Reservasi dibatalkan")
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  const openRegisterForm = () => {
    reset({
      patient_name: "",
      whatsapp_number: "",
      email: "",
      no_bpjs: "",
      bpjs: false,
      poly_id: selectedPolyId ?? undefined,
      schedule_id: undefined,
      date: selectedDate,
    })
    setShowSchedulePicker(false)
    setIsFormOpen(true)
  }

  const handleScheduleSelect = (scheduleId: number) => {
    setValue("schedule_id", scheduleId, { shouldValidate: true })
    setShowSchedulePicker(false)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await createReservationMutation.mutateAsync({
        patient_name: data.patient_name,
        whatsapp_number: data.whatsapp_number,
        email: data.email || undefined,
        no_bpjs: data.no_bpjs || undefined,
        bpjs: data.bpjs,
        poly_id: data.poly_id,
        schedule_id: data.schedule_id,
        date: data.date,
      })
      
      const queueNumber = result.data?.queue?.queue_number
      toast.success(`Pasien berhasil didaftarkan${queueNumber ? ` - Nomor antrean: ${queueNumber}` : ""}`)
      setIsFormOpen(false)
    } catch (error: unknown) {
      // Handle quota exceeded error specifically
      const errorMessage = getApiErrorMessage(error)
      const normalizedMessage = errorMessage.toLowerCase()
      if (
        (normalizedMessage.includes("whatsapp") || normalizedMessage.includes("bpjs")) &&
        (normalizedMessage.includes("already registered") || normalizedMessage.includes("sudah terdaftar"))
      ) {
        toast.error("Nomor WhatsApp atau BPJS sudah terdaftar dengan nama pasien lain.")
        return
      }
      if (
        normalizedMessage.includes("kuota") ||
        normalizedMessage.includes("quota") ||
        normalizedMessage.includes("penuh") ||
        normalizedMessage.includes("full")
      ) {
        toast.error("Kuota jadwal sudah penuh. Silakan pilih jadwal lain.")
        // Refetch to get latest quota state
        refetch()
      } else {
        toast.error(errorMessage)
      }
    }
  })

  // Helper to format queue number
  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  // Determine if submit should be disabled
  const isSubmitDisabled = createReservationMutation.isPending || (quotaInfo?.isFull ?? false) || !formScheduleId

  return (
    <div className="space-y-6">
      {/* Shared Header */}
      <AntreanHeader
        title="Pendaftaran & Antrean"
        date={selectedDate}
        selectedPolyId={selectedPolyId}
        selectedScheduleId={selectedScheduleId}
        reservations={reservations}
        onPolyChange={handlePolyChange}
        onScheduleChange={handleScheduleChange}
        onRefresh={handleRefresh}
        showPolySelector={true}
      />

      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={openRegisterForm}>
          <Plus className="mr-2 h-4 w-4" />
          Daftar Pasien
        </Button>
      </div>

      {/* Queue List with Filters */}
      <div className="rounded-lg border">
        <div className="border-b p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold">Daftar Antrean Hari Ini</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterPoly} onValueChange={setFilterPoly}>
              <SelectTrigger className="w-[180px]">
                {polyLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <SelectValue placeholder="Semua Poli" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Poli</SelectItem>
                {polies.map((poly) => (
                  <SelectItem key={poly.id} value={String(poly.id)}>
                    {poly.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="IN_PROGRESS">Sedang Proses</SelectItem>
                {Object.entries(QUEUE_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))
          ) : filteredReservations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {reservations.length === 0
                ? "Belum ada antrean hari ini"
                : "Tidak ada antrean yang sesuai filter"}
            </p>
          ) : (
            filteredReservations.map((reservation: Reservation) => {
              const statusName = (reservation.status?.status_name ||
                getStatusName(reservation.status_id)) as QueueStatusName
              const statusConfig = statusName ? QUEUE_STATUS_CONFIG[statusName] : null

              return (
                <div key={reservation.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg font-bold w-20">
                      {reservation.queue?.queue_number
                        ? formatQueueNumber(reservation.queue.queue_number)
                        : "-"}
                    </span>
                    <div>
                      <p className="font-medium">{reservation.patient?.patient_name || "-"}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.poly?.name || "-"} •{" "}
                        {reservation.bpjs ? "BPJS" : "Umum"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig?.variant || "outline"}>
                      {statusConfig?.label || statusName || "Unknown"}
                    </Badge>
                    {statusName === "WAITING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleAction(
                            reservation,
                            "noshow",
                            "Tandai Tidak Hadir",
                            `Tandai pasien ${reservation.patient?.patient_name} sebagai tidak hadir?`
                          )
                        }
                        disabled={noShowMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Register Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pendaftaran Pasien</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Patient Type */}
            <div className="space-y-2">
              <Label>Tipe Pasien</Label>
              <Controller
                name="bpjs"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!field.value ? "default" : "outline"}
                      onClick={() => field.onChange(false)}
                      className="flex-1"
                    >
                      Umum
                    </Button>
                    <Button
                      type="button"
                      variant={field.value ? "default" : "outline"}
                      onClick={() => field.onChange(true)}
                      className="flex-1"
                    >
                      BPJS
                    </Button>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_name">Nama Pasien</Label>
              <Input id="patient_name" {...register("patient_name")} />
              {errors.patient_name && (
                <p className="text-sm text-destructive">{errors.patient_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">No. WhatsApp</Label>
                <Input
                  id="whatsapp_number"
                  placeholder="08xxxxxxxxxx"
                  {...register("whatsapp_number")}
                />
                {errors.whatsapp_number && (
                  <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (opsional)</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            {isBpjs && (
              <div className="space-y-2">
                <Label htmlFor="no_bpjs">No. BPJS</Label>
                <Input id="no_bpjs" placeholder="Nomor kartu BPJS" {...register("no_bpjs")} />
              </div>
            )}

            {/* Step 1: Select Poli */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  1
                </div>
                <Label className="text-base font-semibold">Pilih Poli</Label>
              </div>
              <Controller
                name="poly_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => {
                      field.onChange(Number(v))
                      // Reset schedule when poly changes
                      setValue("schedule_id", undefined as unknown as number)
                      setShowSchedulePicker(true)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      {polyLoading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        <SelectValue placeholder="Pilih poli tujuan" />
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
              />
              {errors.poly_id && (
                <p className="text-sm text-destructive">{errors.poly_id.message}</p>
              )}
            </div>

            {/* Step 2: Select Schedule */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    selectedPolyId 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    2
                  </div>
                  <Label className={cn(
                    "text-base font-semibold",
                    !selectedPolyId && "text-muted-foreground"
                  )}>
                    Pilih Jadwal Dokter
                  </Label>
                  <Badge variant="destructive" className="text-xs">Wajib</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Hari ini</span>
                </div>
              </div>

              {!formPolyId ? (
                <div className="p-4 rounded-lg border border-dashed bg-muted/30 text-center text-muted-foreground">
                  <p>Pilih poli terlebih dahulu untuk melihat jadwal dokter</p>
                </div>
              ) : formScheduleId && !showSchedulePicker ? (
                // Show selected schedule summary
                <div className="space-y-2">
                  <SelectedScheduleSummary
                    schedule={selectedSchedule}
                    reservations={reservations}
                    onClear={() => setShowSchedulePicker(true)}
                  />
                  {quotaInfo?.isFull && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <p>Kuota jadwal ini sudah penuh! Silakan pilih jadwal lain.</p>
                    </div>
                  )}
                </div>
              ) : (
                // Show schedule picker
                <div className="space-y-2">
                  <SchedulePicker
                    schedules={filteredSchedules}
                    reservations={reservations}
                    selectedScheduleId={formScheduleId}
                    onSelect={handleScheduleSelect}
                    isLoading={scheduleLoading}
                  />
                  {errors.schedule_id && (
                    <p className="text-sm text-destructive">{errors.schedule_id.message}</p>
                  )}
                </div>
              )}
            </div>

            <input type="hidden" {...register("date")} value={selectedDate} />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                {createReservationMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                {quotaInfo?.isFull ? "Kuota Penuh" : !formScheduleId ? "Pilih Jadwal" : "Daftarkan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction?.title || ""}
        description={pendingAction?.description || ""}
        onConfirm={confirmAction}
      />
    </div>
  )
}
