import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v4"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/stores"
import { authService } from "@/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
})

type LoginForm = z.infer<typeof loginSchema>

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

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
        toast.success("Login berhasil")
        router.navigate({ to: "/" })
      } else {
        toast.error(data.message || "Login gagal")
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login gagal")
    },
  })

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Klinik Aulia Sehat</CardTitle>
          <p className="text-sm text-muted-foreground">
            Masuk ke sistem antrean
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Masukkan username"
                {...register("username")}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
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
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
