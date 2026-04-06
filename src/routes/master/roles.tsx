import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { format } from "date-fns"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getApiErrorMessage } from "@/lib/api-error"
import { getLocaleByLanguage } from "@/lib/i18n/date-locale"
import type { DataTableColumn, Role } from "@/types"

export const Route = createFileRoute("/master/roles")({
  component: RolesPage,
})

type RoleForm = {
  name: string
}

function RolesPage() {
  const { t, i18n } = useTranslation(["master", "common"])
  const { dateFnsLocale } = getLocaleByLanguage(i18n.language)
  const roleSchema = z.object({
    name: z.string().min(1, t("master:roles.validation.nameRequired")),
  })
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
        toast.success(t("master:roles.toasts.updated"))
      } else {
        await createMutation.mutateAsync(data)
        toast.success(t("master:roles.toasts.added"))
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
      toast.success(t("master:roles.toasts.deleted"))
      setDeleteId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRestore = async () => {
    if (!restoreId) return
    try {
      await restoreMutation.mutateAsync(restoreId)
      toast.success(t("master:roles.toasts.restored"))
      setRestoreId(null)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const activeRoles = roleData?.data || []
  const trashedRoles = trashedData?.data || []
  const currentRoles = activeTab === "active" ? activeRoles : trashedRoles
  const isCurrentLoading = activeTab === "active" ? isLoading : isLoadingTrashed
  const roleToDelete = activeRoles.find((role) => role.id === deleteId)
  const roleToRestore = trashedRoles.find((role) => role.id === restoreId)
  const columns: DataTableColumn<Role>[] = [
    {
      id: "id",
      header: t("master:roles.table.id"),
      cell: (role) => <span className="font-mono text-sm">{role.id}</span>,
      widthClassName: "w-16",
    },
    {
      id: "name",
      header: t("master:roles.table.name"),
      cell: (role) => <span className="font-medium">{role.name}</span>,
      widthClassName: "min-w-[220px]",
    },
    {
      id: "timestamp",
      header: activeTab === "active" ? t("master:roles.table.created") : t("master:roles.table.deleted"),
      cell: (role) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(activeTab === "active" ? role.created_at : role.deleted_at!), "dd MMM yyyy HH:mm", { locale: dateFnsLocale })}
        </span>
      ),
      widthClassName: "w-48",
    },
    {
      id: "actions",
      header: t("master:roles.table.actions"),
      align: "right",
      widthClassName: "w-24",
      cell: (role) => (
        <DataTableActions>
          {activeTab === "active" ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditForm(role)}
                aria-label={t("master:roles.table.editAria", { name: role.name })}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(role.id)}
                aria-label={t("master:roles.table.deleteAria", { name: role.name })}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRestoreId(role.id)}
              aria-label={t("master:roles.table.restoreAria", { name: role.name })}
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
          <h1 className="text-2xl font-bold">{t("master:roles.page.title")}</h1>
          <p className="text-muted-foreground">{t("master:roles.page.description")}</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          {t("master:roles.page.addRole")}
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
          {t("master:common.tabs.active")} ({activeRoles.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "trashed"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("trashed")}
        >
          {t("master:common.tabs.trashed")} ({trashedRoles.length})
        </button>
      </div>

      {activeTab === "active" && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("master:roles.page.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <DataTable
        columns={columns}
        rows={currentRoles}
        rowKey={(role) => role.id}
        loading={isCurrentLoading}
        loadingRowCount={3}
        emptyMessage={activeTab === "active" ? t("master:roles.page.emptyActive") : t("master:roles.page.emptyTrashed")}
        variant="comfortable"
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? t("master:roles.form.editTitle") : t("master:roles.form.addTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("master:roles.form.roleName")}</Label>
              <Input
                id="name"
                placeholder={t("master:roles.form.roleNamePlaceholder")}
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
                {t("common:actions.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingRole ? t("master:roles.form.submitUpdate") : t("common:actions.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("master:roles.confirmDelete.title")}
        description={t("master:roles.confirmDelete.description")}
        entityName={roleToDelete?.name}
        impactItems={[
          t("master:roles.confirmDelete.impact1"),
          t("master:roles.confirmDelete.impact2"),
        ]}
        recoveryHint={t("master:roles.confirmDelete.recoveryHint")}
        onConfirm={handleDelete}
        confirmText={t("common:actions.delete")}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={(open) => !open && setRestoreId(null)}
        title={t("master:roles.confirmRestore.title")}
        description={t("master:roles.confirmRestore.description")}
        entityName={roleToRestore?.name}
        impactItems={[t("master:roles.confirmRestore.impact1")]}
        onConfirm={handleRestore}
        confirmText={t("master:roles.confirmRestore.confirmText")}
      />
    </div>
  )
}
