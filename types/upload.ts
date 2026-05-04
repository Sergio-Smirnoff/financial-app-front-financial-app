export type FileType = 'VISA_ICBC' | 'CSV'

export interface ParsedTransaction {
  date: string
  description: string
  amount: number
  currency: string
  type: 'EXPENSE' | 'INCOME'
}

export interface StatementPreviewResponse {
  tempKey: string
  accountNumber: string
  transactions: ParsedTransaction[]
  totalAmount: number
  count: number
}

export interface CsvPreviewResponse {
  tempKey: string
  headers: string[]
  rows: string[][]
}

export interface TransactionMappingRequest {
  date: string
  description: string
  amount: number
  currency: string
  type: 'EXPENSE' | 'INCOME'
  categoryId: number
}

export interface StatementConfirmResponse {
  importId: number
  status: string
  importedCount: number
}

export interface CsvConfirmRequest {
  tempKey: string
  dateCol: number
  descCol: number
  debitCol: number
  creditCol: number
  dateFormat: string
  accountId: number
  fileType: FileType
  mappings?: TransactionMappingRequest[]
}

export interface CsvImportResponse {
  importId: number
  status: string
  importedCount: number
}

export interface FileUploadResponse {
  fileId: number
  status: string
}

export interface ProcessingReport {
  successCount: number
  errorCount: number
  errors: string[]
}

export interface StatementImport {
  id: number
  userId: number
  fileType: string
  accountNumber: string
  periodKey: string
  minioPath: string
  importedCount: number
  importStatus: string
  createdAt: string
}
