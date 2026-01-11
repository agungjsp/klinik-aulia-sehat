import { useState, useMemo } from "react"
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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Users, AlertCircle } from "lucide-react"
import { useScheduleList, useScheduleCreate, useScheduleUpdate, useScheduleDelete, useUserList } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Schedule } from "@/types"

export const Route = createFileRoute("/jadwal/")({
  component: JadwalPage,
})

// Helper to check if poly name indicates "Gigi" (dental)
function isPolyGigi(polyName: string | undefined): boolean {
  if (!polyName) return false
  return polyName.toLowerCase().includes("gigi")
}

const scheduleSchema = z.object({
  doctor_id: z.number({ message: "Pilih dokter" }),
  date: z.string().min(1, "Tanggal wajib diisi"),
  start_time: z.string().min(1, "Jam mulai wajib diisi"),
  end_time: z.string().min(1, "Jam selesai wajib diisi"),
  quota: z.number().nullable().optional(),
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
  
  // Filter users yang memiliki role "Dokter" atau "Doctor" (case insensitive)
  const filteredDoctors = allUsers.filter((u) => 
    u.roles?.some((r) => {
      const roleName = r.name?.toLowerCase() || ""
      return roleName === "dokter" || roleName === "doctor"
    })
  )

  // Untuk edit: pastikan dokter dari schedule ada di list
  let doctors = filteredDoctors
  if (editingSchedule?.doctor && !doctors.some(d => d.id === editingSchedule.doctor_id)) {
    doctors = [...doctors, editingSchedule.doctor as typeof doctors[0]]
  }

  const { data: scheduleData, isLoading } = useScheduleList({
    month: currentMonth.getMonth() + 1,
    year: currentMonth.getFullYear(),
    doctor_id: selectedDoctor !== "all" ? Number(selectedDoctor) : undefined,
  })

  const createMutation = useScheduleCreate()
  const updateMutation = useScheduleUpdate()
  const deleteMutation = useScheduleDelete()

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  })

  const watchedDoctorId = watch("doctor_id")
  const watchedQuota = watch("quota")

  // Check if selected doctor is from Poli Gigi
  const selectedDoctorData = useMemo(() => {
    if (!watchedDoctorId) return null
    return doctors.find((d) => d.id === watchedDoctorId) || null
  }, [watchedDoctorId, doctors])

  const isSelectedDoctorPoliGigi = useMemo(() => {
    return isPolyGigi(selectedDoctorData?.poly?.name)
  }, [selectedDoctorData])

  // Quota validation: required for Poli Gigi
  const isQuotaValid = useMemo(() => {
    if (!isSelectedDoctorPoliGigi) return true // Not required for non-Gigi
    return watchedQuota !== null && watchedQuota !== undefined && watchedQuota > 0
  }, [isSelectedDoctorPoliGigi, watchedQuota])

  const schedules = scheduleData?.data || []

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart)

  const getSchedulesForDay = (date: Date) =>
    schedules.filter((s: Schedule) => isSameDay(new Date(s.date), date))

  const openCreateForm = (date?: Date) => {
    setEditingSchedule(null)
    reset({
      doctor_id: undefined,
      date: date ? format(date, "yyyy-MM-dd") : "",
      start_time: "",
      end_time: "",
      quota: null,
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
      quota: schedule.quota ?? null,
    })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    // Additional validation for Poli Gigi
    if (isSelectedDoctorPoliGigi && (data.quota === null || data.quota === undefined || data.quota <= 0)) {
      toast.error("Kuota wajib diisi untuk Poli Gigi")
      return
    }

    try {
      const payload = {
        doctor_id: data.doctor_id,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        quota: data.quota,
      }

      if (editingSchedule) {
        await updateMutation.mutateAsync({ id: editingSchedule.id, data: payload })
        toast.success("Jadwal berhasil diupdate")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Jadwal berhasil ditambahkan")
      }
      setIsFormOpen(false)
      setSelectedDate(null)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Terjadi kesalahan")
    }
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Jadwal berhasil dihapus")
      setDeleteId(null)
      setSelectedDate(null)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Gagal menghapus jadwal")
    }
  }

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  const isSubmitDisabled = createMutation.isPending || updateMutation.isPending || !isQuotaValid

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
                className={cn(
                  "min-h-[100px] border-b border-r p-1 cursor-pointer hover:bg-muted/50 transition-colors",
                  isSelected && "bg-primary/10"
                )}
                onClick={() => setSelectedDate(day)}
                onDoubleClick={() => openCreateForm(day)}
              >
                <div className="text-right text-sm text-muted-foreground">{format(day, "d")}</div>
                {isLoading ? (
                  <Skeleton className="mt-1 h-5 w-full" />
                ) : (
                  <div className="mt-1 space-y-1">
                    {daySchedules.slice(0, 2).map((s: Schedule) => {
                      const isDoctorPoliGigi = isPolyGigi(s.doctor?.poly?.name)
                      return (
                        <div
                          key={s.id}
                          className={cn(
                            "truncate rounded px-1 text-xs flex items-center gap-1",
                            isDoctorPoliGigi 
                              ? "bg-pink-100 text-pink-800" 
                              : s.quota 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-primary/20"
                          )}
                          title={`${s.doctor?.name} (${s.start_time.slice(0, 5)}-${s.end_time.slice(0, 5)})${s.quota ? ` - Kuota: ${s.quota}` : ""}${isDoctorPoliGigi ? " - Poli Gigi" : ""}`}
                        >
                          <span className="truncate">{s.doctor?.name?.split(" ")[0]} {s.start_time.slice(0, 5)}</span>
                          {s.quota && (
                            <span className={cn(
                              "shrink-0 text-[10px] px-1 rounded",
                              isDoctorPoliGigi ? "bg-pink-200 text-pink-700" : "bg-blue-200 text-blue-700"
                            )}>
                              {s.quota}
                            </span>
                          )}
                        </div>
                      )
                    })}
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
              {getSchedulesForDay(selectedDate).map((s: Schedule) => {
                const isDoctorPoliGigi = isPolyGigi(s.doctor?.poly?.name)
                return (
                  <div 
                    key={s.id} 
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      isDoctorPoliGigi && "border-pink-200 bg-pink-50/50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{s.doctor?.name}</p>
                        {isDoctorPoliGigi && (
                          <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-200">
                            Poli Gigi
                          </Badge>
                        )}
                        {s.quota !== null && s.quota !== undefined && (
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            Kuota: {s.quota}
                          </Badge>
                        )}
                        {isDoctorPoliGigi && (s.quota === null || s.quota === undefined) && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Kuota belum diset
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        {s.doctor?.poly?.name && ` • ${s.doctor.poly.name}`}
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
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
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
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingUsers ? "Memuat..." : "Pilih dokter"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="__loading" disabled>Memuat data...</SelectItem>
                      ) : doctors.length === 0 ? (
                        <SelectItem value="__empty" disabled>Tidak ada dokter</SelectItem>
                      ) : (
                        doctors.map((doc) => (
                          <SelectItem key={doc.id} value={String(doc.id)}>
                            <div className="flex items-center gap-2">
                              <span>{doc.name}</span>
                              {doc.poly && (
                                <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded",
                                  isPolyGigi(doc.poly.name) 
                                    ? "bg-pink-100 text-pink-700" 
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {doc.poly.name}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id.message}</p>}
              {isSelectedDoctorPoliGigi && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Poli Gigi memerlukan kuota wajib</span>
                </div>
              )}
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

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="quota">Kuota Pasien</Label>
                {isSelectedDoctorPoliGigi ? (
                  <Badge variant="destructive" className="text-xs">Wajib</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Opsional</Badge>
                )}
              </div>
              <Controller
                name="quota"
                control={control}
                render={({ field }) => (
                  <Input
                    id="quota"
                    type="number"
                    min="1"
                    placeholder={isSelectedDoctorPoliGigi ? "Masukkan kuota (wajib)" : "Tanpa batas kuota"}
                    className={cn(
                      isSelectedDoctorPoliGigi && !isQuotaValid && "border-destructive focus-visible:ring-destructive"
                    )}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === "" ? null : Number(val))
                    }}
                  />
                )}
              />
              {isSelectedDoctorPoliGigi && !isQuotaValid && (
                <p className="text-sm text-destructive">Kuota wajib diisi untuk Poli Gigi</p>
              )}
              {!isSelectedDoctorPoliGigi && (
                <p className="text-xs text-muted-foreground">
                  Jika diisi, sistem akan membatasi jumlah reservasi untuk jadwal ini.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
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
