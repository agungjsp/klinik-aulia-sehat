import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useMemo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useQueueList } from "@/hooks"
import { Clock, Activity, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUniquePolis, groupQueuesByPoly } from "@/lib/queue-display"
import type { Queue, Poly } from "@/types"

export const Route = createFileRoute("/display/")({
  component: DisplayPage,
})

function DisplayPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, refetch } = useQueueList({ date: today })
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

  // ============================================
  // MOCK DATA FOR PREVIEW - Remove when BE ready
  // ============================================
  const USE_MOCK_DATA = true // Set to false when backend is ready
  
  const mockQueues: Queue[] = [
    // Poli Umum
    { id: 1, queue_number: "3", status: "WITH_DOCTOR", patient: { id: 1, name: "Siti Nurhaliza", nik: "1234567890123456", phone: "081234567890", birth_date: "1990-01-01", created_at: "", updated_at: "" }, patient_id: 1, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi Wijaya", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:30", anamnesa_time: "07:45", consultation_time: "08:00", done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 2, queue_number: "4", status: "ANAMNESA", patient: { id: 2, name: "Budi Santoso", nik: "1234567890123457", phone: "081234567891", birth_date: "1985-05-15", created_at: "", updated_at: "" }, patient_id: 2, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi Wijaya", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:35", anamnesa_time: "08:05", consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 3, queue_number: "5", status: "WAITING", patient: { id: 3, name: "Agus Hermanto", nik: "1234567890123458", phone: "081234567892", birth_date: "1978-10-20", created_at: "", updated_at: "" }, patient_id: 3, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi Wijaya", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:40", anamnesa_time: null, consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 4, queue_number: "6", status: "WAITING_DOCTOR", patient: { id: 4, name: "Dewi Lestari", nik: "1234567890123459", phone: "081234567893", birth_date: "1992-03-25", created_at: "", updated_at: "" }, patient_id: 4, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi Wijaya", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:42", anamnesa_time: "07:55", consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 8, queue_number: "7", status: "WAITING", patient: { id: 8, name: "Kartini Rahayu", nik: "1234567890123463", phone: "081234567897", birth_date: "1955-04-21", created_at: "", updated_at: "" }, patient_id: 8, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi Wijaya", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:50", anamnesa_time: null, consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    // Poli Gigi
    { id: 5, queue_number: "2", status: "WITH_DOCTOR", patient: { id: 5, name: "Hendra Wijaya", nik: "1234567890123460", phone: "081234567894", birth_date: "1988-07-12", created_at: "", updated_at: "" }, patient_id: 5, poly: { id: 2, name: "Poli Gigi", created_at: "", updated_at: "", deleted_at: null }, poly_id: 2, doctor: { id: 2, name: "drg. Gigi Susanto", username: "", email: "", poly_id: 2, poly: null, roles: [] }, doctor_id: 2, schedule_id: 2, schedule: { id: 2, doctor_id: 2, date: today, start_time: "08:00", end_time: "14:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:15", anamnesa_time: "07:30", consultation_time: "07:50", done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 6, queue_number: "3", status: "ANAMNESA", patient: { id: 6, name: "Rendra Kusuma", nik: "1234567890123461", phone: "081234567895", birth_date: "1995-11-08", created_at: "", updated_at: "" }, patient_id: 6, poly: { id: 2, name: "Poli Gigi", created_at: "", updated_at: "", deleted_at: null }, poly_id: 2, doctor: { id: 2, name: "drg. Gigi Susanto", username: "", email: "", poly_id: 2, poly: null, roles: [] }, doctor_id: 2, schedule_id: 2, schedule: { id: 2, doctor_id: 2, date: today, start_time: "08:00", end_time: "14:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:18", anamnesa_time: "08:10", consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 7, queue_number: "4", status: "WAITING", patient: { id: 7, name: "Maya Sari", nik: "1234567890123462", phone: "081234567896", birth_date: "2000-02-14", created_at: "", updated_at: "" }, patient_id: 7, poly: { id: 2, name: "Poli Gigi", created_at: "", updated_at: "", deleted_at: null }, poly_id: 2, doctor: { id: 2, name: "drg. Gigi Susanto", username: "", email: "", poly_id: 2, poly: null, roles: [] }, doctor_id: 2, schedule_id: 2, schedule: { id: 2, doctor_id: 2, date: today, start_time: "08:00", end_time: "14:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:25", anamnesa_time: null, consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
  ]

  const realQueues = queueData?.data || []
  const queues = USE_MOCK_DATA ? mockQueues : realQueues
  // ============================================
  
  // Get unique polis and group queues
  const polis = useMemo(() => getUniquePolis(queues), [queues])
  const queuesByPoly = useMemo(() => groupQueuesByPoly(queues), [queues])

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
                queues={queuesByPoly.get(poly.id) || []}
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
  queues: Queue[]
}

function PolySectionSeniorFriendly({ poly, queues }: PolySectionProps) {
  const inConsultation = queues.find(q => q.status === "WITH_DOCTOR")
  const inAnamnesa = queues.find(q => q.status === "ANAMNESA")
  const waiting = queues
    .filter(q => ["WAITING", "WAITING_DOCTOR"].includes(q.status))
    .slice(0, 4) // Show max 4 waiting

  return (
    <div className="h-full flex flex-col rounded-2xl bg-slate-800 overflow-hidden border-2 border-slate-700">
      {/* Poly Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-700 border-b-2 border-slate-600">
        <h2 className="text-2xl font-bold text-white">{poly.name}</h2>
        <span className="text-sm bg-emerald-500 px-3 py-1 rounded-full">
          {queues.filter(q => !["DONE", "NO_SHOW", "CANCELLED"].includes(q.status)).length} antrean
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
                {inConsultation.patient.name}
              </p>
            ) : (
              <p className="text-xl text-emerald-200">-</p>
            )}
          </div>
          {/* NOMOR BESAR DI KANAN */}
          <div className="text-right">
            <p className="text-[120px] leading-none font-black text-white drop-shadow-lg">
              {inConsultation?.queue_number || "--"}
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
                {inAnamnesa.patient.name}
              </p>
            ) : (
              <p className="text-lg text-blue-200">-</p>
            )}
          </div>
          {/* NOMOR BESAR DI KANAN */}
          <div className="text-right">
            <p className="text-7xl font-black text-white">
              {inAnamnesa?.queue_number || "--"}
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
              {waiting.map((q, i) => (
                <div 
                  key={q.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    i === 0 ? "bg-yellow-500/20 border border-yellow-500" : "bg-slate-600"
                  )}
                >
                  <span className="text-lg text-slate-300 truncate max-w-[120px]">
                    {q.patient.name.split(" ")[0]}
                  </span>
                  {/* Nomor di KANAN */}
                  <span className={cn(
                    "text-3xl font-black",
                    i === 0 ? "text-yellow-400" : "text-slate-300"
                  )}>
                    {q.queue_number}
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
