import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { importApi } from '@/lib/api/import'
import { ImportFileType, ConfirmRequest, ResolveRequest } from '@/types/import'
import { toast } from 'sonner'

export const usePreviewImport = () =>
  useMutation({
    mutationFn: ({ file, type }: { file: File; type: ImportFileType }) =>
      importApi.preview(file, type),
  })

export const useConfirmImport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ConfirmRequest) => importApi.confirm(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-history'] })
    },
  })
}

export const useResolveDuplicates = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ResolveRequest) => importApi.resolveDuplicates(req),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['import-history'] })
      toast.success(`Imported ${data.imported} additional transactions`)
    },
    onError: (e: any) => {
      toast.error(e.message ?? 'Failed to resolve duplicates')
    },
  })
}

export const useImportHistory = () =>
  useQuery({
    queryKey: ['import-history'],
    queryFn: () => importApi.getHistory(),
  })
