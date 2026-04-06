import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  entityName?: string
  impactItems?: string[]
  recoveryHint?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "default",
  entityName,
  impactItems,
  recoveryHint,
}: ConfirmDialogProps) {
  const { t } = useTranslation(["common"])
  const showImpactList = Boolean(impactItems && impactItems.length > 0)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{description}</p>
            {entityName && (
              <div className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground">
                <span>{t("confirm.target")}</span>
                <Badge variant="secondary" className="h-5 px-2">
                  {entityName}
                </Badge>
              </div>
            )}
            {showImpactList && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {impactItems?.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {(recoveryHint || variant === "destructive") && (
              <p className="text-xs text-muted-foreground">
                {recoveryHint || t("confirm.irreversible")}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
