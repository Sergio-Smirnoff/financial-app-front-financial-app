'use client'

import { useState } from 'react'
import { usePortfolioHoldings, useDeleteHolding } from '@/lib/hooks/useInvestments'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { HoldingForm } from './HoldingForm'
import { HoldingSection } from './HoldingSection'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { HoldingWithPrice, AssetType } from '@/types/investments'

const ASSET_TYPE_ORDER: AssetType[] = ['STOCK', 'CEDEAR', 'BOND', 'FCI']
const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  STOCK: 'Stocks',
  CEDEAR: 'CEDEARs',
  BOND: 'Bonds',
  FCI: 'Mutual Funds (FCI)',
}

export function HoldingsContent() {
  const { openConfirmDelete } = useUiStore()
  const { data: holdings, isLoading, isError } = usePortfolioHoldings()
  const deleteHolding = useDeleteHolding()
  const [formOpen, setFormOpen] = useState(false)
  const [editingHolding, setEditingHolding] = useState<HoldingWithPrice | null>(null)

  const handleDelete = (holding: HoldingWithPrice) => {
    openConfirmDelete({
      title: 'Delete holding',
      description: `Delete "${holding.ticker} — ${holding.name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteHolding.mutate(holding.id, {
          onSuccess: () => toast.success('Holding deleted'),
          onError: () => toast.error('Failed to delete holding'),
        })
      },
    })
  }

  const handleEdit = (holding: HoldingWithPrice) => {
    setEditingHolding(holding)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingHolding(null)
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load holdings." />

  const grouped = ASSET_TYPE_ORDER
    .map((type) => ({
      type,
      label: ASSET_TYPE_LABELS[type],
      items: (holdings ?? []).filter((h) => h.assetType === type),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setEditingHolding(null); setFormOpen(true) }}>
          <Plus className="mr-1 h-4 w-4" /> New holding
        </Button>
      </div>

      {holdings?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No holdings yet.</p>
      )}

      {grouped.map((group) => (
        <HoldingSection
          key={group.type}
          label={group.label}
          holdings={group.items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      <Dialog open={formOpen} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHolding ? 'Edit holding' : 'New holding'}</DialogTitle>
          </DialogHeader>
          <HoldingForm
            holding={editingHolding}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </div>
  )
}
