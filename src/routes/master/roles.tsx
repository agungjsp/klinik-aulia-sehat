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
  useRoleList,
  useRoleTrashed,
  useRoleCreate,
  useRoleUpdate,
  useRoleDelete,
  useRoleRestore,
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
import { getApiErrorMessage } from "@/lib/api-error"
import type { Role } from "@/types"

export const Route = createFileRoute("/master/roles")({
  component: RolesPage,
})

const roleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
})

type RoleForm = z.infer<typeof roleSchema>

function RolesPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)
  const [activeTab, setActiveTab] = useState<"active" | "trashed">("active")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [restoreId, setRestoreId] = useState<number | null>(null)

  const { data: roleData, isLoading } = useRoleList(debouncedSearch || undefined)
  const { data: trashedData, isLoading: isLoadingTrashed } = useRoleTrashed()

  const createMutation = useRoleCreate()
  const updateMutation = useRoleUpdate()
  const deleteMutation = useRoleDelete()
  const restoreMutation = useRoleRestore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
  })

  const openCreateForm = () => {
    setEditingRole(null)
    reset({ name: "" })
    setIsFormOpen(true)
  }

  const openEditForm = (role: Role) => {
    setEditingRole(role)
    reset({ name: role.name })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingRole) {
        await updateMutation.mutateAsync({ id: editingRole.id, data })
        toast.success("Role berhasil diupdate")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Role berhasil ditambahkan")
      }
      setIsFormOpen(false)
      reset()
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Role berhasil dihapus")
      setDeleteId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRestore = async () => {
    if (!restoreId) return
    try {
      await restoreMutation.mutateAsync(restoreId)
      toast.success("Role berhasil direstore")
      setRestoreId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const activeRoles = roleData?.data || []
  const trashedRoles = trashedData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Roles</h1>
          <p className="text-muted-foreground">Kelola data role pengguna</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Role
        </Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active ({activeRoles.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "trashed"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("trashed")}
        >
          Trashed ({trashedRoles.length})
        </button>
      </div>

      {activeTab === "active" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <Table variant="comfortable">
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
            ) : (activeTab === "active" ? activeRoles : trashedRoles).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {activeTab === "active" ? "Tidak ada data role" : "Tidak ada data terhapus"}
                </TableCell>
              </TableRow>
            ) : (
              (activeTab === "active" ? activeRoles : trashedRoles).map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-sm">{role.id}</TableCell>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(
                      new Date(activeTab === "active" ? role.created_at : role.deleted_at!),
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
                          onClick={() => openEditForm(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(role.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRestoreId(role.id)}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Tambah Role"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Role</Label>
              <Input
                id="name"
                placeholder="Masukkan nama role"
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
                {editingRole ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Role"
        description="Apakah Anda yakin ingin menghapus role ini? Data dapat direstore dari tab Trashed."
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={(open) => !open && setRestoreId(null)}
        title="Restore Role"
        description="Apakah Anda yakin ingin merestore role ini?"
        onConfirm={handleRestore}
        confirmText="Restore"
      />
    </div>
  )
}
