import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  useConfigList,
  useConfigCreate,
  useConfigUpdate,
  useConfigDelete,
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
import { getApiErrorMessage } from "@/lib/api-error"
import type { Config } from "@/types"

export const Route = createFileRoute("/pengaturan/konfigurasi-sistem")({
  component: ConfigPage,
})

const configSchema = z.object({
  name: z.string().min(1, "Nama konfigurasi wajib diisi"),
  value: z.string().min(1, "Nilai konfigurasi wajib diisi"),
})

type ConfigForm = z.infer<typeof configSchema>

function ConfigPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: configsData, isLoading } = useConfigList()

  const createMutation = useConfigCreate()
  const updateMutation = useConfigUpdate()
  const deleteMutation = useConfigDelete()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  })

  const openCreateForm = () => {
    setEditingConfig(null)
    reset({
      name: "",
      value: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (config: Config) => {
    setEditingConfig(config)
    reset({
      name: config.name,
      value: config.value,
    })
    setIsFormOpen(true)
  }

  const onSubmit = async (formData: ConfigForm) => {
    try {
      if (editingConfig) {
        await updateMutation.mutateAsync({
          id: editingConfig.id,
          data: formData,
        })
        toast.success("Konfigurasi sistem berhasil diperbarui")
      } else {
        await createMutation.mutateAsync(formData)
        toast.success("Konfigurasi sistem berhasil ditambahkan")
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
      toast.success("Konfigurasi sistem berhasil dihapus")
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const configs = configsData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Konfigurasi Sistem</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Konfigurasi
        </Button>
      </div>

      <Table variant="comfortable">
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell className="max-w-md truncate">{config.value}</TableCell>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Edit Konfigurasi" : "Tambah Konfigurasi"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Konfigurasi</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Masukkan nama konfigurasi"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Nilai</Label>
              <Input
                id="value"
                {...register("value")}
                placeholder="Masukkan nilai konfigurasi"
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
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
