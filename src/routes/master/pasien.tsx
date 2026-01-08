import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { usePatientList, usePatientCreate, usePatientUpdate, usePatientDelete } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import type { Patient } from "@/types"

export const Route = createFileRoute("/master/pasien")({
  component: PasienPage,
})

const patientSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  phone: z.string().min(10, "Nomor HP minimal 10 digit"),
  birth_date: z.string().min(1, "Tanggal lahir wajib diisi"),
  address: z.string().optional(),
  bpjs_number: z.string().optional(),
})

type PatientForm = z.infer<typeof patientSchema>

function PasienPage() {
  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: patientData, isLoading } = usePatientList({ search: search || undefined })
  const createMutation = usePatientCreate()
  const updateMutation = usePatientUpdate()
  const deleteMutation = usePatientDelete()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  })

  const openCreateForm = () => {
    setEditingPatient(null)
    reset({ name: "", nik: "", phone: "", birth_date: "", address: "", bpjs_number: "" })
    setIsFormOpen(true)
  }

  const openEditForm = (patient: Patient) => {
    setEditingPatient(patient)
    reset({
      name: patient.name,
      nik: patient.nik,
      phone: patient.phone,
      birth_date: patient.birth_date,
      address: patient.address || "",
      bpjs_number: "",
    })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingPatient) {
        await updateMutation.mutateAsync({ id: editingPatient.id, data })
        toast.success("Pasien berhasil diupdate")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Pasien berhasil ditambahkan")
      }
      setIsFormOpen(false)
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan")
    }
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Pasien berhasil dihapus")
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus pasien")
    }
  }

  const patients = patientData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Pasien</h1>
          <p className="text-muted-foreground">Kelola data pasien klinik</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pasien
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama, NIK, atau HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Tgl. Lahir</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Tidak ada data pasien
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-sm">{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="font-mono text-sm">{patient.nik}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{format(new Date(patient.birth_date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{patient.address || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(patient)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(patient.id)}>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Pasien" : "Tambah Pasien"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" {...register("nik")} maxLength={16} placeholder="16 digit" />
                {errors.nik && <p className="text-sm text-destructive">{errors.nik.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. HP</Label>
                <Input id="phone" {...register("phone")} placeholder="08xxxxxxxxxx" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Tanggal Lahir</Label>
                <Input id="birth_date" type="date" {...register("birth_date")} />
                {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpjs_number">No. BPJS (opsional)</Label>
                <Input id="bpjs_number" {...register("bpjs_number")} placeholder="Nomor kartu BPJS" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" {...register("address")} placeholder="Alamat tempat tinggal" />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingPatient ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Pasien"
        description="Apakah Anda yakin ingin menghapus data pasien ini?"
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />
    </div>
  )
}
