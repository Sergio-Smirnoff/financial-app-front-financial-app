'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { UploadCloud } from 'lucide-react'
import { ImportFileType } from '@/types/import'
import { cn } from '@/lib/utils'

interface Props {
  isLoading: boolean
  onFileSelected: (file: File, type: ImportFileType) => void
}

export function StepFileSelect({ isLoading, onFileSelected }: Props) {
  const t = useTranslations('imports')
  const [selectedType, setSelectedType] = useState<ImportFileType>('VISA_PDF')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fileTypes: { value: ImportFileType; label: string; accept: string; hint: string }[] = [
    { value: 'VISA_PDF', label: t('steps.fileTypes.VISA_PDF'), accept: '.pdf', hint: 'ERESUMEN VISA.PDF' },
    { value: 'BANK_PDF', label: t('steps.fileTypes.BANK_PDF'), accept: '.pdf', hint: 'EXT.DE.MOVIMIENTOS.pdf' },
    { value: 'CSV', label: t('steps.fileTypes.CSV'), accept: '.csv', hint: t('steps.fileSelect.hintCsv') },
  ]

  const accept = fileTypes.find(ft => ft.value === selectedType)?.accept ?? '.pdf'

  const handleFile = (file: File) => {
    if (!file) return
    onFileSelected(file, selectedType)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">{t('steps.fileSelect.question')}</Label>
        <div className="space-y-2">
          {fileTypes.map(ft => (
            <label
              key={ft.value}
              className={cn(
                'flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors',
                selectedType === ft.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <input
                type="radio"
                name="fileType"
                value={ft.value}
                checked={selectedType === ft.value}
                onChange={() => setSelectedType(ft.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">{ft.label}</p>
                <p className="text-xs text-muted-foreground">{ft.hint}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          isLoading && 'pointer-events-none opacity-60',
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        {isLoading ? (
          <p className="text-sm text-muted-foreground animate-pulse">{t('steps.fileSelect.parsing')}</p>
        ) : (
          <>
            <p className="text-sm font-medium">{t('steps.fileSelect.dropPrompt')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('steps.fileSelect.acceptedFormats', { formats: accept.toUpperCase().replace('.', '') })}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
