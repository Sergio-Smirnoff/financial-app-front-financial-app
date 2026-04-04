'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/lib/store/ui.store'

export function ConfirmDialog() {
  const { confirmDelete, closeConfirmDelete } = useUiStore()

  const handleConfirm = () => {
    confirmDelete?.onConfirm()
    closeConfirmDelete()
  }

  return (
    <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && closeConfirmDelete()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmDelete?.title ?? 'Confirm'}</DialogTitle>
          <DialogDescription>{confirmDelete?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={closeConfirmDelete}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
