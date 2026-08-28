import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export interface FileProgressProps {
  fileName: string
  status: 'uploading' | 'processing' | 'done' | 'error'
  progress?: number
  errorMessage?: string
  className?: string
}

const FILE_STATUS_KEYS: Record<FileProgressProps['status'], string> = {
  uploading: 'fileStatusUploading',
  processing: 'fileStatusProcessing',
  done: 'fileStatusDone',
  error: 'fileStatusError',
}

export function FileProgress({ fileName, status, progress, errorMessage, className }: FileProgressProps) {
  const t = useTranslations('common')
  const isError = status === 'error'
  const isDone = status === 'done'
  const isLoading = status === 'uploading' || status === 'processing'

  return (
    <div
      className={cn('flex items-start gap-3 rounded-lg border p-3', className)}
      role="status"
      aria-label={t('fileStatus', { file: fileName, status: t(FILE_STATUS_KEYS[status]) })}
    >
      <FileText className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate">{fileName}</span>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" aria-hidden="true" />}
          {isDone && <CheckCircle2 className="h-4 w-4 text-gain shrink-0" aria-hidden="true" />}
          {isError && <XCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />}
        </div>
        {isLoading && progress !== undefined && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('uploadProgress')}
            />
          </div>
        )}
        {isError && errorMessage && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}
