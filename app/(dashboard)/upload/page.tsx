'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api/upload'
import { FileDropzone } from '@/components/pages/upload/FileDropzone'
import { ProcessingReport } from '@/types/upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function UploadPage() {
  const [report, setReport] = useState<ProcessingReport | null>(null)

  const processMutation = useMutation({
    mutationFn: async (file: File) => {
      const upload = await uploadApi.uploadFile(file)
      return uploadApi.processFile(upload.id)
    },
    onSuccess: (data) => {
      setReport(data)
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Upload</h1>
        <p className="text-muted-foreground">Upload bank statements to import transactions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <FileDropzone 
            onUpload={(file) => processMutation.mutate(file)} 
            disabled={processMutation.isPending}
          />
          {processMutation.isPending && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Processing file... this may take a moment.
            </p>
          )}
        </div>

        {report && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Processing Results
                <Badge variant={report.errorCount > 0 ? 'destructive' : 'default'}>
                  {report.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-2xl font-bold">{report.totalRows}</p>
                  <p className="text-xs text-muted-foreground uppercase">Total</p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3 text-green-600">
                  <p className="text-2xl font-bold">{report.successCount}</p>
                  <p className="text-xs uppercase">Success</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
                  <p className="text-2xl font-bold">{report.errorCount}</p>
                  <p className="text-xs uppercase">Errors</p>
                </div>
              </div>

              {report.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Row Failures</p>
                  <div className="max-h-48 overflow-auto rounded-md border text-sm">
                    {report.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 border-b p-2 last:border-0">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <div>
                          <p className="font-medium">Row {err.rowNumber}: {err.description}</p>
                          <p className="text-xs text-muted-foreground">{err.errorMessage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.errorCount === 0 && report.successCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  All transactions imported successfully!
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
