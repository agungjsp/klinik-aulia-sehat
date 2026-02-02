import { useState, useEffect, useMemo } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { Play, UserCheck } from "lucide-react"
import {
  useReservationList,
  useReservationToAnamnesa,
  useReservationToWaitingDoctor,
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

export const Route = createFileRoute("/perawat/antrean")({
  component: PerawatAntreanPage,
  validateSearch: antreanSearchSchema,
})

function PerawatAntreanPage() {
  const navigate = useNavigate({ from: "/perawat/antrean" })
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

  const toAnamnesaMutation = useReservationToAnamnesa()
  const toWaitingDoctorMutation = useReservationToWaitingDoctor()

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
    action: "anamnesa" | "waitingdoctor"
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

  const waitingId = getStatusId("WAITING")
  const anamnesaId = getStatusId("ANAMNESA")

  // Filter only relevant queues for perawat
  const waitingAnamnesa = reservations.filter((r) => r.status_id === waitingId)
  const inAnamnesa = reservations.filter((r) => r.status_id === anamnesaId)

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
    action: "anamnesa" | "waitingdoctor",
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
      toast.error("Data reservasi tidak tersedia.")
      return
    }

    try {
      if (pendingAction.action === "anamnesa") {
        const result = await toAnamnesaMutation.mutateAsync(reservationId)
        if (result.autoNoShow) {
          toast.warning("Pasien tidak hadir setelah 3x panggilan, status diubah menjadi NO SHOW")
        } else {
          toast.success("Pasien dipanggil untuk anamnesa")
        }
      } else {
        await toWaitingDoctorMutation.mutateAsync(reservationId)
        toast.success("Anamnesa selesai, pasien menunggu dokter")
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  // Helper to format queue number
  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  const isPending = toAnamnesaMutation.isPending || toWaitingDoctorMutation.isPending

  return (
    <div className="space-y-6">
      {/* Shared Header */}
      <AntreanHeader
        title="Antrean Anamnesa"
        date={selectedDate}
        selectedPolyId={selectedPolyId}
        reservations={allReservations}
        onPolyChange={handlePolyChange}
        onRefresh={handleRefresh}
        showPolySelector={true}
      />

      <div className="grid grid-cols-2 gap-6">
        {/* Sedang Anamnesa */}
        <div className="rounded-lg border">
          <div className="border-b bg-orange-50 p-4">
            <h2 className="font-semibold text-orange-700">Sedang Anamnesa</h2>
            <p className="text-sm text-orange-600">{inAnamnesa.length} pasien</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : inAnamnesa.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien</p>
            ) : (
              inAnamnesa.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border bg-orange-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-2xl font-bold text-orange-700">
                        {reservation.queue?.queue_number
                          ? formatQueueNumber(reservation.queue.queue_number)
                          : "-"}
                      </p>
                      <p className="font-medium">{reservation.patient?.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.poly?.name} • {reservation.bpjs ? "BPJS" : "Umum"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "waitingdoctor",
                          "Selesai Anamnesa",
                          `Selesaikan anamnesa untuk pasien ${reservation.patient?.patient_name} dan arahkan ke dokter?`
                        )
                      }
                      disabled={isPending}
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Selesai
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menunggu Anamnesa */}
        <div className="rounded-lg border">
          <div className="border-b bg-blue-50 p-4">
            <h2 className="font-semibold text-blue-700">Menunggu Anamnesa</h2>
            <p className="text-sm text-blue-600">{waitingAnamnesa.length} pasien</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : waitingAnamnesa.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien menunggu</p>
            ) : (
              waitingAnamnesa.map((reservation, idx) => (
                <div
                  key={reservation.id}
                  className={`rounded-lg border p-3 flex items-center justify-between ${
                    idx === 0 ? "bg-blue-50 border-blue-200" : ""
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
                        Daftar: {reservation.queue?.re_reservation_time?.slice(0, 5) || "-"}
                      </p>
                    </div>
                  </div>
                  {idx === 0 && inAnamnesa.length === 0 && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "anamnesa",
                          "Panggil Pasien",
                          `Panggil pasien ${reservation.patient?.patient_name} ke ruang anamnesa?`
                        )
                      }
                      disabled={isPending}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Panggil
                    </Button>
                  )}
                  {idx === 0 && inAnamnesa.length > 0 && (
                    <Badge variant="secondary">Tunggu pasien selesai</Badge>
                  )}
                  {idx > 0 && <Badge variant="outline">Antrean ke-{idx + 1}</Badge>}
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
        onConfirm={confirmAction}
      />
    </div>
  )
}
