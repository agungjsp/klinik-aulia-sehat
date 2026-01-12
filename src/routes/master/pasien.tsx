import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { Pencil, Search } from "lucide-react"
import { usePatientList, usePatientUpdate, useDebouncedValue } from "@/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import type { Patient } from "@/types"

export const Route = createFileRoute("/master/pasien")({
  component: PasienPage,
})

const patientSchema = z.object({
  patient_name: z.string().min(1, "Nama wajib diisi"),
  whatsapp_number: z.string().min(10, "No. WhatsApp minimal 10 digit"),
  no_bpjs: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
})

type PatientForm = z.infer<typeof patientSchema>

function PasienPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  const { data: patientData, isLoading } = usePatientList({ search: debouncedSearch || undefined })
  const updateMutation = usePatientUpdate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
  })

  const openEditForm = (patient: Patient) => {
    setEditingPatient(patient)
    reset({
      patient_name: patient.patient_name,
      whatsapp_number: patient.whatsapp_number,
      no_bpjs: patient.no_bpjs || "",
      email: patient.email || "",
    })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!editingPatient) return
    try {
      await updateMutation.mutateAsync({
        id: editingPatient.id,
        data: {
          patient_name: data.patient_name,
          whatsapp_number: data.whatsapp_number,
          no_bpjs: data.no_bpjs || null,
          email: data.email || null,
        },
      })
      toast.success("Pasien berhasil diupdate")
      setIsFormOpen(false)
      reset()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Terjadi kesalahan")
    }
  })

  // Access the nested data array from paginated response
  const patients = patientData?.data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Pasien</h1>
          <p className="text-muted-foreground">
            Data pasien klinik (dari reservasi)
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau no. WhatsApp..."
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
              <TableHead>No. WhatsApp</TableHead>
              <TableHead>No. BPJS</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Tidak ada data pasien
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient: Patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-sm">{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.patient_name}</TableCell>
                  <TableCell>{patient.whatsapp_number}</TableCell>
                  <TableCell className="font-mono text-sm">{patient.no_bpjs || "-"}</TableCell>
                  <TableCell>{patient.email || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(patient)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>Edit Pasien</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_name">Nama Lengkap</Label>
              <Input
                id="patient_name"
                {...register("patient_name")}
                aria-invalid={!!errors.patient_name}
              />
              {errors.patient_name && (
                <p className="text-sm text-destructive">{errors.patient_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">No. WhatsApp</Label>
                <Input
                  id="whatsapp_number"
                  {...register("whatsapp_number")}
                  placeholder="08xxxxxxxxxx"
                />
                {errors.whatsapp_number && (
                  <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_bpjs">No. BPJS (opsional)</Label>
                <Input id="no_bpjs" {...register("no_bpjs")} placeholder="Nomor kartu BPJS" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opsional)</Label>
              <Input id="email" type="email" {...register("email")} placeholder="email@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <LoadingSpinner size="sm" className="mr-2" />}
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
