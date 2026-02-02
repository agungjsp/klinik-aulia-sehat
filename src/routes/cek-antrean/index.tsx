import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Search, RefreshCw, Phone, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useReservationList } from "@/hooks"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"
import type { QueueStatusName, Reservation } from "@/types"

export const Route = createFileRoute("/cek-antrean/")({
  component: CekAntreanPage,
})

function CekAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const [searchType, setSearchType] = useState<"whatsapp" | "bpjs">("bpjs")
  const [searchValue, setSearchValue] = useState("")
  const [submittedSearch, setSubmittedSearch] = useState<{
    type: "whatsapp" | "bpjs"
    value: string
  } | null>(null)

  // Fetch reservations when search is submitted
  const { data, isLoading, refetch } = useReservationList(
    submittedSearch
      ? {
          search: submittedSearch.value,
          date: today,
        }
      : undefined
  )

  const reservations = data?.data?.data || []

  // Filter to find matching reservation
  const matchingReservation = submittedSearch
    ? reservations.find((r) => {
        if (submittedSearch.type === "whatsapp") {
          return r.patient?.whatsapp_number?.includes(submittedSearch.value)
        } else {
          return r.patient?.no_bpjs?.includes(submittedSearch.value)
        }
      })
    : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      setSubmittedSearch({ type: searchType, value: searchValue.trim() })
    }
  }

  // Calculate position in queue
  const calculatePosition = (reservation: Reservation): number => {
    if (!reservation.queue) return 0
    
    const statusName = reservation.status?.status_name as QueueStatusName
    const activeStatuses: QueueStatusName[] = ["WAITING", "ANAMNESA", "WAITING_DOCTOR"]
    
    if (!activeStatuses.includes(statusName)) {
      return 0
    }

    // Count reservations with same poly and earlier queue time
    const ahead = reservations.filter((r) => {
      const rStatus = r.status?.status_name as QueueStatusName
      if (!activeStatuses.includes(rStatus)) return false
      if (r.poly_id !== reservation.poly_id) return false
      if (!r.queue || !reservation.queue) return false
      return (
        r.queue.re_reservation_time < reservation.queue.re_reservation_time &&
        r.id !== reservation.id
      )
    }).length

    return ahead
  }

  const formatQueueNumber = (num: number | string) => String(num).padStart(3, "0")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Klinik Aulia Sehat</h1>
          <p className="text-blue-600">Cek Status Antrean Anda</p>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
          </p>
        </div>

        {/* Search Type Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={searchType === "bpjs" ? "default" : "outline"}
            onClick={() => {
              setSearchType("bpjs")
              setSearchValue("")
              setSubmittedSearch(null)
            }}
            className="flex-1"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            No. BPJS
          </Button>
          <Button
            variant={searchType === "whatsapp" ? "default" : "outline"}
            onClick={() => {
              setSearchType("whatsapp")
              setSearchValue("")
              setSubmittedSearch(null)
            }}
            className="flex-1"
          >
            <Phone className="h-4 w-4 mr-2" />
            No. WhatsApp
          </Button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                searchType === "whatsapp"
                  ? "Masukkan nomor WhatsApp"
                  : "Masukkan nomor BPJS"
              }
              className="pl-9 h-11"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-11">
            Cek
          </Button>
        </form>

        {isLoading && (
          <div className="rounded-xl bg-white p-6 shadow-lg space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {submittedSearch && !isLoading && !matchingReservation && (
          <div className="rounded-xl bg-white p-6 shadow-lg text-center">
            <p className="text-lg text-muted-foreground">Antrean tidak ditemukan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pastikan {searchType === "whatsapp" ? "nomor WhatsApp" : "nomor BPJS"} benar
              dan Anda sudah terdaftar hari ini
            </p>
          </div>
        )}

        {matchingReservation && (
          <ReservationCard
            reservation={matchingReservation}
            position={calculatePosition(matchingReservation)}
            onRefresh={refetch}
            formatQueueNumber={formatQueueNumber}
          />
        )}

        {/* Show all today's reservations for this patient if multiple */}
        {submittedSearch && reservations.length > 1 && matchingReservation && (
          <div className="mt-4 rounded-xl bg-white p-4 shadow-lg">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Anda memiliki {reservations.length} reservasi hari ini:
            </p>
            <div className="space-y-2">
              {reservations.map((r) => {
                const statusName = r.status?.status_name as QueueStatusName
                const statusConfig = statusName ? QUEUE_STATUS_CONFIG[statusName] : null

                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      r.id === matchingReservation.id ? "bg-blue-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">
                        {r.queue?.queue_number ? formatQueueNumber(r.queue.queue_number) : "-"}
                      </span>
                      <span className="text-sm">{r.poly?.name}</span>
                    </div>
                    <Badge
                      className={`${statusConfig?.bgColor || ""} ${statusConfig?.color || ""}`}
                    >
                      {statusConfig?.label || statusName || "Unknown"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ReservationCardProps {
  reservation: Reservation
  position: number
  onRefresh: () => void
  formatQueueNumber: (num: number | string) => string
}

function ReservationCard({
  reservation,
  position,
  onRefresh,
  formatQueueNumber,
}: ReservationCardProps) {
  const statusName = reservation.status?.status_name as QueueStatusName
  const statusConfig = statusName ? QUEUE_STATUS_CONFIG[statusName] : null

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Nomor Antrean Anda</p>
        <p className="text-6xl font-bold text-blue-600 my-2">
          {reservation.queue?.queue_number
            ? formatQueueNumber(reservation.queue.queue_number)
            : "-"}
        </p>
        <Badge className={`${statusConfig?.bgColor || ""} ${statusConfig?.color || ""}`}>
          {statusConfig?.label || statusName || "Unknown"}
        </Badge>
      </div>

      {position > 0 && statusName !== "DONE" && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">Posisi dalam antrean</p>
          <p className="text-4xl font-bold text-blue-700">{position}</p>
          <p className="text-xs text-muted-foreground mt-1">orang di depan Anda</p>
        </div>
      )}

      {statusName === "DONE" && (
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600">Pemeriksaan telah selesai</p>
          <p className="text-xs text-muted-foreground mt-1">
            Silakan menuju ke kasir atau apotek
          </p>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nama</span>
          <span className="font-medium">{reservation.patient?.patient_name || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Poli</span>
          <span className="font-medium">{reservation.poly?.name || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tipe</span>
          <span className="font-medium">{reservation.bpjs ? "BPJS" : "Umum"}</span>
        </div>
        {reservation.queue?.re_reservation_time && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Waktu Daftar</span>
            <span className="font-medium">
              {reservation.queue.re_reservation_time.slice(0, 5)}
            </span>
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={onRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh Status
      </Button>
    </div>
  )
}
