'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '@/lib/api/upload'
import { FileDropzone } from '@/components/pages/upload/FileDropzone'
import { ImportPreviewDialog } from '@/components/pages/upload/ImportPreviewDialog'
import { StatementPreviewResponse, CsvPreviewResponse, FileType } from '@/types/upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImportsContent } from '@/components/pages/imports/ImportsContent'

export default function UploadPage() {
  const queryClient = useQueryClient()
  const [previewData, setPreviewData] = useState<StatementPreviewResponse | null>(null)
  const [csvPreviewData, setCsvPreviewData] = useState<CsvPreviewResponse | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentFileType, setCurrentFileType] = useState<FileType>('VISA_ICBC')

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const isPdf = file.name.toLowerCase().endsWith('.pdf')
      const type: FileType = isPdf ? 'VISA_ICBC' : 'CSV'
      setCurrentFileType(type)
      
      if (isPdf) {
        setCsvPreviewData(null)
        return uploadApi.previewPdf(file, type)
      } else {
        setPreviewData(null)
        return uploadApi.previewCsv(file)
      }
    },
    onSuccess: (data) => {
      if (currentFileType === 'CSV') {
        setCsvPreviewData(data as CsvPreviewResponse)
      } else {
        setPreviewData(data as StatementPreviewResponse)
      }
      setIsDialogOpen(true)
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
            onUpload={(file) => previewMutation.mutate(file)} 
            disabled={previewMutation.isPending}
          />
          {previewMutation.isPending && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Parsing file... this may take a moment.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Imports</CardTitle>
            </CardHeader>
            <CardContent>
              <ImportsContent />
            </CardContent>
          </Card>
        </div>
      </div>

      <ImportPreviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        previewData={previewData}
        csvPreviewData={csvPreviewData}
        fileType={currentFileType}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['upload-history'] })
        }}
      />
    </div>
  )
}
