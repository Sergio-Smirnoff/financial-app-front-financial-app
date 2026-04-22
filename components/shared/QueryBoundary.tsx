import * as React from 'react'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'

interface QueryBoundaryProps {
  isLoading: boolean
  isError: boolean
  error?: Error | null
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorMessage?: string
}

export function QueryBoundary({
  isLoading,
  isError,
  error,
  children,
  loadingComponent = <LoadingSpinner />,
  errorMessage,
}: QueryBoundaryProps) {
  if (isLoading) {
    return <>{loadingComponent}</>
  }

  if (isError) {
    return <ErrorMessage message={errorMessage || error?.message || 'Something went wrong'} />
  }

  return <>{children}</>
}
