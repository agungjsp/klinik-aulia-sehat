import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, Play, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { useQueueList, useQueueUpdateStatus } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Queue, QueueStatus } from "@/types"

export const Route = createFileRoute("/perawat-asisten/antrean")({
  component: PerawatAsistenAntreanPage,
})

function PerawatAsistenAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, isLoading, refetch } = useQueueList({ date: today })
  const updateStatusMutation = useQueueUpdateStatus()
  
  // Track call count per queue
  const [callCounts, setCallCounts] = useState<Record<number, number>>({})

  const queues = queueData?.data || []
  
  // Filter only relevant queues for perawat asisten
  const waitingDoctor = queues.filter(q => q.status === "WAITING_DOCTOR")
  const withDoctor = queues.filter(q => q.status === "WITH_DOCTOR")

  const handleCallPatient = async (queue: Queue) => {
    const currentCount = callCounts[queue.id] || 0
    const newCount = currentCount + 1
    
    if (newCount >= 3) {
      // 3x called, mark as no-show
      try {
        await updateStatusMutation.mutateAsync({ id: queue.id, data: { status: "NO_SHOW" as QueueStatus } })
        toast.warning("Pasien tidak hadir setelah 3x panggilan")
        setCallCounts(prev => ({ ...prev, [queue.id]: 0 }))
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Gagal mengubah status")
      }
    } else {
      // Update call count and trigger call
      setCallCounts(prev => ({ ...prev, [queue.id]: newCount }))
      
      if (newCount === 1) {
        // First call, update status to WITH_DOCTOR
        try {
          await updateStatusMutation.mutateAsync({ id: queue.id, data: { status: "WITH_DOCTOR" as QueueStatus } })
          toast.success(`Memanggil pasien ${queue.patient.name}`)
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Gagal mengubah status")
        }
      } else {
        toast.info(`Panggilan ke-${newCount} untuk ${queue.patient.name}`)
      }
    }
  }

  const handleMarkNoShow = async (queue: Queue) => {
    try {
      await updateStatusMutation.mutateAsync({ id: queue.id, data: { status: "NO_SHOW" as QueueStatus } })
      toast.warning("Pasien ditandai tidak hadir")
      setCallCounts(prev => ({ ...prev, [queue.id]: 0 }))
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status")
    }
  }

  const getCallCount = (queueId: number) => callCounts[queueId] || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panggil Pasien ke Dokter</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
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
              withDoctor.map((queue) => (
                <div key={queue.id} className="rounded-lg border bg-green-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-2xl font-bold text-green-700">{queue.queue_number}</p>
                      <p className="font-medium">{queue.patient.name}</p>
                      <p className="text-sm text-muted-foreground">{queue.poly.name} - {queue.doctor.name}</p>
                    </div>
                    <Badge variant="default" className="bg-green-600">Dengan Dokter</Badge>
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
              waitingDoctor.map((queue, idx) => {
                const callCount = getCallCount(queue.id)
                const isDisabled = callCount >= 3
                
                return (
                  <div key={queue.id} className={`rounded-lg border p-3 ${idx === 0 ? "bg-purple-50 border-purple-200" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold">{queue.queue_number}</span>
                        <div>
                          <p className="font-medium">{queue.patient.name}</p>
                          <p className="text-xs text-muted-foreground">{queue.poly.name} - {queue.doctor.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {callCount > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            Panggilan: {callCount}/3
                          </Badge>
                        )}
                        {idx === 0 && !isDisabled && (
                          <Button 
                            size="sm" 
                            onClick={() => handleCallPatient(queue)} 
                            disabled={updateStatusMutation.isPending}
                          >
                            <Play className="mr-1 h-4 w-4" />
                            Panggil
                          </Button>
                        )}
                        {idx === 0 && callCount >= 2 && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleMarkNoShow(queue)} 
                            disabled={updateStatusMutation.isPending}
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
