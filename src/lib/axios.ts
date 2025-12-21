import axios from "axios"
import { useAuthStore } from "@/stores/auth"

const API_BASE_URL = "https://sistem-antrean.zeabur.app"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip 401 handling for login endpoint - let the mutation handle it
    const isLoginRequest = error.config?.url?.includes("/auth/login")

    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
