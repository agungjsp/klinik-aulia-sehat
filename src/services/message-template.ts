import { api } from "@/lib/axios"
import type { ApiResponse, MessageTemplate, MessageTemplateRequest, PaginatedDataResponse } from "@/types"

export interface MessageTemplateListParams {
  search?: string
  page?: number
  per_page?: number
}

export const messageTemplateService = {
  getAll: async (params?: MessageTemplateListParams) => {
    const response = await api.get<PaginatedDataResponse<MessageTemplate>>("/api/message-templates", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<MessageTemplate>>(`/api/message-templates/${id}`)
    return response.data
  },

  create: async (data: MessageTemplateRequest) => {
    const response = await api.post<ApiResponse<MessageTemplate>>("/api/message-templates", data)
    return response.data
  },

  update: async (id: number, data: MessageTemplateRequest) => {
    const response = await api.put<ApiResponse<MessageTemplate>>(`/api/message-templates/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/message-templates/${id}`)
    return response.data
  },
}
