import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, XCircle } from "lucide-react"
import { useQueueList, useQueueUpdateStatus } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Queue, QueueStatus } from "@/types"

export const Route = createFileRoute("/resepsionis/antrean")({
  component: ResepsionisAntreanPage,
})

function ResepsionisAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, isLoading, refetch } = useQueueList({ date: today })
  const updateStatusMutation = useQueueUpdateStatus()

  const queues = queueData?.data || []
  const summary = {
    total: queues.length,
    checkedIn: queues.filter(q => q.status === "CHECKED_IN").length,
    inProgress: queues.filter(q => ["IN_ANAMNESA", "WAITING_DOCTOR", "IN_CONSULTATION"].includes(q.status)).length,
    done: queues.filter(q => q.status === "DONE").length,
  }

  const handleUpdateStatus = async (queue: Queue, newStatus: QueueStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: queue.id, data: { status: newStatus } })
      toast.success(newStatus === "NO_SHOW" ? "Pasien ditandai tidak hadir" : "Status diperbarui")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status")
    }
  }

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    CHECKED_IN: { label: "Check-in", variant: "default" },
    IN_ANAMNESA: { label: "Anamnesa", variant: "secondary" },
    WAITING_DOCTOR: { label: "Tunggu Dokter", variant: "secondary" },
    IN_CONSULTATION: { label: "Konsultasi", variant: "secondary" },
    DONE: { label: "Selesai", variant: "outline" },
    NO_SHOW: { label: "Tidak Hadir", variant: "destructive" },
    CANCELLED: { label: "Batal", variant: "destructive" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Antrean Hari Ini</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{summary.total}</p></div>
        <div className="rounded-lg border p-4 bg-blue-50"><p className="text-sm text-blue-600">Check-in</p><p className="text-2xl font-bold text-blue-700">{summary.checkedIn}</p></div>
        <div className="rounded-lg border p-4 bg-yellow-50"><p className="text-sm text-yellow-600">Proses</p><p className="text-2xl font-bold text-yellow-700">{summary.inProgress}</p></div>
        <div className="rounded-lg border p-4 bg-green-50"><p className="text-sm text-green-600">Selesai</p><p className="text-2xl font-bold text-green-700">{summary.done}</p></div>
      </div>

      {/* Queue List */}
      <div className="rounded-lg border">
        <div className="border-b p-4"><h2 className="font-semibold">Daftar Antrean</h2></div>
        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12 w-full" /></div>)
          ) : queues.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada antrean hari ini</p>
          ) : (
            queues.map((queue) => (
              <div key={queue.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg font-bold w-16">{queue.queue_number}</span>
                  <div>
                    <p className="font-medium">{queue.patient.name}</p>
                    <p className="text-sm text-muted-foreground">{queue.poly.name} - {queue.doctor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig[queue.status]?.variant || "outline"}>{statusConfig[queue.status]?.label || queue.status}</Badge>
                  {queue.status === "CHECKED_IN" && (
                    <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(queue, "NO_SHOW")} disabled={updateStatusMutation.isPending}>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
