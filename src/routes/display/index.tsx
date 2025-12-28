import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useRef, useMemo } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useQueueList, useVoiceAnnouncement } from "@/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, ClipboardList, Clock, Activity, CalendarDays } from "lucide-react"
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
    { id: 1, queue_number: "3", status: "IN_CONSULTATION", patient: { id: 1, name: "Siti Nurhaliza", nik: "1234567890123456", phone: "081234567890", birth_date: "1990-01-01", created_at: "", updated_at: "" }, patient_id: 1, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:30", anamnesa_time: "07:45", consultation_time: "08:00", done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 2, queue_number: "4", status: "IN_ANAMNESA", patient: { id: 2, name: "Budi Santoso", nik: "1234567890123457", phone: "081234567891", birth_date: "1985-05-15", created_at: "", updated_at: "" }, patient_id: 2, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:35", anamnesa_time: "08:05", consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 3, queue_number: "5", status: "CHECKED_IN", patient: { id: 3, name: "Agus Hermanto", nik: "1234567890123458", phone: "081234567892", birth_date: "1978-10-20", created_at: "", updated_at: "" }, patient_id: 3, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:40", anamnesa_time: null, consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 4, queue_number: "6", status: "WAITING_DOCTOR", patient: { id: 4, name: "Dewi Lestari", nik: "1234567890123459", phone: "081234567893", birth_date: "1992-03-25", created_at: "", updated_at: "" }, patient_id: 4, poly: { id: 1, name: "Poli Umum", created_at: "", updated_at: "", deleted_at: null }, poly_id: 1, doctor: { id: 1, name: "Dr. Andi", username: "", email: "", poly_id: 1, poly: null, roles: [] }, doctor_id: 1, schedule_id: 1, schedule: { id: 1, doctor_id: 1, date: today, start_time: "08:00", end_time: "12:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:42", anamnesa_time: "07:55", consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    // Poli Gigi
    { id: 5, queue_number: "2", status: "IN_CONSULTATION", patient: { id: 5, name: "Hendra Wijaya", nik: "1234567890123460", phone: "081234567894", birth_date: "1988-07-12", created_at: "", updated_at: "" }, patient_id: 5, poly: { id: 2, name: "Poli Gigi", created_at: "", updated_at: "", deleted_at: null }, poly_id: 2, doctor: { id: 2, name: "Dr. Gigi Susanto", username: "", email: "", poly_id: 2, poly: null, roles: [] }, doctor_id: 2, schedule_id: 2, schedule: { id: 2, doctor_id: 2, date: today, start_time: "08:00", end_time: "14:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:15", anamnesa_time: "07:30", consultation_time: "07:50", done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 6, queue_number: "3", status: "IN_ANAMNESA", patient: { id: 6, name: "Rendra Kusuma", nik: "1234567890123461", phone: "081234567895", birth_date: "1995-11-08", created_at: "", updated_at: "" }, patient_id: 6, poly: { id: 2, name: "Poli Gigi", created_at: "", updated_at: "", deleted_at: null }, poly_id: 2, doctor: { id: 2, name: "Dr. Gigi Susanto", username: "", email: "", poly_id: 2, poly: null, roles: [] }, doctor_id: 2, schedule_id: 2, schedule: { id: 2, doctor_id: 2, date: today, start_time: "08:00", end_time: "14:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:18", anamnesa_time: "08:10", consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
    { id: 7, queue_number: "4", status: "CHECKED_IN", patient: { id: 7, name: "Maya Sari", nik: "1234567890123462", phone: "081234567896", birth_date: "2000-02-14", created_at: "", updated_at: "" }, patient_id: 7, poly: { id: 2, name: "Poli Gigi", created_at: "", updated_at: "", deleted_at: null }, poly_id: 2, doctor: { id: 2, name: "Dr. Gigi Susanto", username: "", email: "", poly_id: 2, poly: null, roles: [] }, doctor_id: 2, schedule_id: 2, schedule: { id: 2, doctor_id: 2, date: today, start_time: "08:00", end_time: "14:00", created_at: "", updated_at: "", deleted_at: null }, check_in_time: "07:25", anamnesa_time: null, consultation_time: null, done_time: null, queue_date: today, status_history: [], created_at: "", updated_at: "" },
  ]

  const realQueues = queueData?.data || []
  const queues = USE_MOCK_DATA ? mockQueues : realQueues
  // ============================================
  
  // Get unique polis and group queues
  const polis = useMemo(() => getUniquePolis(queues), [queues])
  const queuesByPoly = useMemo(() => groupQueuesByPoly(queues), [queues])

  // Voice announcement for consultation calls
  const { announce } = useVoiceAnnouncement()
  const previousQueueRef = useRef<number | null>(null)
  
  // Find any patient in consultation (for voice announcement)
  const inConsultation = queues.find((q) => q.status === "IN_CONSULTATION")

  useEffect(() => {
    if (inConsultation && inConsultation.id !== previousQueueRef.current) {
      previousQueueRef.current = inConsultation.id
      announce(inConsultation.queue_number, "Dokter")
    }
  }, [inConsultation, announce])

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-teal-100">
      
      {/* Header */}
      <header className="flex h-24 items-center justify-between border-b border-slate-200 bg-white px-10 shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-200">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Klinik Aulia Sehat
            </h1>
            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">
              Sistem Antrean Digital
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 bg-slate-100 px-6 py-2 rounded-full border border-slate-200">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                <span className="text-xl font-semibold text-slate-700">
                    {format(currentTime, "d MMMM yyyy", { locale: localeId })}
                </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-900 px-6 py-2 rounded-full text-white shadow-lg">
                <Clock className="h-5 w-5 text-teal-400" />
                <span className="text-xl font-bold tabular-nums">
                    {format(currentTime, "HH:mm:ss")}
                </span>
            </div>
        </div>
      </header>

      {/* Main Content - Dynamic based on number of Polis */}
      <main className="flex-1 p-6 overflow-hidden">
        {polis.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Activity className="h-20 w-20 mx-auto mb-4 opacity-30" />
              <p className="text-2xl font-medium">Belum ada antrean hari ini</p>
            </div>
          </div>
        ) : (
          <div className={cn(
            "h-full grid gap-6",
            polis.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {polis.map((poly) => (
              <PolySection 
                key={poly.id} 
                poly={poly} 
                queues={queuesByPoly.get(poly.id) || []}
                isFullWidth={polis.length === 1}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer Marquee */}
      <footer className="h-20 bg-slate-900 flex items-center overflow-hidden relative z-20">
        <div className="flex w-full whitespace-nowrap">
             <div className="animate-marquee flex items-center gap-16 text-white text-3xl font-medium px-4">
                <span>Selamat Datang di Klinik Aulia Sehat. Mohon menunggu nomor antrean Anda dipanggil.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Jagalah kebersihan dan kenyamanan ruang tunggu.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Buka Senin - Sabtu, Pukul 08.00 - 21.00 WIB.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Selamat Datang di Klinik Aulia Sehat. Mohon menunggu nomor antrean Anda dipanggil.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Jagalah kebersihan dan kenyamanan ruang tunggu.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Buka Senin - Sabtu, Pukul 08.00 - 21.00 WIB.</span>
             </div>
             <div className="animate-marquee flex items-center gap-16 text-white text-3xl font-medium px-4" aria-hidden="true">
                <span>Selamat Datang di Klinik Aulia Sehat. Mohon menunggu nomor antrean Anda dipanggil.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Jagalah kebersihan dan kenyamanan ruang tunggu.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Buka Senin - Sabtu, Pukul 08.00 - 21.00 WIB.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Selamat Datang di Klinik Aulia Sehat. Mohon menunggu nomor antrean Anda dipanggil.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Jagalah kebersihan dan kenyamanan ruang tunggu.</span>
                <Activity className="h-8 w-8 text-teal-500 animate-pulse" />
                <span>Buka Senin - Sabtu, Pukul 08.00 - 21.00 WIB.</span>
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

// ============================================
// Poly Section Component - Shows queue for one Poli
// ============================================
interface PolySectionProps {
  poly: Poly
  queues: Queue[]
  isFullWidth: boolean
}

function PolySection({ poly, queues, isFullWidth }: PolySectionProps) {
  const inConsultation = queues.find(q => q.status === "IN_CONSULTATION")
  const inAnamnesa = queues.find(q => q.status === "IN_ANAMNESA")
  const waiting = queues
    .filter(q => ["CHECKED_IN", "WAITING_DOCTOR"].includes(q.status))
    .slice(0, 5)

  // Color scheme based on poli name (can be customized)
  const colorScheme = poly.name.includes("Gigi") 
    ? { primary: "teal", accent: "emerald" }
    : { primary: "blue", accent: "indigo" }

  return (
    <div className="h-full flex flex-col gap-4 rounded-3xl bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden p-6">
      {/* Poly Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl text-white",
          colorScheme.primary === "teal" ? "bg-teal-600" : "bg-blue-600"
        )}>
          <Stethoscope className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{poly.name}</h2>
      </div>

      <div className={cn(
        "flex-1 grid gap-4",
        isFullWidth ? "grid-cols-3" : "grid-cols-1"
      )}>
        {/* Dokter / Consultation Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 p-6 ring-1 ring-teal-200">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-200/50 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Ruang Dokter</span>
            </div>
            <div className="text-6xl font-black text-teal-900 tracking-tighter">
              {inConsultation?.queue_number || "--"}
            </div>
            {inConsultation && (
              <p className="mt-2 text-lg font-medium text-teal-800 line-clamp-1">
                {inConsultation.patient.name}
              </p>
            )}
            <Badge className="mt-3 bg-teal-200 text-teal-800 hover:bg-teal-200">
              {inConsultation ? "Sedang Diperiksa" : "Menunggu"}
            </Badge>
          </div>
        </div>

        {/* Anamnesa Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 ring-1 ring-blue-200">
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-blue-200/50 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Ruang Anamnesa</span>
            </div>
            <div className="text-5xl font-black text-blue-900 tracking-tighter">
              {inAnamnesa?.queue_number || "--"}
            </div>
            {inAnamnesa && (
              <p className="mt-2 text-base font-medium text-blue-800 line-clamp-1">
                {inAnamnesa.patient.name}
              </p>
            )}
          </div>
        </div>

        {/* Waiting List Section */}
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Antrean Berikutnya</h3>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">
              {waiting.length}
            </span>
          </div>
          <div className="space-y-2">
            {waiting.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Tidak ada antrean</p>
            ) : (
              waiting.map((q, i) => (
                <Card key={q.id} className={cn(
                  "border-0 shadow-none transition-all",
                  i === 0 ? "bg-teal-50 ring-1 ring-teal-200" : "bg-white hover:bg-slate-100"
                )}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-lg font-black tabular-nums",
                        i === 0 ? "text-teal-700" : "text-slate-400"
                      )}>
                        {q.queue_number}
                      </span>
                      <div className="h-6 w-px bg-slate-200" />
                      <span className={cn(
                        "font-medium truncate max-w-[120px]",
                        i === 0 ? "text-slate-900" : "text-slate-600"
                      )}>
                        {q.patient.name}
                      </span>
                    </div>
                    {i === 0 && (
                      <Badge variant="secondary" className="bg-teal-200 text-teal-800 hover:bg-teal-200">
                        Next
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
