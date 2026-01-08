import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { RefreshCw, XCircle, Plus, Search, CheckCircle, Filter, Users, Clock, Activity } from "lucide-react"
import { useQueueList, useQueueUpdateStatus, useQueueCreate, usePolyList, useScheduleList } from "@/hooks"
import { patientService } from "@/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { QUEUE_STATUS_CONFIG } from "@/lib/queue-status"
import type { Queue, QueueStatus } from "@/types"

export const Route = createFileRoute("/administrasi/antrean")({
  component: AdministrasiAntreanPage,
})

// Registration form schema
const registerSchema = z.object({
  patient_name: z.string().min(1, "Nama pasien wajib diisi"),
  patient_nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  patient_phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  patient_address: z.string().optional(),
  patient_bpjs: z.string().optional(),
  patient_type: z.enum(["umum", "bpjs"]),
  poly_id: z.number({ message: "Pilih poli" }),
  doctor_id: z.number({ message: "Pilih dokter" }),
  schedule_id: z.number({ message: "Pilih jadwal" }),
  notes: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

function AdministrasiAntreanPage() {
  const today = format(new Date(), "yyyy-MM-dd")
  const { data: queueData, isLoading, refetch } = useQueueList({ date: today })
  const updateStatusMutation = useQueueUpdateStatus()
  
  // Search state
  const [searchNik, setSearchNik] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [foundPatient, setFoundPatient] = useState<{ id: number; name: string; bpjs_number?: string } | null>(null)
  
  // Filter state
  const [filterPoly, setFilterPoly] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ queue: Queue; status: QueueStatus; title: string; description: string } | null>(null)

  // Registration form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const createMutation = useQueueCreate()
  const { data: polyData } = usePolyList()
  const { data: scheduleData } = useScheduleList({ 
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      patient_type: "umum",
    }
  })

  const selectedPolyId = watch("poly_id")
  const patientType = watch("patient_type")
  const schedules = scheduleData?.data || []
  const filteredSchedules = selectedPolyId 
    ? schedules.filter(s => s.doctor?.poly_id === selectedPolyId)
    : schedules
  const polies = polyData?.data || []

  const queues = queueData?.data || []
  
  // Filter Logic
  const filteredQueues = queues.filter(queue => {
    const polyMatch = filterPoly === "all" || String(queue.poly_id) === filterPoly
    
    let statusMatch = true
    if (filterStatus === "all") {
      statusMatch = true
    } else if (filterStatus === "IN_PROGRESS") {
      statusMatch = ["ANAMNESA", "WAITING_DOCTOR", "WITH_DOCTOR"].includes(queue.status)
    } else {
      statusMatch = queue.status === filterStatus
    }
    
    return polyMatch && statusMatch
  })

  const summary = {
    total: queues.length,
    waiting: queues.filter(q => q.status === "WAITING").length,
    inProgress: queues.filter(q => ["ANAMNESA", "WAITING_DOCTOR", "WITH_DOCTOR"].includes(q.status)).length,
    done: queues.filter(q => q.status === "DONE").length,
    noShow: queues.filter(q => q.status === "NO_SHOW").length,
  }

  const handleUpdateStatus = (queue: Queue, newStatus: QueueStatus) => {
    setPendingAction({
      queue, 
      status: newStatus,
      title: "Konfirmasi",
      description: newStatus === "NO_SHOW" ? "Tandai pasien ini sebagai tidak hadir?" : "Ubah status antrean?"
    })
    setConfirmOpen(true)
  }

  const confirmUpdateStatus = async () => {
    if (!pendingAction) return
    try {
      await updateStatusMutation.mutateAsync({ id: pendingAction.queue.id, data: { status: pendingAction.status } })
      toast.success(pendingAction.status === "NO_SHOW" ? "Pasien ditandai tidak hadir" : "Status diperbarui")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status")
    } finally {
      setConfirmOpen(false)
      setPendingAction(null)
    }
  }

  const handleSearchPatient = async () => {
    if (!searchNik || searchNik.length < 16) {
      toast.error("Masukkan NIK yang valid (16 digit)")
      return
    }
    
    setIsSearching(true)
    setFoundPatient(null)
    try {
      const patient = await patientService.searchByNik(searchNik)
      if (patient) {
        setValue("patient_name", patient.name)
        setValue("patient_nik", patient.nik)
        setValue("patient_phone", patient.phone)
        setValue("patient_address", patient.address || "")
        // Auto-fill BPJS if patient has it and type is BPJS
        if (patient.bpjs_number) {
          setValue("patient_bpjs", patient.bpjs_number)
          // If patient has BPJS, auto-select BPJS type
          setValue("patient_type", "bpjs")
        }
        setFoundPatient({ id: patient.id, name: patient.name, bpjs_number: patient.bpjs_number })
        toast.success(`Data pasien ditemukan: ${patient.name}`)
      } else {
        toast.info("Pasien baru, silakan isi data manual")
      }
    } catch (error) {
      toast.error("Gagal mencari pasien")
    } finally {
      setIsSearching(false)
    }
  }

  const openRegisterForm = () => {
    reset({ 
      patient_name: "", 
      patient_nik: "", 
      patient_phone: "", 
      patient_address: "",
      patient_bpjs: "",
      patient_type: "umum",
      poly_id: undefined, 
      doctor_id: undefined, 
      schedule_id: undefined, 
      notes: "" 
    })
    setSearchNik("")
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({ 
        patient_name: data.patient_name,
        patient_nik: data.patient_nik,
        patient_phone: data.patient_phone,
        poly_id: data.poly_id,
        doctor_id: data.doctor_id,
        schedule_id: data.schedule_id,
        queue_date: today,
        notes: data.notes,
      })
      toast.success("Pasien berhasil didaftarkan")
      setIsFormOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mendaftarkan pasien")
    }
  })

  // Helper to format queue number (remove letters)
  const formatQueueNumber = (num: string) => num.replace(/\D/g, '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pendaftaran & Antrean</h1>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard 
          title="Total Pasien" 
          value={summary.total} 
          icon={Users} 
          color="slate" 
          active={filterStatus === "all"}
          onClick={() => setFilterStatus("all")}
        />
        <SummaryCard 
          title={QUEUE_STATUS_CONFIG.WAITING.label} 
          value={summary.waiting} 
          icon={Clock} 
          color="blue" 
          active={filterStatus === "WAITING"}
          onClick={() => setFilterStatus("WAITING")}
        />
        <SummaryCard 
          title="Sedang Proses" 
          value={summary.inProgress} 
          icon={Activity} 
          color="yellow" 
          active={["ANAMNESA", "WAITING_DOCTOR", "WITH_DOCTOR"].includes(filterStatus)}
          onClick={() => setFilterStatus("IN_PROGRESS")}
        />
        <SummaryCard 
          title={QUEUE_STATUS_CONFIG.DONE.label} 
          value={summary.done} 
          icon={CheckCircle} 
          color="green" 
          active={filterStatus === "DONE"}
          onClick={() => setFilterStatus("DONE")}
        />
        <SummaryCard 
          title="Tidak Hadir" 
          value={summary.noShow} 
          icon={XCircle} 
          color="gray" 
          active={filterStatus === "NO_SHOW"}
          onClick={() => setFilterStatus("NO_SHOW")}
        />
      </div>

      {/* Queue List with Filters */}
      <div className="rounded-lg border">
        <div className="border-b p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-semibold">Daftar Antrean Hari Ini</h2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterPoly} onValueChange={setFilterPoly}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Poli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Poli</SelectItem>
                {polies.map(poly => (
                  <SelectItem key={poly.id} value={String(poly.id)}>{poly.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(QUEUE_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-4"><Skeleton className="h-12 w-full" /></div>)
          ) : filteredQueues.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {queues.length === 0 ? "Belum ada antrean hari ini" : "Tidak ada antrean yang sesuai filter"}
            </p>
          ) : (
            filteredQueues.map((queue) => (
              <div key={queue.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg font-bold w-20">{formatQueueNumber(queue.queue_number)}</span>
                  <div>
                    <p className="font-medium">{queue.patient.name}</p>
                    <p className="text-sm text-muted-foreground">{queue.poly.name} - {queue.doctor.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={QUEUE_STATUS_CONFIG[queue.status]?.variant || "outline"}>{QUEUE_STATUS_CONFIG[queue.status]?.label || queue.status}</Badge>
                  {queue.status === "WAITING" && (
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pendaftaran Pasien</DialogTitle>
          </DialogHeader>
          
          {/* Search Patient - Improved UX */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Cari Pasien Lama</h3>
                <p className="text-xs text-blue-600">Masukkan NIK 16 digit untuk mencari data pasien</p>
              </div>
              <span className={`text-xs font-mono px-2 py-1 rounded ${searchNik.length === 16 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {searchNik.length}/16
              </span>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Contoh: 3301234567890001" 
                value={searchNik}
                onChange={(e) => {
                  setSearchNik(e.target.value.replace(/\D/g, ''))
                  setFoundPatient(null)
                }}
                maxLength={16}
                className="font-mono text-lg tracking-wider bg-white"
              />
              <Button 
                variant={searchNik.length === 16 ? "default" : "secondary"} 
                onClick={handleSearchPatient} 
                disabled={isSearching || searchNik.length !== 16}
                className="min-w-[100px]"
              >
                {isSearching ? <LoadingSpinner size="sm" /> : <><Search className="h-4 w-4 mr-2" />Cari</>}
              </Button>
            </div>
          </div>
          
          {/* Found Patient Indicator */}
          {foundPatient && (
            <div className="flex items-center justify-between p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Pasien Ditemukan</p>
                  <p className="text-sm">{foundPatient.name}</p>
                </div>
              </div>
              {foundPatient.bpjs_number && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  BPJS: {foundPatient.bpjs_number}
                </span>
              )}
            </div>
          )}
          
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Patient Type */}
            <div className="space-y-2">
              <Label>Tipe Pasien</Label>
              <Controller
                name="patient_type"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant={field.value === "umum" ? "default" : "outline"}
                      onClick={() => field.onChange("umum")}
                      className="flex-1"
                    >
                      Umum
                    </Button>
                    <Button 
                      type="button" 
                      variant={field.value === "bpjs" ? "default" : "outline"}
                      onClick={() => field.onChange("bpjs")}
                      className="flex-1"
                    >
                      BPJS
                    </Button>
                  </div>
                )}
              />
            </div>
            
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
              <Label htmlFor="patient_address">Alamat</Label>
              <Input id="patient_address" {...register("patient_address")} placeholder="Alamat tempat tinggal" />
            </div>

            {patientType === "bpjs" && (
              <div className="space-y-2">
                <Label htmlFor="patient_bpjs">No. BPJS</Label>
                <Input id="patient_bpjs" {...register("patient_bpjs")} placeholder="Nomor kartu BPJS" />
              </div>
            )}

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

interface SummaryCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: "slate" | "blue" | "yellow" | "green" | "gray"
  active?: boolean
  onClick?: () => void
}

function SummaryCard({ title, value, icon: Icon, color, active, onClick }: SummaryCardProps) {
  const colorStyles = {
    slate: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500",
    blue: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500",
    green: "bg-green-50 text-green-700 border-green-200 ring-green-500",
    gray: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500",
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border",
        colorStyles[color],
        active && "ring-2 ring-offset-1"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <Icon className="h-4 w-4 opacity-70" />
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  )
}
