'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  onUpload: (file: File) => void
  disabled?: boolean
}

export function FileDropzone({ onUpload, disabled }: Props) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0])
    }
  }

  return (
    <div
      className={`relative flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Input
        type="file"
        id="file-upload"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={handleChange}
        disabled={disabled}
        accept=".pdf,.csv"
      />
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-medium">Click or drag to upload</p>
          <p className="text-sm text-muted-foreground">ICBC Visa PDF or Generic CSV</p>
        </div>
        <Button variant="outline" disabled={disabled}>Select File</Button>
      </div>
    </div>
  )
}
