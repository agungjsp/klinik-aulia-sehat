import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, Play, CheckCircle } from "lucide-react"
import { useQueueList, useQueueUpdateStatus } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Queue, QueueStatus } from "@/types"

export const Route = createFileRoute("/dokter/antrean")({
  component: DokterAntreanPage,
})

function DokterAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, isLoading, refetch } = useQueueList({ date: today })
  const updateStatusMutation = useQueueUpdateStatus()

  const queues = queueData?.data || []
  
  // Filter only relevant queues for dokter
  const waitingDoctor = queues.filter(q => q.status === "WAITING_DOCTOR")
  const inConsultation = queues.filter(q => q.status === "IN_CONSULTATION")

  const handleUpdateStatus = async (queue: Queue, newStatus: QueueStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: queue.id, data: { status: newStatus } })
      toast.success(newStatus === "IN_CONSULTATION" ? "Pasien dipanggil untuk konsultasi" : "Konsultasi selesai")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Antrean Pasien</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
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
              inConsultation.map((queue) => (
                <div key={queue.id} className="rounded-lg border bg-yellow-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-2xl font-bold text-yellow-700">{queue.queue_number}</p>
                      <p className="font-medium">{queue.patient.name}</p>
                      <p className="text-sm text-muted-foreground">{queue.poly.name}</p>
                      {queue.notes && <p className="text-sm mt-2 text-muted-foreground">Catatan: {queue.notes}</p>}
                    </div>
                    <Button size="sm" onClick={() => handleUpdateStatus(queue, "DONE")} disabled={updateStatusMutation.isPending}>
                      <CheckCircle className="mr-1 h-4 w-4" />Selesai
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
              waitingDoctor.map((queue, idx) => (
                <div key={queue.id} className={`rounded-lg border p-3 flex items-center justify-between ${idx === 0 ? "bg-purple-50 border-purple-200" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold">{queue.queue_number}</span>
                    <div>
                      <p className="font-medium">{queue.patient.name}</p>
                      <p className="text-xs text-muted-foreground">Selesai anamnesa: {queue.anamnesa_time?.slice(0, 5) || "-"}</p>
                    </div>
                  </div>
                  {idx === 0 && (
                    <Button size="sm" onClick={() => handleUpdateStatus(queue, "IN_CONSULTATION")} disabled={updateStatusMutation.isPending}>
                      <Play className="mr-1 h-4 w-4" />Panggil
                    </Button>
                  )}
                  {idx > 0 && <Badge variant="outline">Antrean ke-{idx + 1}</Badge>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
