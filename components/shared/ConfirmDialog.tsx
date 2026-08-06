'use client'

import { Dialog } from '@/components/ui-kit/overlay/Dialog'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/lib/store/ui.store'

/** Thin wrapper — delegates to the ui-kit Dialog so aria-describedby is always present. */
export function ConfirmDialog() {
  const { confirmDelete, closeConfirmDelete } = useUiStore()

  const handleConfirm = () => {
    confirmDelete?.onConfirm()
    closeConfirmDelete()
  }

  return (
    <Dialog
      open={!!confirmDelete}
      onOpenChange={(open) => !open && closeConfirmDelete()}
      title={confirmDelete?.title ?? 'Confirmar'}
      description={confirmDelete?.description ?? '¿Estás seguro de que querés continuar?'}
      tone="destructive"
    >
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={closeConfirmDelete}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          Eliminar
        </Button>
      </div>
    </Dialog>
  )
}
