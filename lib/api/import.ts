import { api } from './client'
import {
  PreviewResponse,
  ConfirmRequest,
  ConfirmResponse,
  ResolveRequest,
  ResolveResponse,
  ImportHistoryRecord,
  ImportFileType,
} from '@/types/import'

export const importApi = {
  preview: (file: File, type: ImportFileType): Promise<PreviewResponse> => {
    const form = new FormData()
    form.append('file', file)
    form.append('type', type)
    return api.post<PreviewResponse>('/api/v1/upload/preview', form)
  },

  confirm: (req: ConfirmRequest): Promise<ConfirmResponse> =>
    api.post<ConfirmResponse>('/api/v1/upload/confirm', req),

  resolveDuplicates: (req: ResolveRequest): Promise<ResolveResponse> =>
    api.post<ResolveResponse>('/api/v1/upload/duplicates/resolve', req),

  getHistory: (): Promise<ImportHistoryRecord[]> =>
    api.get<ImportHistoryRecord[]>('/api/v1/upload/history'),

}
