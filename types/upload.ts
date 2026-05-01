export type FileUploadStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL_SUCCESS';

export interface FileUploadResponse {
  id: number;
  originalName: string;
  storagePath: string;
  status: FileUploadStatus;
  createdAt: string;
}

export interface RowError {
  rowNumber: number;
  description: string;
  errorMessage: string;
}

export interface ProcessingReport {
  fileId: number;
  status: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: RowError[];
}
