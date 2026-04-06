import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/403")({
  component: Forbidden,
})

function Forbidden() {
  const { t } = useTranslation(["errors"])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">{t("forbidden.title")}</h1>
      <p className="mt-4 text-xl text-muted-foreground">{t("forbidden.description")}</p>
    </div>
  )
}
