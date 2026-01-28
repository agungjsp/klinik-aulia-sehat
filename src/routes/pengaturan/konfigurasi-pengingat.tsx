import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  useReminderConfigList,
  useReminderConfigCreate,
  useReminderConfigUpdate,
  useReminderConfigDelete,
  useMessageTemplateList,
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
import type { ReminderConfig } from "@/types"

export const Route = createFileRoute("/pengaturan/konfigurasi-pengingat")({
  component: ReminderConfigPage,
})

const reminderConfigSchema = z.object({
  message_template_id: z.number().min(1, "Template pesan wajib dipilih"),
  reminder_offset: z.number().min(0, "Offset pengingat wajib diisi"),
  reminder_patient_count: z.number().min(1, "Jumlah pasien wajib diisi"),
  reminder_type: z.string().min(1, "Tipe pengingat wajib diisi"),
})

type ReminderConfigForm = z.infer<typeof reminderConfigSchema>

function ReminderConfigPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ReminderConfig | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: configsData, isLoading } = useReminderConfigList({
    page,
    per_page: perPage,
  })

  const { data: templatesData } = useMessageTemplateList({
    per_page: 100,
  })

  const createMutation = useReminderConfigCreate()
  const updateMutation = useReminderConfigUpdate()
  const deleteMutation = useReminderConfigDelete()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReminderConfigForm>({
    resolver: zodResolver(reminderConfigSchema),
    defaultValues: {
      message_template_id: 0,
      reminder_offset: 0,
      reminder_patient_count: 1,
      reminder_type: "QUEUE",
    },
  })

  const templates = templatesData?.data.data || []

  const openCreateForm = () => {
    setEditingConfig(null)
    reset({
      message_template_id: 0,
      reminder_offset: 0,
      reminder_patient_count: 1,
      reminder_type: "QUEUE",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (config: ReminderConfig) => {
    setEditingConfig(config)
    reset({
      message_template_id: config.message_template_id,
      reminder_offset: config.reminder_offset,
      reminder_patient_count: config.reminder_patient_count,
      reminder_type: config.reminder_type,
    })
    setIsFormOpen(true)
  }

  const onSubmit = async (formData: ReminderConfigForm) => {
    try {
      if (editingConfig) {
        await updateMutation.mutateAsync({
          id: editingConfig.id,
          data: formData,
        })
        toast.success("Konfigurasi pengingat berhasil diperbarui")
      } else {
        await createMutation.mutateAsync(formData)
        toast.success("Konfigurasi pengingat berhasil ditambahkan")
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
      toast.success("Konfigurasi pengingat berhasil dihapus")
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const configs = configsData?.data.data || []
  const pagination = configsData?.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Konfigurasi Pengingat</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Konfigurasi
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Pesan</TableHead>
              <TableHead>Offset (menit)</TableHead>
              <TableHead>Jumlah Pasien</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    {config.message_template?.template_name || "-"}
                  </TableCell>
                  <TableCell>{config.reminder_offset}</TableCell>
                  <TableCell>{config.reminder_patient_count}</TableCell>
                  <TableCell>{config.reminder_type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(config)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(config.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Edit Konfigurasi" : "Tambah Konfigurasi"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message_template_id">Template Pesan</Label>
              <Select
                value={watch("message_template_id")?.toString() || ""}
                onValueChange={(value) => setValue("message_template_id", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih template pesan" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.message_template_id && (
                <p className="text-sm text-destructive">{errors.message_template_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_offset">Offset Pengingat (menit)</Label>
              <Input
                id="reminder_offset"
                type="number"
                {...register("reminder_offset", { valueAsNumber: true })}
                placeholder="Masukkan offset dalam menit"
              />
              {errors.reminder_offset && (
                <p className="text-sm text-destructive">{errors.reminder_offset.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_patient_count">Jumlah Pasien</Label>
              <Input
                id="reminder_patient_count"
                type="number"
                {...register("reminder_patient_count", { valueAsNumber: true })}
                placeholder="Masukkan jumlah pasien"
              />
              {errors.reminder_patient_count && (
                <p className="text-sm text-destructive">{errors.reminder_patient_count.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_type">Tipe Pengingat</Label>
              <Select
                value={watch("reminder_type") || "QUEUE"}
                onValueChange={(value) => setValue("reminder_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe pengingat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUEUE">Antrean</SelectItem>
                  <SelectItem value="SCHEDULE">Jadwal</SelectItem>
                </SelectContent>
              </Select>
              {errors.reminder_type && (
                <p className="text-sm text-destructive">{errors.reminder_type.message}</p>
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
                {editingConfig ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="Hapus Konfigurasi"
        description="Apakah Anda yakin ingin menghapus konfigurasi ini?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
