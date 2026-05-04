'use client'

import { useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { UploadCloud } from 'lucide-react'
import { ImportFileType } from '@/types/import'
import { cn } from '@/lib/utils'

const FILE_TYPES: { value: ImportFileType; label: string; accept: string; hint: string }[] = [
  { value: 'VISA_PDF', label: 'ICBC Visa Statement', accept: '.pdf', hint: 'ERESUMEN VISA.PDF' },
  { value: 'BANK_PDF', label: 'ICBC Bank Movements', accept: '.pdf', hint: 'EXT.DE.MOVIMIENTOS.pdf' },
  { value: 'CSV', label: 'Generic CSV', accept: '.csv', hint: 'Any CSV with headers' },
]

interface Props {
  isLoading: boolean
  onFileSelected: (file: File, type: ImportFileType) => void
}

export function StepFileSelect({ isLoading, onFileSelected }: Props) {
  const [selectedType, setSelectedType] = useState<ImportFileType>('VISA_PDF')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = FILE_TYPES.find(t => t.value === selectedType)?.accept ?? '.pdf'

  const handleFile = (file: File) => {
    if (!file) return
    onFileSelected(file, selectedType)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">What are you importing?</Label>
        <div className="space-y-2">
          {FILE_TYPES.map(t => (
            <label
              key={t.value}
              className={cn(
                'flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors',
                selectedType === t.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <input
                type="radio"
                name="fileType"
                value={t.value}
                checked={selectedType === t.value}
                onChange={() => setSelectedType(t.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.hint}</p>
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
          <p className="text-sm text-muted-foreground animate-pulse">Parsing file…</p>
        ) : (
          <>
            <p className="text-sm font-medium">Drop file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept.toUpperCase().replace('.', '')} files only
            </p>
          </>
        )}
      </div>
    </div>
  )
}
