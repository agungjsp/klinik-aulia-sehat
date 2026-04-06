import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { format } from "date-fns"
import { Play, AlertTriangle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  useReservationList,
  useReservationToWithDoctor,
  useReservationToNoShow,
  useStatusList,
  usePolyList,
  useRealtimeQueue,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { AntreanHeader } from "@/components/antrean"
import { useAuthStore } from "@/stores/auth"
import { getApiErrorMessage } from "@/lib/api-error"
import { sortPoliesWithUmumFirst, getDefaultPolyId } from "@/lib/utils"
import type { Reservation, QueueStatusName } from "@/types"

const antreanSearchSchema = z.object({
  polyId: z.number().optional(),
  date: z.string().optional(),
})

export const Route = createFileRoute("/perawat-asisten/antrean")({
  component: PerawatAsistenAntreanPage,
  validateSearch: antreanSearchSchema,
})

function PerawatAsistenAntreanPage() {
  const { t } = useTranslation(["nurseQueue", "queue", "common"])
  const navigate = useNavigate({ from: "/perawat-asisten/antrean" })
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
  const toNoShowMutation = useReservationToNoShow()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    reservation: Reservation
    action: "call" | "noshow"
    title: string
    description: string
  } | null>(null)

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

  // Helper to get call count from backend data
  const getCallCount = (reservation: Reservation) => {
    return reservation.queue?.number_of_calls ?? 0
  }

  // Sort by queue number to ensure deterministic ordering
  const sortByQueueNumber = (a: Reservation, b: Reservation) => {
    const aNum = typeof a.queue?.queue_number === "number" ? a.queue.queue_number : 0
    const bNum = typeof b.queue?.queue_number === "number" ? b.queue.queue_number : 0
    return aNum - bNum
  }

  // Filter and sort relevant reservations
  const waitingDoctor = reservations
    .filter((r) => r.status_id === waitingDoctorId)
    .sort(sortByQueueNumber)
  const withDoctor = reservations
    .filter((r) => r.status_id === withDoctorId)
    .sort(sortByQueueNumber)

  // Handle poly change from header
  const handlePolyChange = (polyId: number | null) => {
    navigate({
      search: (prev) => ({ ...prev, polyId: polyId ?? undefined }),
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleCallPatient = async (reservation: Reservation) => {
    const reservationId = reservation.id
    if (!reservationId) {
      toast.error(t("nurseQueue:nurseAssistant.toasts.reservationDataUnavailable"))
      return
    }
    try {
      const currentCallCount = getCallCount(reservation)
      const result = await toWithDoctorMutation.mutateAsync(reservationId)
      if (result.autoNoShow) {
        toast.warning(
          t("nurseQueue:nurseAssistant.toasts.autoNoShow", {
            name: reservation.patient?.patient_name || "-",
          }),
        )
      } else {
        const newCallCount = currentCallCount + 1
        if (newCallCount === 1) {
          toast.success(
            t("nurseQueue:nurseAssistant.toasts.calledPatient", {
              name: reservation.patient?.patient_name || "-",
            }),
          )
        } else {
          toast.info(
            t("nurseQueue:nurseAssistant.toasts.recallCount", {
              count: newCallCount,
              name: reservation.patient?.patient_name || "-",
            }),
          )
        }
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleMarkNoShow = async (reservation: Reservation) => {
    const reservationId = reservation.id
    if (!reservationId) {
      toast.error(t("nurseQueue:nurseAssistant.toasts.reservationDataUnavailable"))
      return
    }
    try {
      await toNoShowMutation.mutateAsync(reservationId)
      toast.warning(t("nurseQueue:nurseAssistant.toasts.markedNoShow"))
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const requestAction = (
    reservation: Reservation,
    action: "call" | "noshow",
    title: string,
    description: string,
  ) => {
    setPendingAction({ reservation, action, title, description })
    setConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    if (pendingAction.action === "call") {
      await handleCallPatient(pendingAction.reservation)
    } else {
      await handleMarkNoShow(pendingAction.reservation)
    }
    setConfirmOpen(false)
    setPendingAction(null)
  }

  // Helper to format queue number
  const formatQueueNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return "--"
    return String(num).padStart(3, "0")
  }

  const isPending = toWithDoctorMutation.isPending || toNoShowMutation.isPending

  return (
    <div className="space-y-6">
      {/* Shared Header */}
      <AntreanHeader
        title={t("nurseQueue:nurseAssistant.headerTitle")}
        date={selectedDate}
        selectedPolyId={selectedPolyId}
        reservations={allReservations}
        onPolyChange={handlePolyChange}
        onRefresh={handleRefresh}
        showPolySelector={true}
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Sedang dengan Dokter */}
        <div className="rounded-lg border">
          <div className="border-b bg-green-50 p-4">
            <h2 className="font-semibold text-green-700">{t("nurseQueue:nurseAssistant.sections.withDoctor")}</h2>
            <p className="text-sm text-green-600">{t("nurseQueue:nurseAssistant.sections.patientCount", { count: withDoctor.length })}</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : withDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{t("nurseQueue:nurseAssistant.sections.noPatient")}</p>
            ) : (
              withDoctor.map((reservation, idx) => {
                const callCount = getCallCount(reservation)
                const isFirst = idx === 0

                return (
                  <div key={reservation.id} className="rounded-lg border bg-green-50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-2xl font-bold text-green-700">
                          {formatQueueNumber(reservation.queue?.queue_number)}
                        </p>
                        <p className="font-medium">{reservation.patient?.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.poly?.name} • {reservation.bpjs ? t("queue:patientTypes.bpjs") : t("queue:patientTypes.general")}
                        </p>
                        {callCount > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            {t("nurseQueue:nurseAssistant.actions.callCount", { count: callCount })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {callCount >= 3 ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              requestAction(
                                reservation,
                                "noshow",
                                t("nurseQueue:nurseAssistant.confirmations.markNoShowTitle"),
                                t("nurseQueue:nurseAssistant.confirmations.markNoShowDescription", {
                                  name: reservation.patient?.patient_name || "-",
                                }),
                              )
                            }
                            disabled={isPending}
                          >
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            {t("nurseQueue:nurseAssistant.actions.noShow")}
                          </Button>
                        ) : isFirst ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              requestAction(
                                reservation,
                                "call",
                                t("nurseQueue:nurseAssistant.confirmations.recallTitle"),
                                t("nurseQueue:nurseAssistant.confirmations.recallDescription", {
                                  name: reservation.patient?.patient_name || "-",
                                }),
                              )
                            }
                            disabled={isPending}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            {t("nurseQueue:nurseAssistant.actions.recall")}
                          </Button>
                        ) : null}
                        <Badge variant="default" className="bg-green-600">
                          {t("nurseQueue:nurseAssistant.actions.withDoctor")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Menunggu Dokter */}
        <div className="rounded-lg border">
          <div className="border-b bg-purple-50 p-4">
            <h2 className="font-semibold text-purple-700">{t("nurseQueue:nurseAssistant.sections.waitingForDoctorCall")}</h2>
            <p className="text-sm text-purple-600">{t("nurseQueue:nurseAssistant.sections.patientCount", { count: waitingDoctor.length })}</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : waitingDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{t("nurseQueue:nurseAssistant.sections.noWaitingPatient")}</p>
            ) : (
              waitingDoctor.map((reservation, idx) => {
                const callCount = getCallCount(reservation)
                const isFirst = idx === 0

                return (
                  <div
                    key={reservation.id}
                    className={`rounded-lg border p-3 ${
                      isFirst ? "bg-purple-50 border-purple-200" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold">
                          {formatQueueNumber(reservation.queue?.queue_number)}
                        </span>
                        <div>
                          <p className="font-medium">{reservation.patient?.patient_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.poly?.name} • {reservation.bpjs ? t("queue:patientTypes.bpjs") : t("queue:patientTypes.general")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {callCount > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            {t("nurseQueue:nurseAssistant.actions.callCount", { count: callCount })}
                          </Badge>
                        )}
                        {isFirst && callCount < 3 && withDoctor.length === 0 && (
                          <Button
                            size="sm"
                            onClick={() =>
                              requestAction(
                                reservation,
                                "call",
                                t("nurseQueue:nurseAssistant.confirmations.callTitle"),
                                t("nurseQueue:nurseAssistant.confirmations.callDescription", {
                                  name: reservation.patient?.patient_name || "-",
                                }),
                              )
                            }
                            disabled={isPending}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            {t("nurseQueue:nurseAssistant.actions.call")}
                          </Button>
                        )}
                        {isFirst && withDoctor.length > 0 && (
                          <Badge variant="secondary">{t("nurseQueue:nurseAssistant.actions.waitUntilDone")}</Badge>
                        )}
                        {idx > 0 && <Badge variant="outline">{t("nurseQueue:nurseAssistant.actions.queueOrder", { order: idx + 1 })}</Badge>}
                      </div>
                    </div>
                  </div>
                )
              })
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
        impactItems={
          pendingAction?.action === "noshow"
            ? [
                t("nurseQueue:nurseAssistant.confirmations.noShowImpact1"),
                t("nurseQueue:nurseAssistant.confirmations.noShowImpact2"),
              ]
            : [
                t("nurseQueue:nurseAssistant.confirmations.callImpact1"),
                t("nurseQueue:nurseAssistant.confirmations.callImpact2"),
              ]
        }
        recoveryHint={
          pendingAction?.action === "noshow"
            ? t("nurseQueue:nurseAssistant.confirmations.noShowRecoveryHint")
            : t("nurseQueue:nurseAssistant.confirmations.callRecoveryHint")
        }
        variant={pendingAction?.action === "noshow" ? "destructive" : "default"}
        onConfirm={confirmAction}
        confirmText={pendingAction?.action === "noshow" ? t("nurseQueue:nurseAssistant.actions.markNoShow") : t("nurseQueue:nurseAssistant.actions.continue")}
      />
    </div>
  )
}
