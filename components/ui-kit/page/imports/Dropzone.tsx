'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Upload } from 'lucide-react'

export interface DropzoneProps {
  accept: string
  onFile: (f: File) => void
  disabled?: boolean
  className?: string
}

function isAccepted(file: File, accept: string): boolean {
  const exts = accept.split(',').map((s) => s.trim().toLowerCase())
  const fileName = file.name.toLowerCase()
  const mime = file.type.toLowerCase()

  return exts.some((ext) => {
    if (ext.startsWith('.')) return fileName.endsWith(ext)
    if (ext.includes('/')) return mime === ext || mime.startsWith(ext.replace('*', ''))
    return false
  })
}

export function Dropzone({ accept, onFile, disabled, className }: DropzoneProps) {
  const [error, setError] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const inputId = React.useId()

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      setError('Formato no admitido')
      return
    }
    const file = files[0]
    if (!isAccepted(file, accept)) {
      setError('Formato no admitido')
      return
    }
    setError(null)
    onFile(file)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={inputId} className="block cursor-pointer">
        <span className="sr-only">Archivo</span>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors',
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            disabled && 'pointer-events-none opacity-50',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground text-center">
            Arrastrá un archivo o hacé clic para seleccionar
            <br />
            <span className="text-xs">Formatos aceptados: {accept}</span>
          </p>
        </div>
      </label>

      <input
        id={inputId}
        aria-label="Archivo"
        type="file"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
