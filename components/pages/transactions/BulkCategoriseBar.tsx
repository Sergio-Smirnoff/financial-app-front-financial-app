'use client'

import React, { useState } from 'react'
import { BulkActionBar } from '@/components/ui-kit/table/BulkActionBar'

export interface BulkCategoriseBarProps {
  count: number
  categories: { id: number; name: string }[]
  onCategorise: (categoryId: number) => Promise<void>
  onClear: () => void
}

export function BulkCategoriseBar({ count, categories, onCategorise, onClear }: BulkCategoriseBarProps) {
  const [open, setOpen] = useState(false)

  if (count <= 0) return null

  return (
    <div className="relative">
      <BulkActionBar
        count={count}
        actions={[
          {
            label: 'Categorizar',
            onSelect: () => setOpen((prev) => !prev),
          },
        ]}
        onClear={onClear}
      />

      {open && (
        <div role="listbox" className="absolute bottom-12 left-0 z-30 min-w-[180px] rounded-md border bg-popover p-1 shadow-lg">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="option"
              aria-selected={false}
              type="button"
              onClick={async () => {
                setOpen(false)
                await onCategorise(cat.id)
              }}
              className="w-full text-left rounded-sm px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
