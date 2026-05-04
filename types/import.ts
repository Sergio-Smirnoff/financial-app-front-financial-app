export type ImportFileType = 'VISA_PDF' | 'BANK_PDF' | 'CSV'
export type ImportStatus = 'COMPLETED' | 'PARTIAL' | 'FAILED'

export interface ParsedRow {
  date: string
  description: string
  amount: number
  currency: string
  type: 'EXPENSE' | 'INCOME'
}

export interface CurrencyCounts {
  ARS: number
  USD: number
  skipped: number
}

export interface PreviewResponse {
  tempKey: string
  fileHash: string
  headers?: string[]
  rows?: string[][]
  preview?: ParsedRow[]
  totalCount?: number
  currencyCounts?: CurrencyCounts
}

export interface ColumnMapping {
  dateCol: number
  descCol: number
  expenseCol: number | null
  incomeCol: number | null
}

export interface ConfirmRequest {
  tempKey: string
  type: ImportFileType
  columnMapping?: ColumnMapping
  dateFormat?: string
  cardId?: number
  arsAccountId?: number
  usdAccountId?: number
  accountId?: number
}

export interface DuplicateItem {
  id: string
  date: string
  description: string
  amount: number
  currency: string
}

export interface ConfirmResponse {
  imported: number
  skipped: number
  errors: string[]
  duplicates: DuplicateItem[]
  sessionId?: string
}

export interface ResolveRequest {
  sessionId: string
  keepIds: string[]
}

export interface ResolveResponse {
  imported: number
  skipped: number
}

export interface ImportHistoryRecord {
  id: number
  originalName: string
  fileType: string
  bankId?: number
  accountId?: number
  cardId?: number
  importedCount: number
  importStatus: ImportStatus
  createdAt: string
}

