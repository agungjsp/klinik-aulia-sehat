import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useQueueList, useVoiceAnnouncement } from "@/hooks"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, ClipboardList, Clock, Activity, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const queues = queueData?.data || []
  const inAnamnesa = queues.find((q) => q.status === "IN_ANAMNESA")
  const inConsultation = queues.find((q) => q.status === "IN_CONSULTATION")
  const waiting = queues
    .filter((q) => ["CHECKED_IN", "WAITING_DOCTOR"].includes(q.status))
    .slice(0, 7)

  const { announce } = useVoiceAnnouncement()
  const previousQueueRef = useRef<number | null>(null)

  useEffect(() => {
    if (inConsultation && inConsultation.id !== previousQueueRef.current) {
      previousQueueRef.current = inConsultation.id
      announce(inConsultation.queue_number, "Dokter")
    }
  }, [inConsultation, announce])

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-teal-100">
      
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

      <main className="flex-1 p-8 grid grid-cols-12 gap-8 relative z-0">
        
        <div className="col-span-8 flex flex-col gap-8">
            
            <div className="flex-1 relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl ring-1 ring-slate-900/5 transition-all">
                <div className="absolute top-0 left-0 h-full w-4 bg-teal-500"></div>
                <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-teal-50 opacity-50 blur-3xl pointer-events-none"></div>
                
                <div className="h-full flex flex-row items-center p-10 gap-10">
                    <div className="flex-1 flex flex-col justify-center border-r border-slate-100 pr-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                                <Stethoscope className="h-5 w-5" />
                            </span>
                            <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Ruang Dokter</h2>
                        </div>
                        <div className="mt-4">
                            <div className="text-9xl font-black text-slate-900 tracking-tighter leading-none">
                                {inConsultation?.queue_number || "--"}
                            </div>
                        </div>
                         <div className="mt-6 flex items-center gap-3">
                             <Badge variant="outline" className="px-3 py-1 text-sm border-teal-200 text-teal-700 bg-teal-50">
                                 Sedang Diperiksa
                             </Badge>
                         </div>
                    </div>
                    
                    <div className="flex-[1.5] flex flex-col justify-center pl-4">
                        <p className="text-xl text-slate-400 font-medium mb-2">Nama Pasien</p>
                        <p className="text-5xl font-bold text-slate-800 line-clamp-2 leading-tight">
                            {inConsultation?.patient.name || "Menunggu Pasien..."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-64 relative overflow-hidden rounded-[2.5rem] bg-white shadow-lg ring-1 ring-slate-900/5">
                <div className="absolute top-0 left-0 h-full w-4 bg-blue-500"></div>
                 <div className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-blue-50 opacity-50 blur-3xl pointer-events-none"></div>

                <div className="h-full flex flex-row items-center p-8 gap-8">
                     <div className="flex items-center gap-6 border-r border-slate-100 pr-8 min-w-[300px]">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                    <ClipboardList className="h-4 w-4" />
                                </span>
                                <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Ruang Anamnesa</h2>
                            </div>
                            <div className="text-7xl font-black text-slate-900 tracking-tighter">
                                {inAnamnesa?.queue_number || "--"}
                            </div>
                        </div>
                     </div>

                    <div className="flex-1">
                        <p className="text-lg text-slate-400 font-medium mb-1">Nama Pasien</p>
                         <p className="text-4xl font-bold text-slate-800 line-clamp-1">
                            {inAnamnesa?.patient.name || "Menunggu..."}
                        </p>
                    </div>
                </div>
            </div>

        </div>

        <div className="col-span-4 flex flex-col h-full rounded-[2.5rem] bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Antrean Berikutnya
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-600">
                            {waiting.length}
                        </span>
                    </h2>
                </div>
            </div>
            
            <div className="flex-1 p-4 space-y-3 overflow-hidden">
                {waiting.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                            <ClipboardList className="h-10 w-10 text-slate-300" />
                        </div>
                        <p className="text-lg">Tidak ada antrean</p>
                    </div>
                ) : (
                    waiting.map((q, i) => (
                        <Card key={q.id} className={cn(
                            "border-0 shadow-none bg-slate-50 transition-all duration-500", 
                            i === 0 ? "bg-teal-50 border border-teal-100 ring-1 ring-teal-200/50" : "hover:bg-slate-100"
                        )}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "text-2xl font-black tabular-nums w-12",
                                        i === 0 ? "text-teal-700" : "text-slate-400"
                                    )}>
                                        {q.queue_number}
                                    </span>
                                    <div className="h-8 w-px bg-slate-200"></div>
                                    <span className={cn(
                                        "font-semibold text-lg truncate max-w-[180px]",
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
      </main>

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
