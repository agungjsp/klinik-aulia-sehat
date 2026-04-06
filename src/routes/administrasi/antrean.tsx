import { useState, useMemo, useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
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
import { PaginationControls } from "@/components/ui/pagination-controls"
import { SchedulePicker, SelectedScheduleSummary } from "@/components/schedule"
import { AntreanHeader } from "@/components/antrean"
import { PatientAutocomplete } from "@/components/patient"
import { PolySelect } from "@/components/poly"
import { useAuthStore } from "@/stores/auth"
import { cn, sortPoliesWithUmumFirst, getDefaultPolyId } from "@/lib/utils"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"
import { getApiErrorMessage } from "@/lib/api-error"
import { getQuotaUsage } from "@/lib/quota"
import { DataTableToolbar } from "@/components/data-table"
import type { Poly, Reservation, QueueStatusName, Schedule, Patient } from "@/types"

const EMPTY_POLIES: Poly[] = []
const EMPTY_RESERVATIONS: Reservation[] = []

const antreanSearchSchema = z.object({
  polyId: z.number().optional(),
  date: z.string().optional(),
  scheduleId: z.number().optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
})

export const Route = createFileRoute("/administrasi/antrean")({
  component: AdministrasiAntreanPage,
  validateSearch: antreanSearchSchema,
})

type RegisterForm = {
  patient_name: string
  whatsapp_number: string
  email?: string
  no_bpjs?: string
  bpjs: boolean
  poly_id: number
  schedule_id: number
  date: string
}


function AdministrasiAntreanPage() {
  const { t } = useTranslation(["common", "queue", "adminQueue"])
  const navigate = useNavigate({ from: "/administrasi/antrean" })
  const search = Route.useSearch() ?? {}
  const { user } = useAuthStore()
  const today = format(new Date(), "yyyy-MM-dd")

  // Get selected poly/date from search params or defaults
  const selectedPolyId = search.polyId ?? (user?.poly_id ?? null)
  const selectedDate = search.date ?? today
  const selectedScheduleId = search.scheduleId ?? null
  const currentPage = search.page ?? 1
  const perPage = search.perPage ?? 10

  // Fetch reservations for selected date with pagination
  const { data: reservationData, isLoading, refetch } = useReservationList({
    date: selectedDate,
    page: currentPage,
    per_page: perPage,
  })
  const { data: statusData } = useStatusList()
  const { data: polyData, isLoading: polyLoading } = usePolyList()

  // Realtime updates for selected poly
  useRealtimeQueue({
    polyId: selectedPolyId ?? 0,
    polies: polyData?.data,
    enabled: selectedPolyId !== null,
  })

  // Create mutation
  const createReservationMutation = useReservationCreate()
  const noShowMutation = useReservationToNoShow()
  const cancelledMutation = useReservationToCancelled()

  // Set default poly if not set and we have polies (Poli Umum as default)
  const polies = useMemo(() => sortPoliesWithUmumFirst(polyData?.data ?? EMPTY_POLIES), [polyData?.data])
  useEffect(() => {
    if (!selectedPolyId && polies.length > 0 && !search.polyId) {
      const defaultPolyId = getDefaultPolyId(polies, user?.poly_id)
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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    })
  }

  const handlePerPageChange = (newPerPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, perPage: newPerPage, page: 1 }),
    })
  }

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    reservation: Reservation
    action: "noshow" | "cancelled"
    title: string
    description: string
  } | null>(null)
  const [registerPayload, setRegisterPayload] = useState<RegisterForm | null>(null)

  // Registration form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1)
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
    resolver: zodResolver(
      z.object({
        patient_name: z.string().min(1, t("errors:validation.required", { field: t("adminQueue:form.patientName") })),
        whatsapp_number: z.string().min(10, t("errors:validation.minLength", { field: t("adminQueue:form.whatsappNumber"), min: 10 })),
        email: z.string().email(t("errors:validation.email")).optional().or(z.literal("")),
        no_bpjs: z.string().optional(),
        bpjs: z.boolean(),
        poly_id: z.number({ message: t("errors:validation.required", { field: t("common:labels.poly") }) }),
        schedule_id: z.number({ message: t("errors:validation.required", { field: t("nav:items.doctorSchedule") }) }),
        date: z.string(),
      }),
    ),
    defaultValues: {
      bpjs: true,
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

    const scheduleId = formScheduleId || selectedScheduleId
    const reservationsForSchedule = reservations.filter(
      (r: Reservation) => r.schedule_id === scheduleId
    ).length

    const usage = getQuotaUsage({
      quota: selectedSchedule.quota,
      used: reservationsForSchedule,
    })

    if (usage.isUnlimited) return null

    return {
      quota: usage.quota,
      used: usage.used,
      remaining: usage.remaining,
      isFull: usage.isFull,
    }
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
      const reservationId = pendingAction.reservation.id
      if (!reservationId) {
        toast.error(t("adminQueue:toasts.reservationDataUnavailable"))
        return
      }
      if (pendingAction.action === "noshow") {
        await noShowMutation.mutateAsync(reservationId)
        toast.success(t("adminQueue:toasts.patientMarkedNoShow"))
      } else {
        await cancelledMutation.mutateAsync(reservationId)
        toast.success(t("adminQueue:toasts.reservationCancelled"))
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
      bpjs: true,
      poly_id: selectedPolyId ?? undefined,
      schedule_id: undefined,
      date: selectedDate,
    })
    setShowSchedulePicker(false)
    setRegisterStep(1)
    setIsFormOpen(true)
  }

  const handleScheduleSelect = (scheduleId: number) => {
    setValue("schedule_id", scheduleId, { shouldValidate: true })
    setShowSchedulePicker(false)
    setRegisterStep(3)
  }

  const handlePatientSelect = (patient: Patient) => {
    setValue("patient_name", patient.patient_name, { shouldValidate: true })
    setValue("whatsapp_number", patient.whatsapp_number || "", { shouldValidate: true })
    setValue("email", patient.email || "")
    if (patient.no_bpjs) {
      setValue("no_bpjs", patient.no_bpjs)
      setValue("bpjs", true)
    }
  }

  const requestRegisterSubmit = handleSubmit(async (data) => {
    setRegisterPayload(data)
  })

  const confirmRegisterSubmit = async () => {
    if (!registerPayload) return
    try {
      const result = await createReservationMutation.mutateAsync({
        patient_name: registerPayload.patient_name,
        whatsapp_number: registerPayload.whatsapp_number,
        email: registerPayload.email || undefined,
        no_bpjs: registerPayload.no_bpjs || undefined,
        bpjs: registerPayload.bpjs,
        poly_id: registerPayload.poly_id,
        schedule_id: registerPayload.schedule_id,
        date: registerPayload.date,
      })
      
      const queueNumber = result.data?.queue?.queue_number
      toast.success(
        queueNumber
          ? t("adminQueue:toasts.patientRegisteredWithQueue", { queueNumber })
          : t("adminQueue:toasts.patientRegistered"),
      )
      setIsFormOpen(false)
      setRegisterStep(1)
      setRegisterPayload(null)
    } catch (error: unknown) {
      // Handle quota exceeded error specifically
      const errorMessage = getApiErrorMessage(error)
      const normalizedMessage = errorMessage.toLowerCase()
      if (
        (normalizedMessage.includes("whatsapp") || normalizedMessage.includes("bpjs")) &&
        (normalizedMessage.includes("already registered") || normalizedMessage.includes("sudah terdaftar"))
      ) {
        toast.error(t("adminQueue:toasts.duplicateContactOrBpjs"))
        return
      }
      if (
        normalizedMessage.includes("kuota") ||
        normalizedMessage.includes("quota") ||
        normalizedMessage.includes("penuh") ||
        normalizedMessage.includes("full")
      ) {
        toast.error(t("adminQueue:toasts.scheduleQuotaFull"))
        // Refetch to get latest quota state
        refetch()
      } else {
        toast.error(errorMessage)
      }
    }
  }

  // Helper to format queue number
  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  // Determine if submit should be disabled
  const isSubmitDisabled = createReservationMutation.isPending || (quotaInfo?.isFull ?? false) || !formScheduleId

  return (
    <div className="space-y-6">
      {/* Shared Header */}
      <AntreanHeader
        title={t("adminQueue:header.title")}
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
          {t("adminQueue:actions.registerPatient")}
        </Button>
      </div>

      {/* Queue List with Filters */}
      <div className="rounded-lg border">
        <div className="border-b p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold">{t("adminQueue:list.todayQueueList")}</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterPoly} onValueChange={setFilterPoly}>
              <SelectTrigger className="w-[180px]">
                {polyLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <SelectValue placeholder={t("adminQueue:filters.allPolies")} />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adminQueue:filters.allPolies")}</SelectItem>
                {polies.map((poly) => (
                  <SelectItem key={poly.id} value={String(poly.id)}>
                    {poly.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("adminQueue:filters.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("adminQueue:filters.allStatuses")}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t("adminQueue:filters.inProgress")}</SelectItem>
                {Object.entries(QUEUE_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {t(config.translationKey)}
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
                ? t("adminQueue:list.noQueueToday")
                : t("adminQueue:list.noQueueMatchFilter")}
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
                        {reservation.bpjs ? t("queue:patientTypes.bpjs") : t("queue:patientTypes.general")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig?.variant || "outline"}>
                      {statusConfig
                        ? t(statusConfig.translationKey)
                        : statusName || t("common:states.unknown")}
                    </Badge>
                    {statusName === "WAITING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleAction(
                            reservation,
                            "noshow",
                            t("adminQueue:confirm.markNoShowTitle"),
                            t("adminQueue:confirm.markNoShowDescription", {
                              name: reservation.patient?.patient_name || "-",
                            })
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

        {/* Pagination Controls */}
        {reservationData?.data && reservationData.data.total > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={reservationData.data.last_page}
            onPageChange={handlePageChange}
            perPage={perPage}
            onPerPageChange={handlePerPageChange}
            totalItems={reservationData.data.total}
            isPending={isLoading}
          />
        )}
      </div>

      {/* Register Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("adminQueue:dialog.title")}</DialogTitle>
            </DialogHeader>

          <form onSubmit={requestRegisterSubmit} className="space-y-5">
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/70 bg-muted/20 p-2">
              {[
                { id: 1 as const, label: t("adminQueue:dialog.steps.patient") },
                { id: 2 as const, label: t("adminQueue:dialog.steps.polyAndSchedule") },
                { id: 3 as const, label: t("adminQueue:dialog.steps.confirmation") },
              ].map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={cn(
                    "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    registerStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : registerStep > step.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground",
                  )}
                  onClick={() => setRegisterStep(step.id)}
                >
                  {step.id}. {step.label}
                </button>
              ))}
            </div>

            {/* Patient Type */}
            {registerStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>{t("adminQueue:form.patientType")}</Label>
                  <Controller
                    name="bpjs"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={field.value ? "default" : "outline"}
                          onClick={() => field.onChange(true)}
                          className="flex-1"
                        >
                          {t("queue:patientTypes.bpjs")}
                        </Button>
                        <Button
                          type="button"
                          variant={!field.value ? "default" : "outline"}
                          onClick={() => field.onChange(false)}
                          className="flex-1"
                        >
                          {t("queue:patientTypes.general")}
                        </Button>
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient_name">{t("adminQueue:form.patientName")}</Label>
                  <Controller
                    name="patient_name"
                    control={control}
                    render={({ field }) => (
                      <PatientAutocomplete
                        value={field.value || ""}
                        onChange={field.onChange}
                        onPatientSelect={handlePatientSelect}
                        placeholder={t("adminQueue:form.patientNamePlaceholder")}
                      />
                    )}
                  />
                  {errors.patient_name && (
                    <p className="text-sm text-destructive">{errors.patient_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">{t("adminQueue:form.whatsappNumber")}</Label>
                    <Input
                      id="whatsapp_number"
                      placeholder={t("adminQueue:form.whatsappPlaceholder")}
                      {...register("whatsapp_number")}
                    />
                    {errors.whatsapp_number && (
                      <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("adminQueue:form.emailOptional")}</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {isBpjs && (
                  <div className="space-y-2">
                    <Label htmlFor="no_bpjs">{t("adminQueue:form.bpjsNumber")}</Label>
                    <Input id="no_bpjs" placeholder={t("adminQueue:form.bpjsPlaceholder")} {...register("no_bpjs")} />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setRegisterStep(2)}>{t("adminQueue:form.continueToPolySchedule")}</Button>
                </div>
              </div>
            )}

            {registerStep === 2 && (
              <div className="space-y-4">
                <DataTableToolbar>
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">{t("adminQueue:form.selectPolyAndSchedule")}</Label>
                    <Badge variant="destructive" className="text-xs">{t("adminQueue:form.required")}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{t("adminQueue:form.today")}</span>
                  </div>
                </DataTableToolbar>

                <div className="space-y-2">
                  <PolySelect
                    value={formPolyId || undefined}
                    onChange={(value) => {
                      if (value) {
                        setValue("poly_id", value)
                        setValue("schedule_id", undefined as unknown as number)
                        setShowSchedulePicker(true)
                      }
                    }}
                    placeholder={t("adminQueue:form.selectPolyPlaceholder")}
                  />
                  {errors.poly_id && (
                    <p className="text-sm text-destructive">{errors.poly_id.message}</p>
                  )}
                </div>

                {!formPolyId ? (
                  <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-muted-foreground">
                    <p>{t("adminQueue:form.selectPolyFirst")}</p>
                  </div>
                ) : formScheduleId && !showSchedulePicker ? (
                  <div className="space-y-2">
                    <SelectedScheduleSummary
                      schedule={selectedSchedule}
                      reservations={reservations}
                      onClear={() => setShowSchedulePicker(true)}
                    />
                    {quotaInfo?.isFull && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <p>{t("adminQueue:form.scheduleQuotaFull")}</p>
                      </div>
                    )}
                  </div>
                ) : (
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

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setRegisterStep(1)}>{t("adminQueue:form.back")}</Button>
                  <Button type="button" onClick={() => setRegisterStep(3)} disabled={!formScheduleId}>{t("adminQueue:form.continueToConfirmation")}</Button>
                </div>
              </div>
            )}

            {registerStep === 3 && (
              <div className="space-y-4 rounded-lg border border-border/80 bg-muted/10 p-4">
                <h3 className="text-sm font-semibold">{t("adminQueue:form.registrationSummary")}</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="text-muted-foreground">{t("adminQueue:form.summary.patient")}:</span> {watch("patient_name") || "-"}</p>
                  <p><span className="text-muted-foreground">{t("adminQueue:form.summary.whatsappNumber")}:</span> {watch("whatsapp_number") || "-"}</p>
                  <p><span className="text-muted-foreground">{t("adminQueue:form.summary.type")}:</span> {watch("bpjs") ? t("queue:patientTypes.bpjs") : t("queue:patientTypes.general")}</p>
                  <p><span className="text-muted-foreground">{t("adminQueue:form.summary.poly")}:</span> {polies.find((poly) => poly.id === watch("poly_id"))?.name || "-"}</p>
                  <p><span className="text-muted-foreground">{t("adminQueue:form.summary.schedule")}:</span> {selectedSchedule ? `${selectedSchedule.start_time.slice(0, 5)} - ${selectedSchedule.end_time.slice(0, 5)}` : "-"}</p>
                </div>

                {(quotaInfo?.isFull ?? false) && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {t("adminQueue:form.scheduleQuotaFullPrompt")}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setRegisterStep(2)}>{t("adminQueue:form.back")}</Button>
                  <Button type="submit" disabled={isSubmitDisabled}>
                    {createReservationMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                    {quotaInfo?.isFull ? t("adminQueue:form.submitQuotaFull") : !formScheduleId ? t("adminQueue:form.submitChooseSchedule") : t("adminQueue:form.submitRegister")}
                  </Button>
                </div>
              </div>
            )}

            <input type="hidden" {...register("date")} value={selectedDate} />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("common:actions.cancel")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setRegisterStep(1)}>
                {t("adminQueue:form.resetSteps")}
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
        entityName={pendingAction?.reservation.patient?.patient_name}
        impactItems={[
          t("adminQueue:confirm.impacts.queueStatusChanged"),
          t("adminQueue:confirm.impacts.visibleRealtime"),
        ]}
        onConfirm={confirmAction}
      />

      <ConfirmDialog
        open={registerPayload !== null}
        onOpenChange={(open) => {
          if (!open) setRegisterPayload(null)
        }}
        title={t("adminQueue:confirm.registerTitle")}
        description={t("adminQueue:confirm.registerDescription")}
        entityName={registerPayload?.patient_name}
        impactItems={[
          t("adminQueue:confirm.registerImpact1"),
          t("adminQueue:confirm.registerImpact2"),
        ]}
        onConfirm={confirmRegisterSubmit}
        confirmText={t("adminQueue:actions.registerPatient")}
      />
    </div>
  )
}
