import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, XCircle, Plus } from "lucide-react"
import { useQueueList, useQueueUpdateStatus, useQueueCreate, usePolyList, useScheduleList } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"
import type { Queue, QueueStatus } from "@/types"

export const Route = createFileRoute("/resepsionis/antrean")({
  component: ResepsionisAntreanPage,
})

// Registration form schema
const registerSchema = z.object({
  patient_name: z.string().min(1, "Nama pasien wajib diisi"),
  patient_nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  patient_phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  poly_id: z.number({ message: "Pilih poli" }),
  doctor_id: z.number({ message: "Pilih dokter" }),
  schedule_id: z.number({ message: "Pilih jadwal" }),
  notes: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

function ResepsionisAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, isLoading, refetch } = useQueueList({ date: today })
  const updateStatusMutation = useQueueUpdateStatus()
  
  // Registration form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const createMutation = useQueueCreate()
  const { data: polyData } = usePolyList()
  const { data: scheduleData } = useScheduleList({ 
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const selectedPolyId = watch("poly_id")
  const schedules = scheduleData?.data || []
  const filteredSchedules = selectedPolyId 
    ? schedules.filter(s => s.doctor?.poly_id === selectedPolyId)
    : schedules
  const polies = polyData?.data || []

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

  const openRegisterForm = () => {
    reset({ patient_name: "", patient_nik: "", patient_phone: "", poly_id: undefined, doctor_id: undefined, schedule_id: undefined, notes: "" })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({ ...data, queue_date: today })
      toast.success("Pasien berhasil didaftarkan")
      setIsFormOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mendaftarkan pasien")
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Antrean Hari Ini</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={openRegisterForm}>
            <Plus className="mr-2 h-4 w-4" />
            Daftar Pasien
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{summary.total}</p></div>
        <div className="rounded-lg border p-4 bg-blue-50"><p className="text-sm text-blue-600">{QUEUE_STATUS_CONFIG.CHECKED_IN.label}</p><p className="text-2xl font-bold text-blue-700">{summary.checkedIn}</p></div>
        <div className="rounded-lg border p-4 bg-yellow-50"><p className="text-sm text-yellow-600">Sedang Proses</p><p className="text-2xl font-bold text-yellow-700">{summary.inProgress}</p></div>
        <div className="rounded-lg border p-4 bg-green-50"><p className="text-sm text-green-600">{QUEUE_STATUS_CONFIG.DONE.label}</p><p className="text-2xl font-bold text-green-700">{summary.done}</p></div>
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
                  <span className="font-mono text-lg font-bold w-20">{queue.queue_number}</span>
                  <div>
                    <p className="font-medium">{queue.patient.name}</p>
                    <p className="text-sm text-muted-foreground">{queue.poly.name} - {queue.doctor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={QUEUE_STATUS_CONFIG[queue.status]?.variant || "outline"}>{QUEUE_STATUS_CONFIG[queue.status]?.label || queue.status}</Badge>
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

      {/* Register Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Daftar Pasien Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_name">Nama Pasien</Label>
              <Input id="patient_name" {...register("patient_name")} />
              {errors.patient_name && <p className="text-sm text-destructive">{errors.patient_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_nik">NIK</Label>
                <Input id="patient_nik" {...register("patient_nik")} maxLength={16} />
                {errors.patient_nik && <p className="text-sm text-destructive">{errors.patient_nik.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_phone">No. HP</Label>
                <Input id="patient_phone" {...register("patient_phone")} />
                {errors.patient_phone && <p className="text-sm text-destructive">{errors.patient_phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Poli</Label>
              <Controller
                name="poly_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger><SelectValue placeholder="Pilih poli" /></SelectTrigger>
                    <SelectContent>
                      {polies.map((poly) => (
                        <SelectItem key={poly.id} value={String(poly.id)}>{poly.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.poly_id && <p className="text-sm text-destructive">{errors.poly_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Jadwal Dokter</Label>
              <Controller
                name="schedule_id"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value ? String(field.value) : undefined} 
                    onValueChange={(v) => field.onChange(Number(v))}
                    disabled={!selectedPolyId}
                  >
                    <SelectTrigger><SelectValue placeholder={selectedPolyId ? "Pilih jadwal" : "Pilih poli dulu"} /></SelectTrigger>
                    <SelectContent>
                      {filteredSchedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={String(schedule.id)}>
                          {schedule.doctor?.name} ({schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.schedule_id && <p className="text-sm text-destructive">{errors.schedule_id.message}</p>}
            </div>

            <Controller
              name="doctor_id"
              control={control}
              render={({ field }) => {
                const selectedSchedule = filteredSchedules.find(s => s.id === watch("schedule_id"))
                if (selectedSchedule && field.value !== selectedSchedule.doctor_id) {
                  field.onChange(selectedSchedule.doctor_id)
                }
                return <input type="hidden" {...field} />
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Keluhan atau catatan tambahan" rows={3} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                Daftarkan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
