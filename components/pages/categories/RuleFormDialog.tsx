'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface RuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories?: { id: number; name: string }[]
  onCommit?: (pattern: string, categoryId: number) => Promise<void>
}

export function RuleFormDialog({ open, onOpenChange, categories = [], onCommit }: RuleFormDialogProps) {
  const t = useTranslations('categories')
  const [pattern, setPattern] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [previewedCount, setPreviewedCount] = useState<number | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handlePreview = async () => {
    if (!pattern.trim()) return
    setPreviewing(true)
    // Simulate dry-run preview call
    setTimeout(() => {
      setPreviewedCount(12)
      setPreviewing(false)
    }, 200)
  }

  const handleCreate = async () => {
    if (previewedCount === null || !pattern.trim() || !categoryId) return
    setSubmitting(true)
    try {
      await onCommit?.(pattern, parseInt(categoryId, 10))
      onOpenChange(false)
      setPattern('')
      setCategoryId('')
      setPreviewedCount(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="rule-dialog-desc">
        <DialogHeader>
          <DialogTitle>{t('rules.newTitle')}</DialogTitle>
          <DialogDescription id="rule-dialog-desc">
            {t('rules.newDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label htmlFor="pattern-input" className="text-sm font-medium">{t('rules.matches')}</label>
            <Input
              id="pattern-input"
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value)
                setPreviewedCount(null)
              }}
              placeholder={t('rules.patternPlaceholder')}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category-select" className="text-sm font-medium">{t('rules.assigned')}</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder={t('rules.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {previewedCount !== null && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t('rules.matchCount', { count: previewedCount })}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={previewing || !pattern.trim()}
          >
            {previewing ? t('rules.loading') : t('rules.preview')}
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={previewedCount === null || !categoryId || submitting}
          >
            {submitting ? t('rules.creating') : t('rules.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
