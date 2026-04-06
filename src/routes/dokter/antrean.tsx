import { useState, useEffect, useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { format } from "date-fns"
import { Play, CheckCircle, CalendarPlus } from "lucide-react"
import {
  useReservationList,
  useReservationToWithDoctor,
  useReservationToDone,
  useStatusList,
  usePolyList,
  useRealtimeQueue,
  useCheckupScheduleCreate,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AntreanHeader } from "@/components/antrean"
import { useAuthStore } from "@/stores/auth"
import { getApiErrorMessage } from "@/lib/api-error"
import { sortPoliesWithUmumFirst, getDefaultPolyId } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Reservation, QueueStatusName } from "@/types"

const antreanSearchSchema = z.object({
  polyId: z.number().optional(),
  date: z.string().optional(),
})

// Schema for follow-up schedule form
type FollowUpForm = {
  date: string
  description?: string
}

export const Route = createFileRoute("/dokter/antrean")({
  component: DokterAntreanPage,
  validateSearch: antreanSearchSchema,
})

function DokterAntreanPage() {
  const { t } = useTranslation(["doctorQueue", "queue", "common"])
  const navigate = useNavigate({ from: "/dokter/antrean" })
  const search = Route.useSearch() ?? {}
  const { user } = useAuthStore()
  const today = format(new Date(), "yyyy-MM-dd")

  // Get selected poly/date from search params or defaults
  const selectedPolyId = search.polyId ?? (user?.poly_id ?? null)
  const selectedDate = search.date ?? today

  // Fetch reservations for selected date
  const { data: reservationData, isLoading, refetch } = useReservationList({ date: selectedDate })
  const { data: statusData } = useStatusList()
  const { data: polyData } = usePolyList()

  // Realtime updates for selected poly
  useRealtimeQueue({
    polyId: selectedPolyId ?? 0,
    polies: polyData?.data,
    enabled: selectedPolyId !== null,
  })

  const toWithDoctorMutation = useReservationToWithDoctor()
  const toDoneMutation = useReservationToDone()
  const checkupScheduleCreateMutation = useCheckupScheduleCreate()

  // Follow-up schedule dialog state
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null)
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [followUpConfirmOpen, setFollowUpConfirmOpen] = useState(false)
  const [followUpDecision, setFollowUpDecision] = useState<"skip" | "create" | null>(null)
  const [followUpPayload, setFollowUpPayload] = useState<FollowUpForm | null>(null)

  const {
    register: registerFollowUp,
    handleSubmit: handleFollowUpSubmit,
    reset: resetFollowUp,
    formState: { errors: followUpErrors },
  } = useForm<FollowUpForm>({
    resolver: zodResolver(
      z.object({
        date: z.string().min(1, t("doctorQueue:validation.dateRequired")),
        description: z.string().optional(),
      }),
    ),
  })

  // Set default poly if not set and we have polies
  const polies = useMemo(
    () => sortPoliesWithUmumFirst(polyData?.data ?? []),
    [polyData?.data]
  )
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

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    reservation: Reservation
    action: "withdoctor" | "done"
    title: string
    description: string
  } | null>(null)

  const allReservations = reservationData?.data?.data || []
  const statuses = statusData?.data || []

  // Filter reservations by selected poly
  const reservations = selectedPolyId
    ? allReservations.filter((r) => r.poly_id === selectedPolyId)
    : allReservations

  // Get status id by name
  const getStatusId = (statusName: QueueStatusName) => {
    return statuses.find((s) => s.status_name === statusName)?.id
  }

  const waitingDoctorId = getStatusId("WAITING_DOCTOR")
  const withDoctorId = getStatusId("WITH_DOCTOR")

  // Filter only relevant queues for dokter
  const waitingDoctor = reservations.filter((r) => r.status_id === waitingDoctorId)
  const inConsultation = reservations.filter((r) => r.status_id === withDoctorId)

  // Handle poly change from header
  const handlePolyChange = (polyId: number | null) => {
    navigate({
      search: (prev) => ({ ...prev, polyId: polyId ?? undefined }),
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleAction = (
    reservation: Reservation,
    action: "withdoctor" | "done",
    title: string,
    description: string
  ) => {
    setPendingAction({ reservation, action, title, description })
    setConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    const reservationId = pendingAction.reservation.id
    if (!reservationId) {
      toast.error(t("doctorQueue:toasts.reservationDataUnavailable"))
      return
    }

    try {
      if (pendingAction.action === "withdoctor") {
        const result = await toWithDoctorMutation.mutateAsync(reservationId)
        if (result.autoNoShow) {
          toast.warning(t("doctorQueue:toasts.autoNoShow"))
        } else {
          toast.success(t("doctorQueue:toasts.calledToConsultation"))
        }
        setConfirmOpen(false)
        setPendingAction(null)
      } else {
        await toDoneMutation.mutateAsync(reservationId)
        toast.success(t("doctorQueue:toasts.consultationDone"))
        setConfirmOpen(false)
        // Show follow-up dialog after consultation is done
        setCompletedReservation(pendingAction.reservation)
        setFollowUpDialogOpen(true)
        setPendingAction(null)
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  // Handle closing follow-up dialog (no follow-up needed)
  const handleCloseFollowUpDialog = () => {
    setFollowUpDialogOpen(false)
    setCompletedReservation(null)
    setShowFollowUpForm(false)
    setFollowUpConfirmOpen(false)
    setFollowUpDecision(null)
    setFollowUpPayload(null)
    resetFollowUp()
  }

  const requestFollowUpDecision = (decision: "skip" | "create") => {
    if (decision === "create") {
      setShowFollowUpForm(true)
      resetFollowUp({ date: "", description: "" })
    }
    setFollowUpDecision(decision)
    setFollowUpConfirmOpen(true)
  }

  // Handle submitting follow-up schedule
  const requestFollowUpSubmit = handleFollowUpSubmit(async (data) => {
    setFollowUpPayload(data)
    setFollowUpDecision("create")
    setFollowUpConfirmOpen(true)
  })

  const confirmFollowUpAction = async () => {
    if (followUpDecision === "skip") {
      handleCloseFollowUpDialog()
      return
    }

    if (!followUpPayload) return

    if (!completedReservation?.patient_id || !completedReservation?.poly_id) {
      toast.error(t("doctorQueue:toasts.patientDataUnavailable"))
      return
    }

    try {
      await checkupScheduleCreateMutation.mutateAsync({
        patient_id: completedReservation.patient_id,
        poly_id: completedReservation.poly_id,
        date: followUpPayload.date,
        description: followUpPayload.description || "",
      })
      toast.success(t("doctorQueue:toasts.followUpAdded"))
      handleCloseFollowUpDialog()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  // Helper to format queue number
  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  const isPending = toWithDoctorMutation.isPending || toDoneMutation.isPending

  return (
    <div className="space-y-6">
      {/* Shared Header */}
      <AntreanHeader
        title={t("doctorQueue:header.title")}
        date={selectedDate}
        selectedPolyId={selectedPolyId}
        reservations={allReservations}
        onPolyChange={handlePolyChange}
        onRefresh={handleRefresh}
        showPolySelector={true}
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Sedang Konsultasi */}
        <div className="rounded-lg border">
          <div className="border-b bg-yellow-50 p-4">
            <h2 className="font-semibold text-yellow-700">{t("doctorQueue:sections.inConsultation")}</h2>
            <p className="text-sm text-yellow-600">{t("doctorQueue:sections.patientCount", { count: inConsultation.length })}</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : inConsultation.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{t("doctorQueue:sections.noPatient")}</p>
            ) : (
              inConsultation.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border bg-yellow-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-2xl font-bold text-yellow-700">
                        {reservation.queue?.queue_number
                          ? formatQueueNumber(reservation.queue.queue_number)
                          : "-"}
                      </p>
                      <p className="font-medium">{reservation.patient?.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.poly?.name} • {reservation.bpjs ? t("queue:patientTypes.bpjs") : t("queue:patientTypes.general")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "done",
                          t("doctorQueue:confirmations.completeTitle"),
                          t("doctorQueue:confirmations.completeDescription", {
                            name: reservation.patient?.patient_name || "-",
                          })
                        )
                      }
                      disabled={isPending}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {t("doctorQueue:actions.complete")}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menunggu Konsultasi */}
        <div className="rounded-lg border">
          <div className="border-b bg-purple-50 p-4">
            <h2 className="font-semibold text-purple-700">{t("doctorQueue:sections.waitingConsultation")}</h2>
            <p className="text-sm text-purple-600">{t("doctorQueue:sections.patientCount", { count: waitingDoctor.length })}</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : waitingDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{t("doctorQueue:sections.noWaitingPatient")}</p>
            ) : (
              waitingDoctor.map((reservation, idx) => (
                <div
                  key={reservation.id}
                  className={`rounded-lg border p-3 flex items-center justify-between ${
                    idx === 0 ? "bg-purple-50 border-purple-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold">
                      {reservation.queue?.queue_number
                        ? formatQueueNumber(reservation.queue.queue_number)
                        : "-"}
                    </span>
                    <div>
                      <p className="font-medium">{reservation.patient?.patient_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("doctorQueue:sections.finishedAnamnesisAt", {
                          time: reservation.queue?.call_time?.slice(0, 5) || "-",
                        })}
                      </p>
                    </div>
                  </div>
                  {idx === 0 && inConsultation.length === 0 && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "withdoctor",
                          t("doctorQueue:confirmations.callTitle"),
                          t("doctorQueue:confirmations.callDescription", {
                            name: reservation.patient?.patient_name || "-",
                          })
                        )
                      }
                      disabled={isPending}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      {t("doctorQueue:actions.call")}
                    </Button>
                  )}
                  {idx === 0 && inConsultation.length > 0 && (
                    <Badge variant="secondary">{t("doctorQueue:sections.waitUntilDone")}</Badge>
                  )}
                  {idx > 0 && <Badge variant="outline">{t("doctorQueue:sections.queueOrder", { order: idx + 1 })}</Badge>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction?.title || ""}
        description={pendingAction?.description || ""}
        entityName={pendingAction?.reservation.patient?.patient_name}
        impactItems={[
          t("doctorQueue:confirmations.realtimeImpact"),
          pendingAction?.action === "done"
            ? t("doctorQueue:confirmations.doneImpact")
            : t("doctorQueue:confirmations.callImpact"),
        ]}
        onConfirm={confirmAction}
      />

      {/* Follow-up Schedule Dialog */}
      <Dialog open={followUpDialogOpen} onOpenChange={handleCloseFollowUpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              {t("doctorQueue:followUp.title")}
            </DialogTitle>
            <DialogDescription>
              {t("doctorQueue:followUp.description", {
                name: completedReservation?.patient?.patient_name || "-",
              })}
            </DialogDescription>
          </DialogHeader>

          {!showFollowUpForm ? (
              <DialogFooter className="flex gap-2 sm:justify-center">
              <Button variant="outline" onClick={() => requestFollowUpDecision("skip")}>
                {t("doctorQueue:followUp.noNeed")}
              </Button>
              <Button onClick={() => requestFollowUpDecision("create")}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                {t("doctorQueue:followUp.scheduleNow")}
              </Button>
            </DialogFooter>
          ) : (
            <form onSubmit={requestFollowUpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("doctorQueue:followUp.patientName")}</Label>
                <Input 
                  value={completedReservation?.patient?.patient_name || ""} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("doctorQueue:followUp.poly")}</Label>
                <Input 
                  value={completedReservation?.poly?.name || ""} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-date">{t("doctorQueue:followUp.date")}</Label>
                <Input 
                  id="follow-up-date"
                  type="date" 
                  min={format(new Date(), "yyyy-MM-dd")}
                  {...registerFollowUp("date")} 
                />
                <p className="text-xs text-muted-foreground">{t("doctorQueue:followUp.dateHint")}</p>
                {followUpErrors.date && (
                  <p className="text-sm text-destructive">{followUpErrors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-description">{t("doctorQueue:followUp.noteOptional")}</Label>
                <Textarea 
                  id="follow-up-description"
                  placeholder={t("doctorQueue:followUp.notePlaceholder")}
                  {...registerFollowUp("description")} 
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowFollowUpForm(false)}>
                  {t("doctorQueue:followUp.back")}
                </Button>
                <Button type="submit" disabled={checkupScheduleCreateMutation.isPending}>
                  {checkupScheduleCreateMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                  {t("doctorQueue:followUp.saveSchedule")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={followUpConfirmOpen}
        onOpenChange={setFollowUpConfirmOpen}
        title={
          followUpDecision === "skip"
            ? t("doctorQueue:followUp.skipTitle")
            : t("doctorQueue:followUp.confirmTitle")
        }
        description={
          followUpDecision === "skip"
            ? t("doctorQueue:followUp.skipDescription", {
                name: completedReservation?.patient?.patient_name || "-",
              })
            : t("doctorQueue:followUp.confirmDescription", {
                name: completedReservation?.patient?.patient_name || "-",
              })
        }
        entityName={completedReservation?.patient?.patient_name}
        impactItems={
          followUpDecision === "skip"
            ? [
                t("doctorQueue:followUp.skipImpact1"),
                t("doctorQueue:followUp.skipImpact2"),
              ]
            : [
                t("doctorQueue:followUp.createImpact1"),
                t("doctorQueue:followUp.createImpact2"),
              ]
        }
        onConfirm={confirmFollowUpAction}
        confirmText={followUpDecision === "skip" ? t("doctorQueue:followUp.skipConfirm") : t("doctorQueue:followUp.saveSchedule")}
      />
    </div>
  )
}
