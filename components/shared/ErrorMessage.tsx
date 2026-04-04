import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({ message = 'Something went wrong.', className }: ErrorMessageProps) {
  return (
    <div className={cn('flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive', className)}>
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}
