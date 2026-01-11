import { useState, useMemo } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, XCircle, Plus, CheckCircle, Filter, Users, Clock, Activity, AlertTriangle, CalendarDays } from "lucide-react"
import {
  useReservationList,
  useReservationCreate,
  useReservationToNoShow,
  useReservationToCancelled,
  usePolyList,
  useScheduleList,
  useStatusList,
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
import { Card, CardContent } from "@/components/ui/card"
import { SchedulePicker, SelectedScheduleSummary } from "@/components/schedule"
import { cn } from "@/lib/utils"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"
import type { Reservation, QueueStatusName, Schedule } from "@/types"

export const Route = createFileRoute("/administrasi/antrean")({
  component: AdministrasiAntreanPage,
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
  const today = format(new Date(), "yyyy-MM-dd")

  // Fetch reservations for today
  const { data: reservationData, isLoading, refetch } = useReservationList({ date: today })
  const { data: statusData } = useStatusList()

  // Create mutation
  const createReservationMutation = useReservationCreate()
  const noShowMutation = useReservationToNoShow()
  const cancelledMutation = useReservationToCancelled()

  // Filter state
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
  const { data: polyData, isLoading: polyLoading } = usePolyList()
  const { data: scheduleData, isLoading: scheduleLoading } = useScheduleList({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    date: today, // Only today's schedules
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
      date: today,
    },
  })

  const selectedPolyId = watch("poly_id")
  const selectedScheduleId = watch("schedule_id")
  const isBpjs = watch("bpjs")
  const schedules = scheduleData?.data || []
  const filteredSchedules = selectedPolyId
    ? schedules.filter((s: Schedule) => s.doctor?.poly_id === selectedPolyId && s.date === today)
    : []
  const polies = polyData?.data || []
  const statuses = statusData?.data || []
  const reservations = reservationData?.data?.data || []

  // Get selected schedule object
  const selectedSchedule = schedules.find((s: Schedule) => s.id === selectedScheduleId)

  // Compute quota info for selected schedule
  const quotaInfo = useMemo(() => {
    if (!selectedSchedule) return null

    const quota = selectedSchedule.quota
    if (quota === null || quota === undefined) return null

    const reservationsForSchedule = reservations.filter(
      (r: Reservation) => r.schedule_id === selectedScheduleId
    ).length

    const remaining = Math.max(0, quota - reservationsForSchedule)
    const isFull = remaining === 0

    return { quota, used: reservationsForSchedule, remaining, isFull }
  }, [selectedSchedule, reservations, selectedScheduleId])

  // Get status id by name
  const getStatusId = (statusName: QueueStatusName) => {
    return statuses.find((s) => s.status_name === statusName)?.id
  }

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

  // Calculate summary based on status
  const waitingId = getStatusId("WAITING")
  const anamnesaId = getStatusId("ANAMNESA")
  const waitingDoctorId = getStatusId("WAITING_DOCTOR")
  const withDoctorId = getStatusId("WITH_DOCTOR")
  const doneId = getStatusId("DONE")
  const noShowId = getStatusId("NO_SHOW")

  const summary = {
    total: reservations.length,
    waiting: reservations.filter((r: Reservation) => r.status_id === waitingId).length,
    inProgress: reservations.filter((r: Reservation) =>
      [anamnesaId, waitingDoctorId, withDoctorId].includes(r.status_id)
    ).length,
    done: reservations.filter((r: Reservation) => r.status_id === doneId).length,
    noShow: reservations.filter((r: Reservation) => r.status_id === noShowId).length,
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
      if (pendingAction.action === "noshow") {
        await noShowMutation.mutateAsync(pendingAction.reservation.id)
        toast.success("Pasien ditandai tidak hadir")
      } else {
        await cancelledMutation.mutateAsync(pendingAction.reservation.id)
        toast.success("Reservasi dibatalkan")
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Gagal mengubah status")
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
      poly_id: undefined,
      schedule_id: undefined,
      date: today,
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
      const err = error as { response?: { data?: { message?: string }; status?: number } }
      
      // Handle quota exceeded error specifically
      const errorMessage = err.response?.data?.message || ""
      if (
        err.response?.status === 422 ||
        err.response?.status === 409 ||
        errorMessage.toLowerCase().includes("kuota") ||
        errorMessage.toLowerCase().includes("quota") ||
        errorMessage.toLowerCase().includes("penuh") ||
        errorMessage.toLowerCase().includes("full")
      ) {
        toast.error("Kuota jadwal sudah penuh. Silakan pilih jadwal lain.")
        // Refetch to get latest quota state
        refetch()
      } else {
        toast.error(errorMessage || "Gagal mendaftarkan pasien")
      }
    }
  })

  // Helper to format queue number
  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  // Determine if submit should be disabled
  const isSubmitDisabled = createReservationMutation.isPending || (quotaInfo?.isFull ?? false) || !selectedScheduleId

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendaftaran & Antrean</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openRegisterForm}>
            <Plus className="mr-2 h-4 w-4" />
            Daftar Pasien
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Pasien"
              value={summary.total}
              icon={Users}
              color="slate"
              active={filterStatus === "all"}
              onClick={() => setFilterStatus("all")}
            />
            <SummaryCard
              title={QUEUE_STATUS_CONFIG.WAITING.label}
              value={summary.waiting}
              icon={Clock}
              color="blue"
              active={filterStatus === "WAITING"}
              onClick={() => setFilterStatus("WAITING")}
            />
            <SummaryCard
              title="Sedang Proses"
              value={summary.inProgress}
              icon={Activity}
              color="yellow"
              active={filterStatus === "IN_PROGRESS"}
              onClick={() => setFilterStatus("IN_PROGRESS")}
            />
            <SummaryCard
              title={QUEUE_STATUS_CONFIG.DONE.label}
              value={summary.done}
              icon={CheckCircle}
              color="green"
              active={filterStatus === "DONE"}
              onClick={() => setFilterStatus("DONE")}
            />
            <SummaryCard
              title="Tidak Hadir"
              value={summary.noShow}
              icon={XCircle}
              color="gray"
              active={filterStatus === "NO_SHOW"}
              onClick={() => setFilterStatus("NO_SHOW")}
            />
          </>
        )}
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

              {!selectedPolyId ? (
                <div className="p-4 rounded-lg border border-dashed bg-muted/30 text-center text-muted-foreground">
                  <p>Pilih poli terlebih dahulu untuk melihat jadwal dokter</p>
                </div>
              ) : selectedScheduleId && !showSchedulePicker ? (
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
                    selectedScheduleId={selectedScheduleId}
                    onSelect={handleScheduleSelect}
                    isLoading={scheduleLoading}
                  />
                  {errors.schedule_id && (
                    <p className="text-sm text-destructive">{errors.schedule_id.message}</p>
                  )}
                </div>
              )}
            </div>

            <input type="hidden" {...register("date")} value={today} />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                {createReservationMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                {quotaInfo?.isFull ? "Kuota Penuh" : !selectedScheduleId ? "Pilih Jadwal" : "Daftarkan"}
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

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: "slate" | "blue" | "yellow" | "green" | "gray"
  active?: boolean
  onClick?: () => void
}

function SummaryCard({ title, value, icon: Icon, color, active, onClick }: SummaryCardProps) {
  const colorStyles = {
    slate: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500",
    blue: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500",
    green: "bg-green-50 text-green-700 border-green-200 ring-green-500",
    gray: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500",
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border",
        colorStyles[color],
        active && "ring-2 ring-offset-1"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <Icon className="h-4 w-4 opacity-70" />
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  )
}
