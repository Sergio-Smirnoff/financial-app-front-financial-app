'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories, useCreateCategory, useCreateSubcategory } from '@/lib/hooks/useCategories'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { CategoryType } from '@/types/finances'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialParentId?: number | null
}

export function CreateCategoryDialog({ open, onOpenChange, initialParentId }: Props) {
  const t = useTranslations('categories')
  const tc = useTranslations('common')
  const { data: categories } = useCategories()
  const createCategory = useCreateCategory()
  const createSubcategory = useCreateSubcategory()

  const [mode, setMode] = useState<'CATEGORY' | 'SUBCATEGORY'>(initialParentId ? 'SUBCATEGORY' : 'CATEGORY')
  const [parentId, setParentId] = useState<number | undefined>(initialParentId ?? undefined)
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('BOTH')

  useEffect(() => {
    if (!open) return
    if (initialParentId) {
      setMode('SUBCATEGORY')
      setParentId(initialParentId)
    } else {
      setMode('CATEGORY')
      setParentId(undefined)
    }
    setName('')
    setType('BOTH')
  }, [open, initialParentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error(t('rules.patternPlaceholder') || 'El nombre es obligatorio')
      return
    }

    if (mode === 'SUBCATEGORY') {
      if (!parentId) {
        toast.error(t('rules.selectCategory'))
        return
      }
      createSubcategory.mutate(
        { parentId, data: { name: trimmed, type } },
        {
          onSuccess: () => {
            toast.success(tc('save') || 'Subcategoría creada')
            onOpenChange(false)
          },
          onError: (err: any) => {
            toast.error(err.message || 'Error al crear subcategoría')
          },
        }
      )
    } else {
      createCategory.mutate(
        { name: trimmed, type },
        {
          onSuccess: () => {
            toast.success(tc('save') || 'Categoría creada')
            onOpenChange(false)
          },
          onError: (err: any) => {
            toast.error(err.message || 'Error al crear categoría')
          },
        }
      )
    }
  }

  const isPending = createCategory.isPending || createSubcategory.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle>{mode === 'SUBCATEGORY' ? t('newSubcategory') : t('newCategory')}</DialogTitle>
          <DialogDescription>
            {mode === 'SUBCATEGORY'
              ? 'Agregá una subcategoría para clasificar mejor tus movimientos.'
              : 'Creá una nueva categoría principal para organizar tus presupuestos.'}
          </DialogDescription>
        </DialogHeader>

        {/* Mode switcher if not locked to a specific parent */}
        {!initialParentId && (
          <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('CATEGORY')}
              className={`py-1.5 rounded-lg transition-colors ${
                mode === 'CATEGORY' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('newCategory')}
            </button>
            <button
              type="button"
              onClick={() => setMode('SUBCATEGORY')}
              className={`py-1.5 rounded-lg transition-colors ${
                mode === 'SUBCATEGORY' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('newSubcategory')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-sm">
          {mode === 'SUBCATEGORY' && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t('rules.assigned')}</Label>
              <Select
                value={parentId?.toString() ?? ''}
                onValueChange={(v) => setParentId(v ? Number(v) : undefined)}
                disabled={!!initialParentId}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder={t('rules.selectCategory')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[260px]">
                  {(categories ?? []).map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-muted-foreground">{tc('concept') || 'Nombre'}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === 'SUBCATEGORY' ? 'Ej. Delivery, Combustible' : 'Ej. Educación, Mascotas'}
              className="bg-background border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">{tc('category') || 'Tipo'}</Label>
            <Select value={type} onValueChange={(v) => setType(v as CategoryType)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="EXPENSE">{t('tabs.budget') || 'Gasto'}</SelectItem>
                <SelectItem value="INCOME">{t('tabs.income') || 'Ingreso'}</SelectItem>
                <SelectItem value="BOTH">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              {tc('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? tc('saving') : tc('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
