import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, Play, AlertTriangle } from "lucide-react"
import { useState } from "react"
import {
  useReservationList,
  useReservationToWithDoctor,
  useReservationToNoShow,
  useStatusList,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Reservation, QueueStatusName } from "@/types"

export const Route = createFileRoute("/perawat-asisten/antrean")({
  component: PerawatAsistenAntreanPage,
})

function PerawatAsistenAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: reservationData, isLoading, refetch } = useReservationList({ date: today })
  const { data: statusData } = useStatusList()
  
  const toWithDoctorMutation = useReservationToWithDoctor()
  const toNoShowMutation = useReservationToNoShow()

  // Track call count per reservation
  const [callCounts, setCallCounts] = useState<Record<number, number>>({})

  const reservations = reservationData?.data?.data || []
  const statuses = statusData?.data || []

  // Get status id by name
  const getStatusId = (statusName: QueueStatusName) => {
    return statuses.find((s) => s.status_name === statusName)?.id
  }

  const waitingDoctorId = getStatusId("WAITING_DOCTOR")
  const withDoctorId = getStatusId("WITH_DOCTOR")

  // Filter only relevant reservations
  const waitingDoctor = reservations.filter((r) => r.status_id === waitingDoctorId)
  const withDoctor = reservations.filter((r) => r.status_id === withDoctorId)

  const handleCallPatient = async (reservation: Reservation) => {
    const currentCount = callCounts[reservation.id] || 0
    const newCount = currentCount + 1

    if (newCount >= 3) {
      // 3x called, mark as no-show
      try {
        await toNoShowMutation.mutateAsync(reservation.id)
        toast.warning("Pasien tidak hadir setelah 3x panggilan")
        setCallCounts((prev) => ({ ...prev, [reservation.id]: 0 }))
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err.response?.data?.message || "Gagal mengubah status")
      }
    } else {
      // Update call count and trigger call
      setCallCounts((prev) => ({ ...prev, [reservation.id]: newCount }))

      if (newCount === 1) {
        // First call, update status to WITH_DOCTOR
        try {
          await toWithDoctorMutation.mutateAsync(reservation.id)
          toast.success(`Memanggil pasien ${reservation.patient?.patient_name}`)
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } }
          toast.error(err.response?.data?.message || "Gagal mengubah status")
        }
      } else {
        toast.info(`Panggilan ke-${newCount} untuk ${reservation.patient?.patient_name}`)
      }
    }
  }

  const handleMarkNoShow = async (reservation: Reservation) => {
    try {
      await toNoShowMutation.mutateAsync(reservation.id)
      toast.warning("Pasien ditandai tidak hadir")
      setCallCounts((prev) => ({ ...prev, [reservation.id]: 0 }))
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Gagal mengubah status")
    }
  }

  const getCallCount = (reservationId: number) => callCounts[reservationId] || 0

  // Helper to format queue number
  const formatQueueNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return "--"
    return String(num).padStart(3, "0")
  }

  const isPending = toWithDoctorMutation.isPending || toNoShowMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panggil Pasien ke Dokter</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sedang dengan Dokter */}
        <div className="rounded-lg border">
          <div className="border-b bg-green-50 p-4">
            <h2 className="font-semibold text-green-700">Sedang dengan Dokter</h2>
            <p className="text-sm text-green-600">{withDoctor.length} pasien</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : withDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien</p>
            ) : (
              withDoctor.map((reservation) => (
                <div key={reservation.id} className="rounded-lg border bg-green-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-2xl font-bold text-green-700">
                        {formatQueueNumber(reservation.queue?.queue_number)}
                      </p>
                      <p className="font-medium">{reservation.patient?.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.poly?.name} • {reservation.bpjs ? "BPJS" : "Umum"}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Dengan Dokter
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menunggu Dokter */}
        <div className="rounded-lg border">
          <div className="border-b bg-purple-50 p-4">
            <h2 className="font-semibold text-purple-700">Menunggu Dipanggil Dokter</h2>
            <p className="text-sm text-purple-600">{waitingDoctor.length} pasien</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : waitingDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien menunggu</p>
            ) : (
              waitingDoctor.map((reservation, idx) => {
                const callCount = getCallCount(reservation.id)

                return (
                  <div
                    key={reservation.id}
                    className={`rounded-lg border p-3 ${
                      idx === 0 ? "bg-purple-50 border-purple-200" : ""
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
                            {reservation.poly?.name} • {reservation.bpjs ? "BPJS" : "Umum"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {callCount > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            Panggilan: {callCount}/3
                          </Badge>
                        )}
                        {idx === 0 && callCount < 3 && (
                          <Button
                            size="sm"
                            onClick={() => handleCallPatient(reservation)}
                            disabled={isPending}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Panggil
                          </Button>
                        )}
                        {idx === 0 && callCount >= 2 && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleMarkNoShow(reservation)}
                            disabled={isPending}
                          >
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            No Show
                          </Button>
                        )}
                        {idx > 0 && <Badge variant="outline">Antrean ke-{idx + 1}</Badge>}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
