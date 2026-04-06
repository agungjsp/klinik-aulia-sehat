import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/no-access")({
  component: NoAccess,
})

function NoAccess() {
  const { t } = useTranslation(["errors"])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">{t("noAccess.icon")}</h1>
      <p className="mt-4 text-xl font-semibold">{t("noAccess.title")}</p>
      <p className="mt-2 text-muted-foreground">{t("noAccess.description")}</p>
    </div>
  )
}
