import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, Play, UserCheck } from "lucide-react"
import { useQueueList, useQueueUpdateStatus } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { Queue, QueueStatus } from "@/types"

export const Route = createFileRoute("/perawat/antrean")({
  component: PerawatAntreanPage,
})

function PerawatAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, isLoading, refetch } = useQueueList({ date: today })
  const updateStatusMutation = useQueueUpdateStatus()

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ queue: Queue; status: QueueStatus; title: string; description: string } | null>(null)

  const queues = queueData?.data || []
  
  // Filter only relevant queues for perawat
  const waitingAnamnesa = queues.filter(q => q.status === "WAITING")
  const inAnamnesa = queues.filter(q => q.status === "ANAMNESA")

  const handleUpdateStatus = (queue: Queue, newStatus: QueueStatus) => {
    let title = "Konfirmasi"
    let description = "Apakah Anda yakin?"

    if (newStatus === "ANAMNESA") {
      title = "Panggil Pasien"
      description = `Panggil pasien ${queue.patient.name} ke ruang anamnesa?`
    } else if (newStatus === "WAITING_DOCTOR") {
      title = "Selesai Anamnesa"
      description = `Selesaikan anamnesa untuk pasien ${queue.patient.name} dan arahkan ke dokter?`
    }

    setPendingAction({ queue, status: newStatus, title, description })
    setConfirmOpen(true)
  }

  const confirmUpdateStatus = async () => {
    if (!pendingAction) return

    try {
      await updateStatusMutation.mutateAsync({ id: pendingAction.queue.id, data: { status: pendingAction.status } })
      toast.success(pendingAction.status === "ANAMNESA" ? "Pasien dipanggil untuk anamnesa" : "Anamnesa selesai")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status")
    } finally {
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  // Helper to format queue number (remove letters)
  const formatQueueNumber = (num: string) => num.replace(/\D/g, '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Antrean Anamnesa</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sedang Anamnesa */}
        <div className="rounded-lg border">
          <div className="border-b bg-orange-50 p-4">
            <h2 className="font-semibold text-orange-700">Sedang Anamnesa</h2>
            <p className="text-sm text-orange-600">{inAnamnesa.length} pasien</p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : inAnamnesa.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien</p>
            ) : (
              inAnamnesa.map((queue) => (
                <div key={queue.id} className="rounded-lg border bg-orange-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-2xl font-bold text-orange-700">{formatQueueNumber(queue.queue_number)}</p>
                      <p className="font-medium">{queue.patient.name}</p>
                      <p className="text-sm text-muted-foreground">{queue.poly.name} - {queue.doctor.name}</p>
                    </div>
                    <Button size="sm" onClick={() => handleUpdateStatus(queue, "WAITING_DOCTOR")} disabled={updateStatusMutation.isPending}>
                      <UserCheck className="mr-1 h-4 w-4" />Selesai
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menunggu Anamnesa */}
        <div className="rounded-lg border">
          <div className="border-b bg-blue-50 p-4">
            <h2 className="font-semibold text-blue-700">Menunggu Anamnesa</h2>
            <p className="text-sm text-blue-600">{waitingAnamnesa.length} pasien</p>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : waitingAnamnesa.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Tidak ada pasien menunggu</p>
            ) : (
              waitingAnamnesa.map((queue, idx) => (
                <div key={queue.id} className={`rounded-lg border p-3 flex items-center justify-between ${idx === 0 ? "bg-blue-50 border-blue-200" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold">{formatQueueNumber(queue.queue_number)}</span>
                    <div>
                      <p className="font-medium">{queue.patient.name}</p>
                      <p className="text-xs text-muted-foreground">Check-in: {queue.check_in_time?.slice(0, 5)}</p>
                    </div>
                  </div>
                  {idx === 0 && (
                    <Button size="sm" onClick={() => handleUpdateStatus(queue, "ANAMNESA")} disabled={updateStatusMutation.isPending}>
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingAction?.title || ""}
        description={pendingAction?.description || ""}
        onConfirm={confirmUpdateStatus}
      />
    </div>
  )
}
