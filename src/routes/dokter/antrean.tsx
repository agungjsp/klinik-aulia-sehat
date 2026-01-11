import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, Play, CheckCircle } from "lucide-react"
import {
  useReservationList,
  useReservationToWithDoctor,
  useReservationToDone,
  useStatusList,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Reservation, QueueStatusName } from "@/types"

export const Route = createFileRoute("/dokter/antrean")({
  component: DokterAntreanPage,
})

function DokterAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: reservationData, isLoading, refetch } = useReservationList({ date: today })
  const { data: statusData } = useStatusList()

  const toWithDoctorMutation = useReservationToWithDoctor()
  const toDoneMutation = useReservationToDone()

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    reservation: Reservation
    action: "withdoctor" | "done"
    title: string
    description: string
  } | null>(null)

  const reservations = reservationData?.data?.data || []
  const statuses = statusData?.data || []

  // Get status id by name
  const getStatusId = (statusName: QueueStatusName) => {
    return statuses.find((s) => s.status_name === statusName)?.id
  }

  const waitingDoctorId = getStatusId("WAITING_DOCTOR")
  const withDoctorId = getStatusId("WITH_DOCTOR")

  // Filter only relevant queues for dokter
  const waitingDoctor = reservations.filter((r) => r.status_id === waitingDoctorId)
  const inConsultation = reservations.filter((r) => r.status_id === withDoctorId)

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

    try {
      if (pendingAction.action === "withdoctor") {
        await toWithDoctorMutation.mutateAsync(pendingAction.reservation.id)
        toast.success("Pasien dipanggil untuk konsultasi")
      } else {
        await toDoneMutation.mutateAsync(pendingAction.reservation.id)
        toast.success("Konsultasi selesai")
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Gagal mengubah status")
    } finally {
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  // Helper to format queue number
  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  const isPending = toWithDoctorMutation.isPending || toDoneMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Antrean Pasien</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sedang Konsultasi */}
        <div className="rounded-lg border">
          <div className="border-b bg-yellow-50 p-4">
            <h2 className="font-semibold text-yellow-700">Sedang Konsultasi</h2>
            <p className="text-sm text-yellow-600">{inConsultation.length} pasien</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : inConsultation.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien</p>
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
                        {reservation.poly?.name} • {reservation.bpjs ? "BPJS" : "Umum"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "done",
                          "Selesai Konsultasi",
                          `Selesaikan konsultasi untuk pasien ${reservation.patient?.patient_name}?`
                        )
                      }
                      disabled={isPending}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Selesai
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
            <h2 className="font-semibold text-purple-700">Menunggu Konsultasi</h2>
            <p className="text-sm text-purple-600">{waitingDoctor.length} pasien</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : waitingDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien menunggu</p>
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
                        Selesai anamnesa: {reservation.queue?.call_time?.slice(0, 5) || "-"}
                      </p>
                    </div>
                  </div>
                  {idx === 0 && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          reservation,
                          "withdoctor",
                          "Panggil Pasien",
                          `Panggil pasien ${reservation.patient?.patient_name} ke ruang konsultasi?`
                        )
                      }
                      disabled={isPending}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Panggil
                    </Button>
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
