'use client'

import { useState } from 'react'
import { useCategories, useCreateCategory, useCreateSubcategory, useDeleteCategory, useDeleteSubcategory } from '@/lib/hooks/useCategories'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types/finances'
import { getCategoryIcon } from '@/lib/utils/category-utils'

export function CategoriesContent() {
  const { openConfirmDelete } = useUiStore()
  const { data: categories, isLoading, isError } = useCategories()
  const createCategory = useCreateCategory()
  const createSubcategory = useCreateSubcategory()
  const deleteCategory = useDeleteCategory()
  const deleteSubcategory = useDeleteSubcategory()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [subInput, setSubInput] = useState<Record<number, string>>({})

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return
    createCategory.mutate(
      { name: newCategoryName.trim(), type: 'BOTH' },
      {
        onSuccess: () => { toast.success('Category created'); setNewCategoryName('') },
        onError: () => toast.error('Failed to create category'),
      },
    )
  }

  const handleCreateSubcategory = (parentId: number) => {
    const name = subInput[parentId]?.trim()
    if (!name) return
    createSubcategory.mutate(
      { parentId, data: { name, type: 'BOTH' } },
      {
        onSuccess: () => { toast.success('Subcategory created'); setSubInput((s) => ({ ...s, [parentId]: '' })) },
        onError: () => toast.error('Failed to create subcategory'),
      },
    )
  }

  const handleDeleteCategory = (cat: Category) => {
    openConfirmDelete({
      title: 'Delete category',
      description: `Delete "${cat.name}" and all its subcategories?`,
      onConfirm: () => {
        deleteCategory.mutate(cat.id, {
          onSuccess: () => toast.success('Category deleted'),
          onError: () => toast.error('Failed to delete category'),
        })
      },
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load categories." />

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 w-full">
        <Input
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
        />
        <Button size="sm" onClick={handleCreateCategory} disabled={createCategory.isPending}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      <div className="flex-1 overflow-auto mt-4">
        <div className="space-y-2 w-full">
          {categories?.map((cat) => {
            const subcategories = cat.subcategories ?? []
            const isExpanded = expanded.has(cat.id)

            return (
              <div key={cat.id} className="border rounded-lg overflow-hidden bg-card">
                <div
                  className="flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => toggleExpand(cat.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-lg">{getCategoryIcon(cat.name)}</span>
                  <span className="font-medium">{cat.name}</span>
                  <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center font-medium">
                    {subcategories.length}
                  </div>
                  <span className="text-sm text-muted-foreground">subcategorías</span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(cat)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="border-t p-3 bg-muted/30 space-y-1">
                    {subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center py-1 px-2 rounded hover:bg-accent/50">
                        <span className="text-sm text-muted-foreground flex-1">{sub.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() =>
                            openConfirmDelete({
                              title: 'Delete subcategory',
                              description: `Delete "${sub.name}"?`,
                              onConfirm: () =>
                                deleteSubcategory.mutate(sub.id, {
                                  onSuccess: () => toast.success('Subcategory deleted'),
                                  onError: () => toast.error('Failed to delete subcategory'),
                                }),
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <Input
                        className="h-8 text-sm"
                        placeholder="New subcategory…"
                        value={subInput[cat.id] ?? ''}
                        onChange={(e) => setSubInput((s) => ({ ...s, [cat.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter') handleCreateSubcategory(cat.id)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button size="sm" className="h-8" onClick={(e) => {
                        e.stopPropagation()
                        handleCreateSubcategory(cat.id)
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {categories?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No categories yet. Create one above.</p>
          )}
        </div>
      </div>

      <ConfirmDialog />
    </div>
  )
}
