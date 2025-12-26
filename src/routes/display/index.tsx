import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { useQueueList } from "@/hooks"

export const Route = createFileRoute("/display/")({
  component: DisplayPage,
})

function DisplayPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, refetch } = useQueueList({ date: today })

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000)
    return () => clearInterval(interval)
  }, [refetch])

  const queues = queueData?.data || []
  const inAnamnesa = queues.find(q => q.status === "IN_ANAMNESA")
  const inConsultation = queues.find(q => q.status === "IN_CONSULTATION")
  const waiting = queues.filter(q => ["CHECKED_IN", "WAITING_DOCTOR"].includes(q.status)).slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 text-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Klinik Aulia Sehat</h1>
        <p className="text-xl text-blue-200">{format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Now Serving */}
        <div className="col-span-2 grid grid-cols-2 gap-6">
          <div className="rounded-2xl bg-orange-500 p-6">
            <p className="text-lg opacity-80">Ruang Anamnesa</p>
            <p className="text-8xl font-bold text-center py-8">{inAnamnesa?.queue_number || "-"}</p>
            {inAnamnesa && <p className="text-center text-xl">{inAnamnesa.patient.name}</p>}
          </div>
          <div className="rounded-2xl bg-green-500 p-6">
            <p className="text-lg opacity-80">Ruang Dokter</p>
            <p className="text-8xl font-bold text-center py-8">{inConsultation?.queue_number || "-"}</p>
            {inConsultation && <p className="text-center text-xl">{inConsultation.patient.name}</p>}
          </div>
        </div>

        {/* Waiting List */}
        <div className="rounded-2xl bg-white/10 p-6">
          <p className="text-lg mb-4">Antrean Berikutnya</p>
          <div className="space-y-2">
            {waiting.length === 0 ? (
              <p className="text-center text-blue-200 py-4">Tidak ada antrean</p>
            ) : (
              waiting.map((q) => (
                <div key={q.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
                  <span className="font-mono text-2xl font-bold">{q.queue_number}</span>
                  <span className="text-blue-200 truncate ml-2">{q.patient.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
