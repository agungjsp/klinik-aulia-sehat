import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  useWhatsappConfigList,
  useWhatsappConfigCreate,
  useWhatsappConfigUpdate,
  useWhatsappConfigDelete,
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
import type { WhatsappConfig } from "@/types"

export const Route = createFileRoute("/pengaturan/konfigurasi-whatsapp")({
  component: WhatsappConfigPage,
})

const whatsappConfigSchema = z.object({
  whatsapp_number: z.string().min(1, "Nomor WhatsApp wajib diisi"),
  waha_api_url: z.string().min(1, "URL API WAHA wajib diisi").url("URL tidak valid"),
})

type WhatsappConfigForm = z.infer<typeof whatsappConfigSchema>

function WhatsappConfigPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<WhatsappConfig | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: configsData, isLoading } = useWhatsappConfigList()

  const createMutation = useWhatsappConfigCreate()
  const updateMutation = useWhatsappConfigUpdate()
  const deleteMutation = useWhatsappConfigDelete()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WhatsappConfigForm>({
    resolver: zodResolver(whatsappConfigSchema),
    defaultValues: {
      whatsapp_number: "",
      waha_api_url: "",
    },
  })

  const openCreateForm = () => {
    setEditingConfig(null)
    reset({
      whatsapp_number: "",
      waha_api_url: "",
    })
    setIsFormOpen(true)
  }

  const openEditForm = (config: WhatsappConfig) => {
    setEditingConfig(config)
    reset({
      whatsapp_number: config.whatsapp_number,
      waha_api_url: config.waha_api_url,
    })
    setIsFormOpen(true)
  }

  const onSubmit = async (formData: WhatsappConfigForm) => {
    try {
      if (editingConfig) {
        await updateMutation.mutateAsync({
          id: editingConfig.id,
          data: formData,
        })
        toast.success("Konfigurasi WhatsApp berhasil diperbarui")
      } else {
        await createMutation.mutateAsync(formData)
        toast.success("Konfigurasi WhatsApp berhasil ditambahkan")
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
      toast.success("Konfigurasi WhatsApp berhasil dihapus")
      setDeleteId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const configs = configsData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Konfigurasi WhatsApp</h1>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Konfigurasi
        </Button>
      </div>

      <Table variant="comfortable">
          <TableHeader>
            <TableRow>
              <TableHead>Nomor WhatsApp</TableHead>
              <TableHead>URL API WAHA</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
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
                  <TableCell className="font-medium">{config.whatsapp_number}</TableCell>
                  <TableCell className="max-w-md truncate">{config.waha_api_url}</TableCell>
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
              <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
              <Input
                id="whatsapp_number"
                {...register("whatsapp_number")}
                placeholder="Masukkan nomor WhatsApp"
              />
              {errors.whatsapp_number && (
                <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waha_api_url">URL API WAHA</Label>
              <Input
                id="waha_api_url"
                {...register("waha_api_url")}
                placeholder="https://api.waha.example.com"
              />
              {errors.waha_api_url && (
                <p className="text-sm text-destructive">{errors.waha_api_url.message}</p>
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
