export type ImportFileType = 'VISA_PDF' | 'BANK_PDF' | 'CSV'
export type ImportStatus = 'COMPLETED' | 'PARTIAL' | 'FAILED'

export interface ParsedRow {
  date: string
  description: string
  amount: number
  currency: string
  type: 'EXPENSE' | 'INCOME'
}

export interface PreviewResponse {
  tempKey: string
  fileHash: string
  // CSV fields
  headers?: string[]
  rows?: string[][]
  // PDF/Parsed fields
  preview?: ParsedRow[]
  totalCount?: number
  currencyCounts?: { ARS: number; USD: number; skipped: number }
}

export interface ConfirmRequest {
  tempKey: string
  type: ImportFileType
  columnMapping?: {
    dateCol: number
    descCol: number
    expenseCol?: number
    incomeCol?: number
  }
  dateFormat?: string
  accountCbu?: string
  cardNumber?: string
  arsAccountCbu?: string
  usdAccountCbu?: string
}

export interface ConfirmResponse {
  imported: number
  skipped: number
  errors: string[]
  duplicates: DuplicateItem[]
  sessionId?: string
}

export interface DuplicateItem {
  id: string
  date: string
  description: string
  amount: number
  currency: string
}

export interface ResolveRequest {
  sessionId: string
  keepIds: string[]
}

export interface ResolveResponse {
  imported: number
  skipped: number
}

export interface CurrencyCounts {
  ARS: number
  USD: number
  skipped: number
}

export interface ColumnMapping {
  dateCol: number
  descCol: number
  expenseCol: number | null
  incomeCol: number | null
}

export interface ImportHistoryRecord {
  id: number
  originalName: string
  fileType: string
  bankNumber: string
  accountCbu?: string
  cardNumber?: string
  importedCount: number
  importStatus: ImportStatus
  createdAt: string
}
