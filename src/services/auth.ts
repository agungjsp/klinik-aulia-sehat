import { api } from "@/lib/axios"
import type { LoginRequest, LoginResponse, ApiResponse } from "@/types"

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<LoginResponse>("/api/auth/login", data)
    return response.data
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>("/api/auth/logout")
    return response.data
  },
}
