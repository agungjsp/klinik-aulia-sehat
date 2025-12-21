import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns"
import { id } from "date-fns/locale"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useScheduleList, useScheduleCreate, useScheduleUpdate, useScheduleDelete, useUserList } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import type { Schedule } from "@/types"

export const Route = createFileRoute("/jadwal/")({
  component: JadwalPage,
})

const scheduleSchema = z.object({
  doctor_id: z.number({ message: "Pilih dokter" }),
  date: z.string().min(1, "Tanggal wajib diisi"),
  start_time: z.string().min(1, "Jam mulai wajib diisi"),
  end_time: z.string().min(1, "Jam selesai wajib diisi"),
}).refine((data) => data.start_time < data.end_time, {
  message: "Jam selesai harus lebih besar dari jam mulai",
  path: ["end_time"],
})

type ScheduleForm = z.infer<typeof scheduleSchema>

function JadwalPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { data: usersData, isLoading: isLoadingUsers } = useUserList({ per_page: 1000 })
  const allUsers = usersData?.data || []
  
  // Filter users yang memiliki role mengandung kata "dokter" (case insensitive)
  // atau memiliki poly_id (dokter biasanya terkait dengan poli)
  const filteredDoctors = allUsers.filter((u) => 
    u.roles.some((r) => r.name.toLowerCase().includes("dokter")) || u.poly_id !== null
  )

  // Fallback: jika tidak ada dokter terfilter, tampilkan semua users
  // Untuk edit: pastikan dokter dari schedule ada di list
  let doctors = filteredDoctors.length > 0 ? filteredDoctors : allUsers
  if (editingSchedule?.doctor && !doctors.some(d => d.id === editingSchedule.doctor_id)) {
    doctors = [...doctors, editingSchedule.doctor as any]
  }

  const { data: scheduleData, isLoading } = useScheduleList({
    month: currentMonth.getMonth() + 1,
    year: currentMonth.getFullYear(),
    doctor_id: selectedDoctor !== "all" ? Number(selectedDoctor) : undefined,
  })

  const createMutation = useScheduleCreate()
  const updateMutation = useScheduleUpdate()
  const deleteMutation = useScheduleDelete()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  })

  const schedules = scheduleData?.data || []

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart)

  const getSchedulesForDay = (date: Date) =>
    schedules.filter((s) => isSameDay(new Date(s.date), date))

  const openCreateForm = (date?: Date) => {
    setEditingSchedule(null)
    reset({
      doctor_id: undefined,
      date: date ? format(date, "yyyy-MM-dd") : "",
      start_time: "",
      end_time: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    reset({
      doctor_id: schedule.doctor_id,
      date: schedule.date,
      start_time: schedule.start_time.slice(0, 5),
      end_time: schedule.end_time.slice(0, 5),
    })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({ id: editingSchedule.id, data })
        toast.success("Jadwal berhasil diupdate")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Jadwal berhasil ditambahkan")
      }
      setIsFormOpen(false)
      setSelectedDate(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan")
    }
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Jadwal berhasil dihapus")
      setDeleteId(null)
      setSelectedDate(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus jadwal")
    }
  }

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Dokter</h1>
          <p className="text-muted-foreground">Kelola jadwal praktik dokter</p>
        </div>
        <Button onClick={() => openCreateForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Filter & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-center font-medium">
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter dokter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Dokter</SelectItem>
            {doctors.map((doc) => (
              <SelectItem key={doc.id} value={doc.id.toString()}>{doc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month start */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r bg-muted/30" />
          ))}
          {calendarDays.map((day) => {
            const daySchedules = getSchedulesForDay(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] border-b border-r p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSelected ? "bg-primary/10" : ""
                }`}
                onClick={() => setSelectedDate(day)}
                onDoubleClick={() => openCreateForm(day)}
              >
                <div className="text-right text-sm text-muted-foreground">{format(day, "d")}</div>
                {isLoading ? (
                  <Skeleton className="mt-1 h-5 w-full" />
                ) : (
                  <div className="mt-1 space-y-1">
                    {daySchedules.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className="truncate rounded bg-primary/20 px-1 text-xs"
                        title={`${s.doctor?.name} (${s.start_time.slice(0, 5)}-${s.end_time.slice(0, 5)})`}
                      >
                        {s.doctor?.name?.split(" ")[0]} {s.start_time.slice(0, 5)}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{daySchedules.length - 2} lagi</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">{format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}</h3>
            <Button size="sm" onClick={() => openCreateForm(selectedDate)}>
              <Plus className="mr-1 h-3 w-3" />
              Tambah
            </Button>
          </div>
          {getSchedulesForDay(selectedDate).length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada jadwal</p>
          ) : (
            <div className="space-y-2">
              {getSchedulesForDay(selectedDate).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{s.doctor?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Dokter</Label>
              <Controller
                name="doctor_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingUsers ? "Memuat..." : "Pilih dokter"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>Memuat data...</SelectItem>
                      ) : doctors.length === 0 ? (
                        <SelectItem value="empty" disabled>Tidak ada dokter</SelectItem>
                      ) : (
                        doctors.map((doc) => (
                          <SelectItem key={doc.id} value={String(doc.id)}>{doc.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Jam Mulai</Label>
                <Input id="start_time" type="time" {...register("start_time")} />
                {errors.start_time && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Jam Selesai</Label>
                <Input id="end_time" type="time" {...register("end_time")} />
                {errors.end_time && <p className="text-sm text-destructive">{errors.end_time.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <LoadingSpinner size="sm" className="mr-2" />}
                {editingSchedule ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Jadwal"
        description="Apakah Anda yakin ingin menghapus jadwal ini?"
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  )
}
