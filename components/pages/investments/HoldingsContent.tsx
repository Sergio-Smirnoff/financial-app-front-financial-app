'use client'

import { useState } from 'react'
import { usePortfolioHoldings, useDeleteHolding } from '@/lib/hooks/useInvestments'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { HoldingForm } from './HoldingForm'
import { HoldingSection } from './HoldingSection'
import { HoldingDetailDialog } from './HoldingDetailDialog'
import { SellHoldingDialog } from './SellHoldingDialog'
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

interface HoldingsContentProps {
  enabled?: boolean
}

export function HoldingsContent({ enabled = true }: HoldingsContentProps) {
  const { data: holdings, isLoading, isError } = usePortfolioHoldings({ enabled })
  const [formOpen, setFormOpen] = useState(false)
  const [editingHolding, setEditingHolding] = useState<HoldingWithPrice | null>(null)
  const [detailHolding, setDetailHolding] = useState<HoldingWithPrice | null>(null)
  const [sellHolding, setSellHolding] = useState<HoldingWithPrice | null>(null)

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
    <div className="space-y-4 h-full flex flex-col overflow-hidden">
      <div className="flex justify-end shrink-0">
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
          onSell={setSellHolding}
          onViewDetail={setDetailHolding}
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

      <SellHoldingDialog
        holding={sellHolding}
        open={sellHolding !== null}
        onOpenChange={(o) => !o && setSellHolding(null)}
        onSuccess={() => setSellHolding(null)}
      />

      <HoldingDetailDialog
        holding={detailHolding}
        open={detailHolding !== null}
        onClose={() => setDetailHolding(null)}
      />
    </div>
  )
}
