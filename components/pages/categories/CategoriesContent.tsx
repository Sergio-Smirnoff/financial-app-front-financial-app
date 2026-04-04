'use client'

import { useState } from 'react'
import { useCategories, useCreateCategory, useCreateSubcategory, useDeleteCategory, useDeleteSubcategory } from '@/lib/hooks/useCategories'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types/finances'

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

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load categories." />

  return (
    <div className="space-y-4 max-w-xl">
      {/* Create category */}
      <div className="flex gap-2">
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

      {/* Category tree */}
      <div className="space-y-2">
        {categories?.map((cat) => {
          const subcategories = cat.subcategories ?? []
          return (
            <Card key={cat.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 text-sm font-medium flex-1 text-left"
                    onClick={() => toggleExpand(cat.id)}
                  >
                    {expanded.has(cat.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    {cat.name}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {subcategories.length}
                    </Badge>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDeleteCategory(cat)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {expanded.has(cat.id) && (
                  <div className="mt-2 ml-5 space-y-1">
                    {subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 py-0.5">
                        <span className="flex-1 text-sm text-muted-foreground">{sub.name}</span>
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

                    {/* Add subcategory inline */}
                    <div className="flex gap-2 pt-1">
                      <Input
                        className="h-7 text-xs"
                        placeholder="New subcategory…"
                        value={subInput[cat.id] ?? ''}
                        onChange={(e) => setSubInput((s) => ({ ...s, [cat.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateSubcategory(cat.id)}
                      />
                      <Button size="sm" className="h-7 px-2" onClick={() => handleCreateSubcategory(cat.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {categories?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No categories yet. Create one above.</p>
        )}
      </div>

      <ConfirmDialog />
    </div>
  )
}
