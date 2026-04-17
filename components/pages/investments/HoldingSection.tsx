'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { HoldingTable } from './HoldingTable'
import type { HoldingWithPrice } from '@/types/investments'

interface HoldingSectionProps {
  label: string
  holdings: HoldingWithPrice[]
  onEdit: (holding: HoldingWithPrice) => void
  onDelete: (holding: HoldingWithPrice) => void
  onViewDetail: (holding: HoldingWithPrice) => void
}

export function HoldingSection({ label, holdings, onEdit, onDelete, onViewDetail }: HoldingSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {label} ({holdings.length})
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(!open)}>
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0">
          <HoldingTable holdings={holdings} onEdit={onEdit} onDelete={onDelete} onViewDetail={onViewDetail} />
        </CardContent>
      )}
    </Card>
  )
}
