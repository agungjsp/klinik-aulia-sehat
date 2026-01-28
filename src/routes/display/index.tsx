import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useReservationList, useStatusList } from "@/hooks"
import { Clock, Activity, Users, Calendar, ShieldPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Poly, Reservation, QueueStatusName } from "@/types"

const EMPTY_RESERVATIONS: Reservation[] = []

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
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  const reservations = reservationData?.data?.data ?? EMPTY_RESERVATIONS
  const statuses = statusData?.data || []

  const getStatusId = (statusName: QueueStatusName) => {
    return statuses.find((s) => s.status_name === statusName)?.id
  }

  const polis = useMemo(() => {
    const polyMap = new Map<number, Poly>()
    for (const reservation of reservations) {
      if (reservation.poly && !polyMap.has(reservation.poly.id)) {
        polyMap.set(reservation.poly.id, reservation.poly)
      }
    }
    return Array.from(polyMap.values())
  }, [reservations])

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
    <div className="flex h-screen w-screen flex-col bg-slate-950 overflow-hidden font-sans text-white selection:bg-emerald-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 flex h-24 items-center justify-between px-8 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-inner border border-white/20">
              <ShieldPlus className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 drop-shadow-sm">
              KLINIK AULIA SEHAT
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm text-emerald-400 font-bold tracking-widest uppercase">
                Sistem Antrean Digital
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-lg font-medium text-slate-400 uppercase tracking-wider">
              {format(currentTime, "EEEE", { locale: localeId })}
            </p>
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <p className="text-2xl font-bold tracking-tight">
                {format(currentTime, "d MMMM yyyy", { locale: localeId })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            <Clock className="h-8 w-8 text-emerald-400 animate-pulse" />
            <span className="text-5xl font-black tabular-nums tracking-tight text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              {format(currentTime, "HH:mm")}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-8 overflow-hidden">
        {polis.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center bg-slate-900/50 p-12 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="inline-flex p-6 rounded-full bg-slate-800/50 mb-8 ring-1 ring-white/10">
                <Users className="h-24 w-24 text-slate-600" />
              </div>
              <p className="text-5xl font-bold text-slate-500 tracking-tight">Belum Ada Antrean</p>
              <p className="text-slate-600 mt-4 text-xl">Silakan menunggu pendaftaran dibuka</p>
            </div>
          </div>
        ) : (
          <div className={cn(
            "h-full grid gap-8",
            polis.length === 1 ? "grid-cols-1 max-w-5xl mx-auto" : "grid-cols-2"
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

      <footer className="relative z-10 h-20 bg-slate-900/80 border-t border-emerald-500/30 flex items-center overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500" />
        <div className="flex w-full whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-32 text-2xl font-semibold px-4 text-slate-200">
            <span className="flex items-center gap-4"><Activity className="text-emerald-500 h-6 w-6" /> Selamat Datang di Klinik Aulia Sehat</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span>Buka Senin - Sabtu, 08.00 - 21.00 WIB</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span className="flex items-center gap-4"><Activity className="text-emerald-500 h-6 w-6" /> Selamat Datang di Klinik Aulia Sehat</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span>Buka Senin - Sabtu, 08.00 - 21.00 WIB</span>
          </div>
          <div className="animate-marquee flex items-center gap-32 text-2xl font-semibold px-4 text-slate-200" aria-hidden="true">
            <span className="flex items-center gap-4"><Activity className="text-emerald-500 h-6 w-6" /> Selamat Datang di Klinik Aulia Sehat</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span>Buka Senin - Sabtu, 08.00 - 21.00 WIB</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span className="flex items-center gap-4"><Activity className="text-emerald-500 h-6 w-6" /> Selamat Datang di Klinik Aulia Sehat</span>
            <span className="text-slate-600 text-3xl">•</span>
            <span>Mohon menunggu nomor antrean Anda dipanggil</span>
            <span className="text-slate-600 text-3xl">•</span>
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
          animation: marquee 80s linear infinite;
        }
      `}</style>
    </div>
  )
}

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
    .slice(0, 4)

  const activeCount = reservations.filter(
    (r) => ![doneId, noShowId, cancelledId].includes(r.status_id)
  ).length

  const formatQueueNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return "--"
    return String(num).padStart(3, "0")
  }

  return (
    <div className="h-full flex flex-col rounded-3xl bg-slate-800/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
      <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-3 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <h2 className="text-3xl font-black text-white tracking-tight">{poly.name}</h2>
        </div>
        <span className="flex items-center gap-2 text-sm font-bold bg-slate-900/60 px-4 py-1.5 rounded-full border border-white/10 text-emerald-400">
          <Users className="h-4 w-4" />
          {activeCount} antrean
        </span>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="relative flex-1 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-slate-900/50 p-6 flex items-center border border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)] group overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />
          
          <div className="relative flex-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/20 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-sm font-bold text-emerald-300 uppercase tracking-widest">
                Sedang Diperiksa
              </p>
            </div>
            {inConsultation ? (
              <p className="text-4xl font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                {inConsultation.patient?.patient_name || "-"}
              </p>
            ) : (
              <p className="text-3xl font-medium text-slate-500 italic">Menunggu Pasien...</p>
            )}
          </div>
          
          <div className="relative z-10 text-right pl-6 border-l border-emerald-500/20">
            <p className="text-[140px] leading-[0.85] font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tabular-nums tracking-tighter">
              {formatQueueNumber(inConsultation?.queue?.queue_number)}
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-br from-sky-500/10 to-slate-900/50 p-5 flex items-center border border-sky-500/20 shadow-lg">
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 blur-[60px] rounded-full -ml-12 -mb-12 pointer-events-none" />

          <div className="relative flex-1 z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <p className="text-xs font-bold text-sky-300 uppercase tracking-widest">
                Persiapan / Anamnesa
              </p>
            </div>
            {inAnamnesa ? (
              <p className="text-2xl font-bold text-white line-clamp-1">
                {inAnamnesa.patient?.patient_name || "-"}
              </p>
            ) : (
              <p className="text-xl text-slate-500 italic">Kosong</p>
            )}
          </div>
          
          <div className="text-right pl-6 border-l border-sky-500/20">
            <p className="text-8xl font-black text-white/90 tabular-nums tracking-tighter drop-shadow-sm">
              {formatQueueNumber(inAnamnesa?.queue?.queue_number)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/40 border border-white/5 p-5 backdrop-blur-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Antrean Berikutnya
          </p>
          {waiting.length === 0 ? (
            <div className="py-4 text-center border border-dashed border-slate-700 rounded-xl">
              <p className="text-lg text-slate-600 font-medium">Tidak ada antrean menunggu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {waiting.map((r, i) => (
                <div 
                  key={r.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                    i === 0 
                      ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]" 
                      : "bg-slate-800/50 border-white/5 hover:bg-slate-800"
                  )}
                >
                  <span className={cn(
                    "text-lg font-medium truncate max-w-[120px]",
                    i === 0 ? "text-amber-200" : "text-slate-400"
                  )}>
                    {r.patient?.patient_name?.split(" ")[0] || "-"}
                  </span>
                  <span className={cn(
                    "text-4xl font-black tabular-nums tracking-tight",
                    i === 0 ? "text-amber-400" : "text-slate-500"
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
