import { api } from './client'
import { 
  FileUploadResponse, 
  ProcessingReport, 
  StatementPreviewResponse, 
  StatementConfirmResponse,
  TransactionMappingRequest,
  CsvPreviewResponse,
  CsvImportResponse,
  CsvConfirmRequest,
  FileType,
  StatementImport
} from '@/types/upload'

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

  previewPdf: (file: File, fileType: FileType) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<StatementPreviewResponse>(`/api/v1/upload/statement/preview?fileType=${fileType}`, formData)
  },

  confirmPdf: (tempKey: string, accountId: number, fileType: FileType, mappings: TransactionMappingRequest[]) =>
    api.post<StatementConfirmResponse>('/api/v1/upload/statement/confirm', { tempKey, accountId, fileType, mappings }),

  previewCsv: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<CsvPreviewResponse>('/api/v1/upload/csv/preview', formData)
  },

  confirmCsv: (body: CsvConfirmRequest) =>
    api.post<CsvImportResponse>('/api/v1/upload/csv/confirm', body),

  getHistory: () =>
    api.get<StatementImport[]>('/api/v1/upload/history'),
}
