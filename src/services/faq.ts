import { api } from "@/lib/axios"
import type { ApiResponse, Faq } from "@/types"

export const faqService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Faq[]>>("/api/faq")
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Faq>>(`/api/faq/${id}`)
    return response.data
  },

  create: async (data: { name: string; file: File }) => {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("file", data.file)
    
    const response = await api.post<ApiResponse<Faq>>("/api/faq", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  update: async (id: number, data: { name: string; file?: File }) => {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("_method", "PUT") // Laravel method spoofing for multipart
    if (data.file) {
      formData.append("file", data.file)
    }
    
    const response = await api.post<ApiResponse<Faq>>(`/api/faq/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/api/faq/${id}`)
    return response.data
  },
}
