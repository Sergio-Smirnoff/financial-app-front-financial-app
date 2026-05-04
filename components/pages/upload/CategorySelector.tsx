'use client'

import { useCategories } from '@/lib/hooks/useCategories'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMemo } from 'react'

interface CategorySelectorProps {
  value?: number
  onChange: (id: number) => void
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const { data: categories, isLoading } = useCategories()

  // Find the current category that contains the selected subcategory (value)
  const selectedParent = useMemo(() => {
    if (!categories || !value) return null
    return categories.find(cat => 
      cat.subcategories?.some(sub => sub.id === value)
    )
  }, [categories, value])

  // Get subcategories for the selected parent
  const subcategories = useMemo(() => {
    return selectedParent?.subcategories || []
  }, [selectedParent])

  const handleParentChange = (parentIdStr: string) => {
    const parentId = parseInt(parentIdStr)
    const parent = categories?.find(c => c.id === parentId)
    if (parent && parent.subcategories && parent.subcategories.length > 0) {
      // Auto-select first subcategory or look for "Unassigned"
      const unassigned = parent.subcategories.find(s => s.name === 'Unassigned')
      onChange(unassigned ? unassigned.id : parent.subcategories[0].id)
    }
  }

  if (isLoading) return <div className="h-9 w-full animate-pulse rounded-md bg-muted" />

  return (
    <div className="flex gap-2">
      <Select 
        value={selectedParent?.id?.toString()} 
        onValueChange={handleParentChange}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map(cat => (
            <SelectItem key={cat.id} value={cat.id.toString()} className="text-xs">
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={value?.toString()} 
        onValueChange={(v) => onChange(parseInt(v))}
        disabled={!selectedParent}
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Subcategory" />
        </SelectTrigger>
        <SelectContent>
          {subcategories.map(sub => (
            <SelectItem key={sub.id} value={sub.id.toString()} className="text-xs">
              {sub.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
