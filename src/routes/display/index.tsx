import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useReservationList, useStatusList } from "@/hooks"
import { Clock, Activity, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Poly, Reservation, QueueStatusName } from "@/types"

export const Route = createFileRoute("/display/")({
  component: DisplayPage,
})

function DisplayPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: reservationData, refetch } = useReservationList({ date: today })
  const { data: statusData } = useStatusList()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [refetch])

  const reservations = reservationData?.data?.data || []
  const statuses = statusData?.data || []

  // Get status id by name
  const getStatusId = (statusName: QueueStatusName) => {
    return statuses.find((s) => s.status_name === statusName)?.id
  }

  // Get unique polis
  const polis = useMemo(() => {
    const polyMap = new Map<number, Poly>()
    for (const reservation of reservations) {
      if (reservation.poly && !polyMap.has(reservation.poly.id)) {
        polyMap.set(reservation.poly.id, reservation.poly)
      }
    }
    return Array.from(polyMap.values())
  }, [reservations])

  // Group reservations by poly
  const reservationsByPoly = useMemo(() => {
    const grouped = new Map<number, Reservation[]>()
    for (const reservation of reservations) {
      const polyId = reservation.poly_id
      if (!grouped.has(polyId)) {
        grouped.set(polyId, [])
      }
      grouped.get(polyId)!.push(reservation)
    }
    return grouped
  }, [reservations])

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-900 overflow-hidden font-sans text-white">
      
      {/* Header - Compact but readable */}
      <header className="flex h-20 items-center justify-between bg-slate-800 px-8 border-b-4 border-emerald-500">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              KLINIK AULIA SEHAT
            </h1>
            <p className="text-sm text-emerald-400 font-medium tracking-wide">
              SISTEM ANTREAN DIGITAL
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-lg font-medium text-slate-300">
              {format(currentTime, "EEEE", { locale: localeId })}
            </p>
            <p className="text-xl font-bold">
              {format(currentTime, "d MMMM yyyy", { locale: localeId })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500 px-5 py-2 rounded-xl">
            <Clock className="h-6 w-6" />
            <span className="text-3xl font-black tabular-nums">
              {format(currentTime, "HH:mm")}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
        {polis.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Users className="h-32 w-32 mx-auto mb-6 text-slate-600" />
              <p className="text-4xl font-bold text-slate-500">Belum Ada Antrean Hari Ini</p>
            </div>
          </div>
        ) : (
          <div className={cn(
            "h-full grid gap-6",
            polis.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {polis.map((poly) => (
              <PolySectionSeniorFriendly 
                key={poly.id} 
                poly={poly} 
                reservations={reservationsByPoly.get(poly.id) || []}
                getStatusId={getStatusId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer - Running Text */}
      <footer className="h-16 bg-emerald-600 flex items-center overflow-hidden">
        <div className="flex w-full whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-16 text-xl font-medium px-4">
            <span>🏥 Selamat Datang di Klinik Aulia Sehat</span>
            <span>•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span>•</span>
            <span>Buka Senin - Sabtu, 08.00 - 21.00 WIB</span>
            <span>•</span>
            <span>🏥 Selamat Datang di Klinik Aulia Sehat</span>
            <span>•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span>•</span>
            <span>Buka Senin - Sabtu, 08.00 - 21.00 WIB</span>
          </div>
          <div className="animate-marquee flex items-center gap-16 text-xl font-medium px-4" aria-hidden="true">
            <span>🏥 Selamat Datang di Klinik Aulia Sehat</span>
            <span>•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span>•</span>
            <span>Buka Senin - Sabtu, 08.00 - 21.00 WIB</span>
            <span>•</span>
            <span>🏥 Selamat Datang di Klinik Aulia Sehat</span>
            <span>•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span>•</span>
            <span>Buka Senin - Sabtu, 08.00 - 21.00 WIB</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  )
}

// ============================================
// SENIOR-FRIENDLY POLY SECTION
// Large numbers on RIGHT side, high contrast
// ============================================
interface PolySectionProps {
  poly: Poly
  reservations: Reservation[]
  getStatusId: (statusName: QueueStatusName) => number | undefined
}

function PolySectionSeniorFriendly({ poly, reservations, getStatusId }: PolySectionProps) {
  const withDoctorId = getStatusId("WITH_DOCTOR")
  const anamnesaId = getStatusId("ANAMNESA")
  const waitingId = getStatusId("WAITING")
  const waitingDoctorId = getStatusId("WAITING_DOCTOR")
  const doneId = getStatusId("DONE")
  const noShowId = getStatusId("NO_SHOW")
  const cancelledId = getStatusId("CANCELLED")

  const inConsultation = reservations.find((r) => r.status_id === withDoctorId)
  const inAnamnesa = reservations.find((r) => r.status_id === anamnesaId)
  const waiting = reservations
    .filter((r) => r.status_id === waitingId || r.status_id === waitingDoctorId)
    .slice(0, 4) // Show max 4 waiting

  const activeCount = reservations.filter(
    (r) => ![doneId, noShowId, cancelledId].includes(r.status_id)
  ).length

  // Helper to format queue number
  const formatQueueNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return "--"
    return String(num).padStart(3, "0")
  }

  return (
    <div className="h-full flex flex-col rounded-2xl bg-slate-800 overflow-hidden border-2 border-slate-700">
      {/* Poly Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-700 border-b-2 border-slate-600">
        <h2 className="text-2xl font-bold text-white">{poly.name}</h2>
        <span className="text-sm bg-emerald-500 px-3 py-1 rounded-full">
          {activeCount} antrean
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* CURRENT - Dengan Dokter (LARGEST) */}
        <div className="flex-1 rounded-xl bg-emerald-600 p-4 flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-200 uppercase tracking-wider mb-1">
              Sedang Diperiksa
            </p>
            {inConsultation ? (
              <p className="text-2xl font-bold text-white line-clamp-1">
                {inConsultation.patient?.patient_name || "-"}
              </p>
            ) : (
              <p className="text-xl text-emerald-200">-</p>
            )}
          </div>
          {/* NOMOR BESAR DI KANAN */}
          <div className="text-right">
            <p className="text-[120px] leading-none font-black text-white drop-shadow-lg">
              {formatQueueNumber(inConsultation?.queue?.queue_number)}
            </p>
          </div>
        </div>

        {/* ANAMNESA */}
        <div className="rounded-xl bg-blue-600 p-4 flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-200 uppercase tracking-wider mb-1">
              Ruang Anamnesa
            </p>
            {inAnamnesa ? (
              <p className="text-lg font-bold text-white line-clamp-1">
                {inAnamnesa.patient?.patient_name || "-"}
              </p>
            ) : (
              <p className="text-lg text-blue-200">-</p>
            )}
          </div>
          {/* NOMOR BESAR DI KANAN */}
          <div className="text-right">
            <p className="text-7xl font-black text-white">
              {formatQueueNumber(inAnamnesa?.queue?.queue_number)}
            </p>
          </div>
        </div>

        {/* WAITING LIST */}
        <div className="rounded-xl bg-slate-700 p-4">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Antrean Berikutnya
          </p>
          {waiting.length === 0 ? (
            <p className="text-lg text-slate-500">Tidak ada antrean</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {waiting.map((r, i) => (
                <div 
                  key={r.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    i === 0 ? "bg-yellow-500/20 border border-yellow-500" : "bg-slate-600"
                  )}
                >
                  <span className="text-lg text-slate-300 truncate max-w-[120px]">
                    {r.patient?.patient_name?.split(" ")[0] || "-"}
                  </span>
                  {/* Nomor di KANAN */}
                  <span className={cn(
                    "text-3xl font-black",
                    i === 0 ? "text-yellow-400" : "text-slate-300"
                  )}>
                    {formatQueueNumber(r.queue?.queue_number)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
