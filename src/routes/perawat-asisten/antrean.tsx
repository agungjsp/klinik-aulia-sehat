import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { Play, AlertTriangle } from "lucide-react"
import { useEffect } from "react"
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
import { AntreanHeader } from "@/components/antrean"
import { useAuthStore } from "@/stores/auth"
import { getApiErrorMessage } from "@/lib/api-error"
import type { Poly, Reservation, QueueStatusName } from "@/types"

const EMPTY_POLIES: Poly[] = []

const antreanSearchSchema = z.object({
  polyId: z.number().optional(),
  date: z.string().optional(),
})

export const Route = createFileRoute("/perawat-asisten/antrean")({
  component: PerawatAsistenAntreanPage,
  validateSearch: antreanSearchSchema,
})

function PerawatAsistenAntreanPage() {
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
    enabled: selectedPolyId !== null,
  })

  const toWithDoctorMutation = useReservationToWithDoctor()
  const toNoShowMutation = useReservationToNoShow()

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
    const queueId = reservation.queue?.id
    if (!queueId) {
      toast.error("Data antrean tidak tersedia.")
      return
    }
    try {
      const currentCallCount = getCallCount(reservation)
      await toWithDoctorMutation.mutateAsync(queueId)
      const newCallCount = currentCallCount + 1
      if (newCallCount === 1) {
        toast.success(`Memanggil pasien ${reservation.patient?.patient_name}`)
      } else {
        toast.info(`Panggilan ke-${newCallCount} untuk ${reservation.patient?.patient_name}`)
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleMarkNoShow = async (reservation: Reservation) => {
    const queueId = reservation.queue?.id
    if (!queueId) {
      toast.error("Data antrean tidak tersedia.")
      return
    }
    try {
      await toNoShowMutation.mutateAsync(queueId)
      toast.warning("Pasien ditandai tidak hadir")
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
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
        title="Panggil Pasien ke Dokter"
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
            <h2 className="font-semibold text-green-700">Sedang dengan Dokter</h2>
            <p className="text-sm text-green-600">{withDoctor.length} pasien</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : withDoctor.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien</p>
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
                          {reservation.poly?.name} • {reservation.bpjs ? "BPJS" : "Umum"}
                        </p>
                        {callCount > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            Panggilan: {callCount}/3
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {callCount >= 3 ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleMarkNoShow(reservation)}
                            disabled={isPending}
                          >
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            No Show
                          </Button>
                        ) : isFirst ? (
                          <Button
                            size="sm"
                            onClick={() => handleCallPatient(reservation)}
                            disabled={isPending}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Panggil Ulang
                          </Button>
                        ) : null}
                        <Badge variant="default" className="bg-green-600">
                          Dengan Dokter
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
                        {isFirst && callCount < 3 && (
                          <Button
                            size="sm"
                            onClick={() => handleCallPatient(reservation)}
                            disabled={isPending}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Panggil
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
