'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ColumnMapping } from '@/types/import'

interface Props {
  headers: string[]
  rows: string[][]
  mapping: ColumnMapping
  onMappingChange: (m: ColumnMapping) => void
  onNext: () => void
  onBack: () => void
}

export function StepColumnMapper({
  headers,
  rows,
  mapping,
  onMappingChange,
  onNext,
  onBack,
}: Props) {
  const t = useTranslations('imports')
  const [mode, setMode] = useState<'signed' | 'separate'>('signed')
  const [balanceCol, setBalanceCol] = useState<string>('')

  const set = (key: keyof ColumnMapping, value: number | null) =>
    onMappingChange({ ...mapping, [key]: value })

  // A null column is a column the user has not chosen yet — not a column zero.
  const expenseColChosen = mapping.expenseCol !== null && mapping.expenseCol >= 0
  const incomeColChosen = mapping.incomeCol !== null && mapping.incomeCol >= 0

  const canProceed =
    mapping.dateCol >= 0 &&
    mapping.descCol >= 0 &&
    (mode === 'signed'
      ? expenseColChosen || incomeColChosen
      : expenseColChosen && incomeColChosen)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('steps.columnMapper.modeTitle')}</h3>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input
              type="radio"
              name="amountMode"
              checked={mode === 'signed'}
              onChange={() => setMode('signed')}
            />
            {t('steps.columnMapper.modeSigned')}
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input
              type="radio"
              name="amountMode"
              checked={mode === 'separate'}
              onChange={() => setMode('separate')}
            />
            {t('steps.columnMapper.modeSeparate')}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="date-select" className="text-xs">{t('steps.columnMapper.date')}</Label>
            <Select
              value={mapping.dateCol >= 0 ? String(mapping.dateCol) : ''}
              onValueChange={(v) => set('dateCol', Number(v))}
            >
              <SelectTrigger id="date-select" className="h-8 text-xs">
                <SelectValue placeholder={t('steps.columnMapper.selectColumn')} />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs">
                    {h || t('steps.columnMapper.colFallback', { index: i + 1 })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc-select" className="text-xs">{t('steps.columnMapper.description')}</Label>
            <Select
              value={mapping.descCol >= 0 ? String(mapping.descCol) : ''}
              onValueChange={(v) => set('descCol', Number(v))}
            >
              <SelectTrigger id="desc-select" className="h-8 text-xs">
                <SelectValue placeholder={t('steps.columnMapper.selectColumn')} />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs">
                    {h || t('steps.columnMapper.colFallback', { index: i + 1 })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'signed' ? (
            <div className="space-y-1.5">
              <Label htmlFor="amount-select" className="text-xs">{t('steps.columnMapper.amount')}</Label>
              <Select
                value={expenseColChosen ? String(mapping.expenseCol) : ''}
                onValueChange={(v) => {
                  set('expenseCol', Number(v))
                  set('incomeCol', Number(v))
                }}
              >
                <SelectTrigger id="amount-select" className="h-8 text-xs">
                  <SelectValue placeholder={t('steps.columnMapper.selectColumn')} />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((h, i) => (
                    <SelectItem key={i} value={String(i)} className="text-xs">
                      {h || t('steps.columnMapper.colFallback', { index: i + 1 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="debit-select" className="text-xs">{t('steps.columnMapper.debit')}</Label>
                <Select
                  value={expenseColChosen ? String(mapping.expenseCol) : ''}
                  onValueChange={(v) => set('expenseCol', Number(v))}
                >
                  <SelectTrigger id="debit-select" className="h-8 text-xs">
                    <SelectValue placeholder={t('steps.columnMapper.selectColumn')} />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {h || t('steps.columnMapper.colFallback', { index: i + 1 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="credit-select" className="text-xs">{t('steps.columnMapper.credit')}</Label>
                <Select
                  value={incomeColChosen ? String(mapping.incomeCol) : ''}
                  onValueChange={(v) => set('incomeCol', Number(v))}
                >
                  <SelectTrigger id="credit-select" className="h-8 text-xs">
                    <SelectValue placeholder={t('steps.columnMapper.selectColumn')} />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {h || t('steps.columnMapper.colFallback', { index: i + 1 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="balance-select" className="text-xs">{t('steps.columnMapper.balance')}</Label>
            <Select value={balanceCol} onValueChange={setBalanceCol}>
              <SelectTrigger id="balance-select" className="h-8 text-xs">
                <SelectValue placeholder={t('steps.columnMapper.noBalanceCheck')} />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs">
                    {h || t('steps.columnMapper.colFallback', { index: i + 1 })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {balanceCol !== '' && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {t('steps.columnMapper.balanceCheckHint')}
          </p>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>{t('wizard.back')}</Button>
        <Button onClick={onNext} disabled={!canProceed}>{t('wizard.next')}</Button>
      </div>
    </div>
  )
}
