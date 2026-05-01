import { api } from './client'
import { FileUploadResponse, ProcessingReport } from '@/types/upload'

export const uploadApi = {
  uploadFile: (file: File, bankAccountId?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    if (bankAccountId) {
      formData.append('bankAccountId', bankAccountId.toString())
    }
    return api.post<FileUploadResponse>('/api/v1/upload/files', formData)
  },

  processFile: (fileId: number) =>
    api.post<ProcessingReport>(`/api/v1/upload/files/${fileId}/process`, {}),
}
