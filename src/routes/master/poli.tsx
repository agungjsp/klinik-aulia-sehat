import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Plus, Pencil, Trash2, RotateCcw, Search } from "lucide-react"
import {
  usePolyList,
  usePolyTrashed,
  usePolyCreate,
  usePolyUpdate,
  usePolyDelete,
  usePolyRestore,
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import type { Poly } from "@/types"

export const Route = createFileRoute("/master/poli")({
  component: PoliPage,
})

const polySchema = z.object({
  name: z.string().min(1, "Nama poli wajib diisi"),
})

type PolyForm = z.infer<typeof polySchema>

function PoliPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)
  const [activeTab, setActiveTab] = useState<"active" | "trashed">("active")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPoly, setEditingPoly] = useState<Poly | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [restoreId, setRestoreId] = useState<number | null>(null)

  const { data: polyData, isLoading } = usePolyList(debouncedSearch || undefined)
  const { data: trashedData, isLoading: isLoadingTrashed } = usePolyTrashed()

  const createMutation = usePolyCreate()
  const updateMutation = usePolyUpdate()
  const deleteMutation = usePolyDelete()
  const restoreMutation = usePolyRestore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PolyForm>({
    resolver: zodResolver(polySchema),
  })

  const openCreateForm = () => {
    setEditingPoly(null)
    reset({ name: "" })
    setIsFormOpen(true)
  }

  const openEditForm = (poly: Poly) => {
    setEditingPoly(poly)
    reset({ name: poly.name })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingPoly) {
        await updateMutation.mutateAsync({ id: editingPoly.id, data })
        toast.success("Poli berhasil diupdate")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Poli berhasil ditambahkan")
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
      toast.success("Poli berhasil dihapus")
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus poli")
    }
  }

  const handleRestore = async () => {
    if (!restoreId) return
    try {
      await restoreMutation.mutateAsync(restoreId)
      toast.success("Poli berhasil direstore")
      setRestoreId(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal merestore poli")
    }
  }

  const activePoli = polyData?.data || []
  const trashedPoli = trashedData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Poli</h1>
          <p className="text-muted-foreground">Kelola data poli klinik</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Poli
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active ({activePoli.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "trashed"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("trashed")}
        >
          Trashed ({trashedPoli.length})
        </button>
      </div>

      {/* Search (only for active tab) */}
      {activeTab === "active" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari poli..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="w-48">
                {activeTab === "active" ? "Dibuat" : "Dihapus"}
              </TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(activeTab === "active" ? isLoading : isLoadingTrashed) ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (activeTab === "active" ? activePoli : trashedPoli).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {activeTab === "active" ? "Tidak ada data poli" : "Tidak ada data terhapus"}
                </TableCell>
              </TableRow>
            ) : (
              (activeTab === "active" ? activePoli : trashedPoli).map((poly) => (
                <TableRow key={poly.id}>
                  <TableCell className="font-mono text-sm">{poly.id}</TableCell>
                  <TableCell className="font-medium">{poly.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(
                      new Date(activeTab === "active" ? poly.created_at : poly.deleted_at!),
                      "dd MMM yyyy HH:mm",
                      { locale: id }
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {activeTab === "active" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditForm(poly)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(poly.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRestoreId(poly.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPoly ? "Edit Poli" : "Tambah Poli"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Poli</Label>
              <Input
                id="name"
                placeholder="Masukkan nama poli"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
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
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingPoly ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Poli"
        description="Apakah Anda yakin ingin menghapus poli ini? Data dapat direstore dari tab Trashed."
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />

      {/* Restore Confirmation */}
      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={(open) => !open && setRestoreId(null)}
        title="Restore Poli"
        description="Apakah Anda yakin ingin merestore poli ini?"
        onConfirm={handleRestore}
        confirmText="Restore"
      />
    </div>
  )
}
