import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format, parse } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Plus, Play, CheckCircle, XCircle, Trash2, RefreshCw, MoreHorizontal, CalendarIcon } from "lucide-react"
import { useQueueList, useQueueCreate, useQueueUpdateStatus, useQueueDelete, usePolyList, useScheduleList } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import type { Queue, QueueStatus } from "@/types"

export const Route = createFileRoute("/antrean/")({
  component: AntreanPage,
})

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

const statusConfig: Record<QueueStatus, { label: string; color: string; bgColor: string }> = {
  WAITING: { label: "Menunggu", color: "text-blue-700", bgColor: "bg-blue-100" },
  IN_SERVICE: { label: "Dilayani", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  DONE: { label: "Selesai", color: "text-green-700", bgColor: "bg-green-100" },
  NO_SHOW: { label: "Tidak Hadir", color: "text-gray-700", bgColor: "bg-gray-200" },
  CANCELLED: { label: "Dibatalkan", color: "text-red-700", bgColor: "bg-red-100" },
}

function StatusBadge({ status }: { status: QueueStatus }) {
  const config = statusConfig[status]
  return <Badge className={`${config.bgColor} ${config.color} hover:${config.bgColor}`}>{config.label}</Badge>
}

function AntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const [selectedDate, setSelectedDate] = useState(today)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: queueData, isLoading, refetch } = useQueueList({ date: selectedDate })
  const { data: polyData } = usePolyList()
  // Fetch schedules for current month (not filtered by exact date) to get available doctors
  const { data: scheduleData } = useScheduleList({ 
    month: new Date(selectedDate).getMonth() + 1,
    year: new Date(selectedDate).getFullYear()
  })

  const createMutation = useQueueCreate()
  const updateStatusMutation = useQueueUpdateStatus()
  const deleteMutation = useQueueDelete()

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const selectedPolyId = watch("poly_id")
  const schedules = scheduleData?.data || []
  const filteredSchedules = selectedPolyId 
    ? schedules.filter(s => s.doctor?.poly_id === selectedPolyId)
    : schedules

  const queues = queueData?.data || []
  const polies = polyData?.data || []

  // Group queues by status for summary
  const summary = {
    total: queues.length,
    waiting: queues.filter(q => q.status === "WAITING").length,
    in_service: queues.filter(q => q.status === "IN_SERVICE").length,
    done: queues.filter(q => q.status === "DONE").length,
    no_show: queues.filter(q => q.status === "NO_SHOW").length,
  }

  const openRegisterForm = () => {
    reset({ patient_name: "", patient_nik: "", patient_phone: "", poly_id: undefined, doctor_id: undefined, schedule_id: undefined, notes: "" })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({ ...data, queue_date: selectedDate })
      toast.success("Pasien berhasil didaftarkan")
      setIsFormOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mendaftarkan pasien")
    }
  })

  const handleUpdateStatus = async (queue: Queue, newStatus: QueueStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: queue.id, data: { status: newStatus } })
      toast.success(`Status diubah ke ${statusConfig[newStatus].label}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Antrean berhasil dihapus")
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus antrean")
    }
  }

  const getNextActions = (queue: Queue) => {
    switch (queue.status) {
      case "WAITING":
        return [
          { label: "Panggil", icon: Play, status: "IN_SERVICE" as QueueStatus, variant: "default" as const },
          { label: "No Show", icon: XCircle, status: "NO_SHOW" as QueueStatus, variant: "outline" as const },
        ]
      case "IN_SERVICE":
        return [
          { label: "Selesai", icon: CheckCircle, status: "DONE" as QueueStatus, variant: "default" as const },
        ]
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Antrean Pasien</h1>
          <p className="text-muted-foreground">Kelola antrean dan kedatangan pasien</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openRegisterForm}>
            <Plus className="mr-2 h-4 w-4" />
            Daftar Pasien
          </Button>
        </div>
      </div>

      {/* Date & Summary */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Tanggal:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(parse(selectedDate, "yyyy-MM-dd", new Date()), "d MMMM yyyy", { locale: localeId }) : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parse(selectedDate, "yyyy-MM-dd", new Date())}
                onSelect={(date) => date && setSelectedDate(format(date, "yyyy-MM-dd"))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Total: {summary.total}</Badge>
          <Badge className="bg-blue-100 text-blue-700">Menunggu: {summary.waiting}</Badge>
          <Badge className="bg-yellow-100 text-yellow-700">Dilayani: {summary.in_service}</Badge>
          <Badge className="bg-green-100 text-green-700">Selesai: {summary.done}</Badge>
          <Badge className="bg-gray-200 text-gray-700">No Show: {summary.no_show}</Badge>
        </div>
      </div>

      {/* Queue List */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-[80px_1fr_150px_100px_100px_150px] gap-4 border-b bg-muted/50 p-3 text-sm font-medium">
          <div>No.</div>
          <div>Pasien</div>
          <div>Poli / Dokter</div>
          <div>Jam Datang</div>
          <div>Status</div>
          <div className="text-right">Aksi</div>
        </div>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[80px_1fr_150px_100px_100px_150px] gap-4 border-b p-3">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24 ml-auto" />
            </div>
          ))
        ) : queues.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Tidak ada antrean untuk tanggal {format(new Date(selectedDate), "d MMMM yyyy", { locale: localeId })}
          </div>
        ) : (
          queues.map((queue) => (
            <div
              key={queue.id}
              className={`grid grid-cols-[80px_1fr_150px_100px_100px_150px] gap-4 border-b p-3 items-center ${
                queue.status === "IN_SERVICE" ? "bg-yellow-50" : ""
              }`}
            >
              <div className="font-mono font-bold text-lg">{queue.queue_number}</div>
              <div>
                <p className="font-medium">{queue.patient.name}</p>
                <p className="text-xs text-muted-foreground">{queue.patient.phone}</p>
              </div>
              <div>
                <p className="text-sm">{queue.poly.name}</p>
                <p className="text-xs text-muted-foreground">{queue.doctor.name}</p>
              </div>
              <div className="text-sm">{queue.arrival_time?.slice(0, 5) || "-"}</div>
              <div><StatusBadge status={queue.status} /></div>
              <div className="flex justify-end gap-1">
                {(() => {
                  const actions = getNextActions(queue)
                  const showDelete = queue.status === "WAITING"
                  
                  if (actions.length + (showDelete ? 1 : 0) > 1) {
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          {actions.map((action) => (
                            <DropdownMenuItem
                              key={action.status}
                              onClick={() => handleUpdateStatus(queue, action.status)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <action.icon className="mr-2 h-4 w-4" />
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                          {showDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteId(queue.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  }

                  return (
                    <>
                      {actions.map((action) => (
                        <Button
                          key={action.status}
                          variant={action.variant}
                          size="sm"
                          onClick={() => handleUpdateStatus(queue, action.status)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <action.icon className="h-3 w-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                      {showDelete && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(queue.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          ))
        )}
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
                    onValueChange={(v) => {
                      const schedule = filteredSchedules.find(s => s.id === Number(v))
                      field.onChange(Number(v))
                      if (schedule) {
                        // Also set doctor_id from schedule
                      }
                    }}
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Antrean"
        description="Apakah Anda yakin ingin menghapus antrean ini?"
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  )
}
