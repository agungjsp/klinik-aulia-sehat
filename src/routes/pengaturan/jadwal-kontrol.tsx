import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import {
  useCheckupScheduleList,
  useCheckupScheduleCreate,
  useCheckupScheduleUpdate,
  useCheckupScheduleDelete,
  usePatientList,
  usePolyList,
  useDebouncedValue,
} from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/ui/pagination-controls"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api-error"
import type { CheckupSchedule } from "@/types"

export const Route = createFileRoute("/pengaturan/jadwal-kontrol")({
  component: CheckupSchedulePage,
})

const checkupScheduleSchema = z.object({
  patient_id: z.number().min(1, "Pasien wajib dipilih"),
  poly_id: z.number().min(1, "Poli wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
})

type CheckupScheduleForm = z.infer<typeof checkupScheduleSchema>

function CheckupSchedulePage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<CheckupSchedule | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: schedulesData, isLoading } = useCheckupScheduleList({
    search: debouncedSearch,
    page,
    per_page: perPage,
  })

  const { data: patientsData } = usePatientList()
  const { data: poliesData } = usePolyList()

  const createMutation = useCheckupScheduleCreate()
  const updateMutation = useCheckupScheduleUpdate()
  const deleteMutation = useCheckupScheduleDelete()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckupScheduleForm>({
    resolver: zodResolver(checkupScheduleSchema),
    defaultValues: {
      patient_id: 0,
      poly_id: 0,
      date: "",
      description: "",
    },
  })

  const patients = patientsData?.data?.data || []
  const polies = poliesData?.data || []

  const openCreateForm = () => {
    setEditingSchedule(null)
    reset({
      patient_id: 0,
      poly_id: 0,
      date: "",
      description: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (schedule: CheckupSchedule) => {
    setEditingSchedule(schedule)
    reset({
      patient_id: schedule.patient_id,
      poly_id: schedule.poly_id,
      date: schedule.date,
      description: schedule.description,
    })
    setIsFormOpen(true)
  }

  const onSubmit = async (formData: CheckupScheduleForm) => {
    try {
      if (editingSchedule) {
        await updateMutation.mutateAsync({
          id: editingSchedule.id,
          data: formData,
        })
        toast.success("Jadwal kontrol berhasil diperbarui")
      } else {
        await createMutation.mutateAsync(formData)
        toast.success("Jadwal kontrol berhasil ditambahkan")
      }
      setIsFormOpen(false)
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Jadwal kontrol berhasil dihapus")
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const schedules = schedulesData?.data || []
  const pagination = schedulesData?.meta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jadwal Kontrol</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari jadwal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pasien</TableHead>
              <TableHead>Poli</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.patient?.patient_name || "-"}
                  </TableCell>
                  <TableCell>{schedule.poly?.name || "-"}</TableCell>
                  <TableCell>{schedule.date}</TableCell>
                  <TableCell className="max-w-md truncate">{schedule.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(schedule)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <PaginationControls
          currentPage={page}
          perPage={perPage}
          totalPages={pagination.last_page}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Jadwal" : "Tambah Jadwal"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Pasien</Label>
              <Select
                value={watch("patient_id")?.toString() || ""}
                onValueChange={(value) => setValue("patient_id", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pasien" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.patient_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patient_id && (
                <p className="text-sm text-destructive">{errors.patient_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="poly_id">Poli</Label>
              <Select
                value={watch("poly_id")?.toString() || ""}
                onValueChange={(value) => setValue("poly_id", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih poli" />
                </SelectTrigger>
                <SelectContent>
                  {polies.map((poly) => (
                    <SelectItem key={poly.id} value={poly.id.toString()}>
                      {poly.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.poly_id && (
                <p className="text-sm text-destructive">{errors.poly_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                {...register("description")}
                placeholder="Masukkan deskripsi"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingSchedule ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Hapus Jadwal"
        description="Apakah Anda yakin ingin menghapus jadwal ini?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
