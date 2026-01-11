import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, RotateCcw, Search } from "lucide-react"
import {
  useUserList,
  useUserTrashed,
  useUserCreate,
  useUserUpdate,
  useUserDelete,
  useUserRestore,
  useRoleList,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@/types"

export const Route = createFileRoute("/master/users")({
  component: UsersPage,
})

const userCreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  password_confirmation: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  roles: z.array(z.number()).min(1, "Pilih minimal 1 role"),
  poly_id: z.number().nullable().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Password tidak sama",
  path: ["password_confirmation"],
})

const userUpdateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  password_confirmation: z.string().optional().or(z.literal("")),
  roles: z.array(z.number()).min(1, "Pilih minimal 1 role"),
  poly_id: z.number().nullable().optional(),
}).refine((data) => !data.password || data.password === data.password_confirmation, {
  message: "Password tidak sama",
  path: ["password_confirmation"],
})

type UserCreateForm = z.infer<typeof userCreateSchema>
type UserUpdateForm = z.infer<typeof userUpdateSchema>

function UsersPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)
  const [activeTab, setActiveTab] = useState<"active" | "trashed">("active")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [restoreId, setRestoreId] = useState<number | null>(null)

  const { data: userData, isLoading } = useUserList({ search: debouncedSearch || undefined })
  const { data: trashedData, isLoading: isLoadingTrashed } = useUserTrashed()
  const { data: rolesData } = useRoleList()
  const { data: polyData } = usePolyList()

  const createMutation = useUserCreate()
  const updateMutation = useUserUpdate()
  const deleteMutation = useUserDelete()
  const restoreMutation = useUserRestore()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserCreateForm | UserUpdateForm>({
    resolver: zodResolver(editingUser ? userUpdateSchema : userCreateSchema),
  })

  const openCreateForm = () => {
    setEditingUser(null)
    reset({ name: "", username: "", email: "", password: "", password_confirmation: "", roles: [], poly_id: null })
    setIsFormOpen(true)
  }

  const openEditForm = (user: User) => {
    setEditingUser(user)
    reset({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      password_confirmation: "",
      roles: user.roles.map((r) => r.id),
      poly_id: user.poly_id,
    })
    setIsFormOpen(true)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingUser) {
        const updateData = {
          ...data,
          password: data.password || undefined,
          password_confirmation: data.password_confirmation || undefined,
        }
        await updateMutation.mutateAsync({ id: editingUser.id, data: updateData as any })
        toast.success("User berhasil diupdate")
      } else {
        await createMutation.mutateAsync(data as UserCreateForm)
        toast.success("User berhasil ditambahkan")
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
      toast.success("User berhasil dihapus")
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus user")
    }
  }

  const handleRestore = async () => {
    if (!restoreId) return
    try {
      await restoreMutation.mutateAsync(restoreId)
      toast.success("User berhasil direstore")
      setRestoreId(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal merestore user")
    }
  }

  const activeUsers = userData?.data || []
  const trashedUsers = trashedData?.data || []
  const roles = rolesData?.data || []
  const polies = polyData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Users</h1>
          <p className="text-muted-foreground">Kelola data pengguna sistem</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
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
          Active ({activeUsers.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "trashed"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("trashed")}
        >
          Trashed ({trashedUsers.length})
        </button>
      </div>

      {activeTab === "active" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Poli</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : (activeTab === "active" ? activeUsers : trashedUsers).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {activeTab === "active" ? "Tidak ada data user" : "Tidak ada data terhapus"}
                </TableCell>
              </TableRow>
            ) : (
              (activeTab === "active" ? activeUsers : trashedUsers).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary">{role.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{user.poly?.name || "-"}</TableCell>
                  <TableCell className="text-right">
                    {activeTab === "active" ? (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(user.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => setRestoreId(user.id)}>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Tambah User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} aria-invalid={!!errors.username} />
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password {editingUser && "(kosongkan jika tidak diubah)"}</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                <Input id="password_confirmation" type="password" {...register("password_confirmation")} />
                {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                name="roles"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.value?.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...(field.value || []), role.id])
                            } else {
                              field.onChange(field.value?.filter((id) => id !== role.id) || [])
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{role.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.roles && <p className="text-sm text-destructive">{errors.roles.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Poli (opsional)</Label>
              <Controller
                name="poly_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? null : Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih poli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada</SelectItem>
                      {polies.map((poly) => (
                        <SelectItem key={poly.id} value={poly.id.toString()}>
                          {poly.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingUser ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus User"
        description="Apakah Anda yakin ingin menghapus user ini?"
        onConfirm={handleDelete}
        confirmText="Hapus"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={(open) => !open && setRestoreId(null)}
        title="Restore User"
        description="Apakah Anda yakin ingin merestore user ini?"
        onConfirm={handleRestore}
        confirmText="Restore"
      />
    </div>
  )
}
