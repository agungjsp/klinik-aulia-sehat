import { api } from "@/lib/axios"
import type { ApiResponse, WhatsappConfig, WhatsappConfigRequest } from "@/types"

export const whatsappConfigService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<WhatsappConfig[]>>("/api/whatsapp-configs")
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<WhatsappConfig>>(`/api/whatsapp-configs/${id}`)
    return response.data
  },

  create: async (data: WhatsappConfigRequest) => {
    const response = await api.post<ApiResponse<WhatsappConfig>>("/api/whatsapp-configs", data)
    return response.data
  },

  update: async (id: number, data: WhatsappConfigRequest) => {
    const response = await api.put<ApiResponse<WhatsappConfig>>(`/api/whatsapp-configs/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/whatsapp-configs/${id}`)
    return response.data
  },
}
