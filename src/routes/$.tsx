import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/$")({
  component: NotFound,
})

function NotFound() {
  const { t } = useTranslation(["errors"])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">{t("notFound.title")}</h1>
      <p className="mt-4 text-xl text-muted-foreground">{t("notFound.description")}</p>
    </div>
  )
}
