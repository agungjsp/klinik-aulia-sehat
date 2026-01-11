import axios from "axios"
import { useAuthStore } from "@/stores/auth"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

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
    if (error.response?.status === 401) {
      // Only redirect if user was authenticated (token expired/invalid on protected route)
      // Don't redirect if already on login page (invalid credentials during login attempt)
      const isLoginRequest = error.config?.url?.includes("/auth/login")
      if (!isLoginRequest && useAuthStore.getState().isAuthenticated) {
        useAuthStore.getState().logout()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
