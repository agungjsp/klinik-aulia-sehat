import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useAuthStore } from "@/stores"
import { authService } from "@/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLocale } from "@/hooks"
import { getDefaultRoute } from "@/lib/roles"
import { getApiErrorMessage } from "@/lib/api-error"

type LoginForm = {
  username: string
  password: string
}

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (isAuthenticated) {
      throw redirect({ to: getDefaultRoute(user?.roles) })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation(["auth", "common", "language"])
  const { language, changeLanguage } = useLocale()
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const loginSchema = z.object({
    username: z.string().min(1, t("auth:validation.usernameRequired")),
    password: z.string().min(1, t("auth:validation.passwordRequired")),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.status === "success" && data.token && data.user) {
        setAuth(data.user, data.token)
        toast.success(t("auth:login.success"))
        router.navigate({ to: getDefaultRoute(data.user.roles) })
      } else {
        toast.error(data.message || t("auth:login.failed"))
      }
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data)
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="fixed top-4 right-4 w-[140px]">
        <Select value={language} onValueChange={(value) => void changeLanguage(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">{t("language:indonesian")}</SelectItem>
            <SelectItem value="en">{t("language:english")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth:login.title")}</CardTitle>
          <CardDescription>{t("auth:login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth:login.username")}</Label>
              <Input
                id="username"
                placeholder={t("auth:login.usernamePlaceholder")}
                {...register("username")}
                autoComplete="username"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth:login.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth:login.passwordPlaceholder")}
                {...register("password")}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t("common:actions.process")}
                </>
              ) : (
                t("auth:login.submit")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
