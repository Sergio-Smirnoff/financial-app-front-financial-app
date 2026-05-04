import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { importApi } from '@/lib/api/import'
import { ImportFileType, ConfirmRequest, ResolveRequest } from '@/types/import'

export function useImportHistory() {
  return useQuery({
    queryKey: ['import-history'],
    queryFn: () => importApi.getHistory(),
  })
}

export function usePreviewFile() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: ImportFileType }) => 
      importApi.previewFile(file, type),
  })
}

export function useConfirmImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ConfirmRequest) => importApi.confirmImport(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-history'] })
    },
  })
}

export function useResolveDuplicates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ResolveRequest) => importApi.resolveDuplicates(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-history'] })
    },
  })
}
