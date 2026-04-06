import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, RotateCcw, Search } from "lucide-react"
import {
  useUserList,
  useUserTrashed,
  useUserCreate,
  useUserUpdate,
  useUserDelete,
  useUserRestore,
  useDebouncedValue,
} from "@/hooks"
import { DataTable, DataTableActions } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PolySelect } from "@/components/poly"
import { RoleCheckboxGroup } from "@/components/role"
import { getApiErrorMessage } from "@/lib/api-error"
import type { DataTableColumn, User } from "@/types"

export const Route = createFileRoute("/master/users")({
  component: UsersPage,
})

type UserCreateForm = {
  name: string
  username: string
  email: string
  password: string
  password_confirmation: string
  roles: number[]
  poly_id?: number | null
}

type UserUpdateForm = {
  name: string
  username: string
  email: string
  password?: string
  password_confirmation?: string
  roles: number[]
  poly_id?: number | null
}

function UsersPage() {
  const { t } = useTranslation(["common", "master"])
  const userCreateSchema = z.object({
    name: z.string().min(1, t("master:users.validation.nameRequired")),
    username: z.string().min(1, t("master:users.validation.usernameRequired")),
    email: z.string().email(t("master:users.validation.emailInvalid")),
    password: z.string().min(6, t("master:users.validation.passwordMin")),
    password_confirmation: z.string().min(6, t("master:users.validation.passwordConfirmationMin")),
    roles: z.array(z.number()).min(1, t("master:users.validation.roleRequired")),
    poly_id: z.number().nullable().optional(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t("master:users.validation.passwordMismatch"),
    path: ["password_confirmation"],
  })

  const userUpdateSchema = z.object({
    name: z.string().min(1, t("master:users.validation.nameRequired")),
    username: z.string().min(1, t("master:users.validation.usernameRequired")),
    email: z.string().email(t("master:users.validation.emailInvalid")),
    password: z.string().min(6, t("master:users.validation.passwordMin")).optional().or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
    roles: z.array(z.number()).min(1, t("master:users.validation.roleRequired")),
    poly_id: z.number().nullable().optional(),
  }).refine((data) => !data.password || data.password === data.password_confirmation, {
    message: t("master:users.validation.passwordMismatch"),
    path: ["password_confirmation"],
  })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 500)
  const [activeTab, setActiveTab] = useState<"active" | "trashed">("active")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [restoreId, setRestoreId] = useState<number | null>(null)

  const { data: userData, isLoading } = useUserList({ search: debouncedSearch || undefined })
  const { data: trashedData, isLoading: isLoadingTrashed } = useUserTrashed()

  const createMutation = useUserCreate()
  const updateMutation = useUserUpdate()
  const deleteMutation = useUserDelete()
  const restoreMutation = useUserRestore()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
        const updateData: UserUpdateForm = {
          ...data,
          password: data.password || undefined,
          password_confirmation: data.password_confirmation || undefined,
        }
        await updateMutation.mutateAsync({ id: editingUser.id, data: updateData })
        toast.success(t("master:users.toasts.updated"))
      } else {
        await createMutation.mutateAsync(data as UserCreateForm)
        toast.success(t("master:users.toasts.added"))
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
      toast.success(t("master:users.toasts.deleted"))
      setDeleteId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRestore = async () => {
    if (!restoreId) return
    try {
      await restoreMutation.mutateAsync(restoreId)
      toast.success(t("master:users.toasts.restored"))
      setRestoreId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const activeUsers = userData?.data || []
  const trashedUsers = trashedData?.data || []
  const currentUsers = activeTab === "active" ? activeUsers : trashedUsers
  const isCurrentLoading = activeTab === "active" ? isLoading : isLoadingTrashed
  const userToDelete = activeUsers.find((user) => user.id === deleteId)
  const userToRestore = trashedUsers.find((user) => user.id === restoreId)
  const columns: DataTableColumn<User>[] = [
    {
      id: "id",
      header: t("master:users.table.id"),
      cell: (user) => <span className="font-mono text-sm">{user.id}</span>,
      widthClassName: "w-16",
    },
    {
      id: "name",
      header: t("master:users.table.name"),
      cell: (user) => <span className="font-medium">{user.name}</span>,
      widthClassName: "min-w-[180px]",
    },
    {
      id: "username",
      header: t("master:users.table.username"),
      cell: (user) => user.username,
      widthClassName: "min-w-[160px]",
    },
    {
      id: "email",
      header: t("master:users.table.email"),
      cell: (user) => user.email,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "roles",
      header: t("master:users.table.role"),
      widthClassName: "min-w-[180px]",
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <Badge key={role.id} variant="secondary">{role.name}</Badge>
          ))}
        </div>
      ),
    },
    {
      id: "poly",
      header: t("master:users.table.poly"),
      cell: (user) => user.poly?.name || "-",
      widthClassName: "min-w-[140px]",
    },
    {
      id: "actions",
      header: t("master:users.table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (user) => (
        <DataTableActions>
          {activeTab === "active" ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditForm(user)}
                aria-label={t("master:users.table.editAria", { name: user.name })}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(user.id)}
                aria-label={t("master:users.table.deleteAria", { name: user.name })}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRestoreId(user.id)}
              aria-label={t("master:users.table.restoreAria", { name: user.name })}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </DataTableActions>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("master:users.page.title")}</h1>
          <p className="text-muted-foreground">{t("master:users.page.description")}</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("master:users.page.addUser")}
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
          {t("master:common.tabs.active")} ({activeUsers.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "trashed"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("trashed")}
        >
          {t("master:common.tabs.trashed")} ({trashedUsers.length})
        </button>
      </div>

      {activeTab === "active" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("master:users.page.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <DataTable
        columns={columns}
        rows={currentUsers}
        rowKey={(user) => user.id}
        loading={isCurrentLoading}
        loadingRowCount={3}
        emptyMessage={activeTab === "active" ? t("master:users.page.emptyActive") : t("master:users.page.emptyTrashed")}
        variant="comfortable"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? t("master:users.form.editTitle") : t("master:users.form.addTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("master:users.form.name")}</Label>
                <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">{t("master:users.form.username")}</Label>
                <Input id="username" {...register("username")} aria-invalid={!!errors.username} />
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("master:users.form.email")}</Label>
              <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t("master:users.form.password")} {editingUser && t("master:users.form.passwordEditHint")}
                </Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">{t("master:users.form.passwordConfirmation")}</Label>
                <Input id="password_confirmation" type="password" {...register("password_confirmation")} />
                {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("master:users.form.role")}</Label>
              <RoleCheckboxGroup
                value={watch("roles") || []}
                onChange={(value) => setValue("roles", value)}
              />
              {errors.roles && <p className="text-sm text-destructive">{errors.roles.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t("master:users.form.polyOptional")}</Label>
              <PolySelect
                value={watch("poly_id") ?? undefined}
                onChange={(value) => setValue("poly_id", value ?? null)}
                placeholder={t("master:users.form.polyPlaceholder")}
                allowNone
                noneLabel={t("master:users.form.noPoly")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingUser ? t("actions.update") : t("actions.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("master:users.confirmDelete.title")}
        description={t("master:users.confirmDelete.description")}
        entityName={userToDelete ? `${userToDelete.name} (@${userToDelete.username})` : undefined}
        impactItems={[
          t("master:users.confirmDelete.impact1"),
          t("master:users.confirmDelete.impact2"),
        ]}
        recoveryHint={t("master:users.confirmDelete.recoveryHint")}
        onConfirm={handleDelete}
        confirmText={t("actions.delete")}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={(open) => !open && setRestoreId(null)}
        title={t("master:users.confirmRestore.title")}
        description={t("master:users.confirmRestore.description")}
        entityName={userToRestore ? `${userToRestore.name} (@${userToRestore.username})` : undefined}
        impactItems={[t("master:users.confirmRestore.impact1"), t("master:users.confirmRestore.impact2")]}
        onConfirm={handleRestore}
        confirmText={t("actions.restore")}
      />
    </div>
  )
}
