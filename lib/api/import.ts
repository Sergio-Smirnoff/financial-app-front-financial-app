import { api } from './client'
import { 
  ImportFileType, 
  PreviewResponse, 
  ConfirmRequest, 
  ConfirmResponse, 
  ResolveRequest, 
  ResolveResponse, 
  ImportHistoryRecord 
} from '@/types/import'

export const importApi = {
  previewFile: (file: File, type: ImportFileType) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    return api.post<PreviewResponse>('/api/v1/upload/preview', formData)
  },

  confirmImport: (req: ConfirmRequest) =>
    api.post<ConfirmResponse>('/api/v1/upload/confirm', req),

  resolveDuplicates: (req: ResolveRequest) =>
    api.post<ResolveResponse>('/api/v1/upload/duplicates/resolve', req),

  getHistory: () =>
    api.get<ImportHistoryRecord[]>('/api/v1/upload/history'),
}
