'use client'

import React, { useState } from 'react'
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
  const [mode, setMode] = useState<'signed' | 'separate'>('signed')
  const [balanceCol, setBalanceCol] = useState<string>('')

  const set = (key: keyof ColumnMapping, value: number | null) =>
    onMappingChange({ ...mapping, [key]: value })

  const canProceed =
    mapping.dateCol >= 0 &&
    mapping.descCol >= 0 &&
    (mode === 'signed'
      ? mapping.expenseCol >= 0 || mapping.incomeCol >= 0
      : mapping.expenseCol >= 0 && mapping.incomeCol >= 0)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Modo de importe</h3>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input
              type="radio"
              name="amountMode"
              checked={mode === 'signed'}
              onChange={() => setMode('signed')}
            />
            Una columna con signo
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input
              type="radio"
              name="amountMode"
              checked={mode === 'separate'}
              onChange={() => setMode('separate')}
            />
            Columnas separadas
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="date-select" className="text-xs">Fecha *</Label>
            <Select
              value={mapping.dateCol >= 0 ? String(mapping.dateCol) : ''}
              onValueChange={(v) => set('dateCol', Number(v))}
            >
              <SelectTrigger id="date-select" className="h-8 text-xs">
                <SelectValue placeholder="Seleccionar columna..." />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs">
                    {h || `Col ${i + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc-select" className="text-xs">Descripción *</Label>
            <Select
              value={mapping.descCol >= 0 ? String(mapping.descCol) : ''}
              onValueChange={(v) => set('descCol', Number(v))}
            >
              <SelectTrigger id="desc-select" className="h-8 text-xs">
                <SelectValue placeholder="Seleccionar columna..." />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs">
                    {h || `Col ${i + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'signed' ? (
            <div className="space-y-1.5">
              <Label htmlFor="amount-select" className="text-xs">Importe *</Label>
              <Select
                value={mapping.expenseCol >= 0 ? String(mapping.expenseCol) : ''}
                onValueChange={(v) => {
                  set('expenseCol', Number(v))
                  set('incomeCol', Number(v))
                }}
              >
                <SelectTrigger id="amount-select" className="h-8 text-xs">
                  <SelectValue placeholder="Seleccionar columna..." />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((h, i) => (
                    <SelectItem key={i} value={String(i)} className="text-xs">
                      {h || `Col ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="debit-select" className="text-xs">Débito *</Label>
                <Select
                  value={mapping.expenseCol >= 0 ? String(mapping.expenseCol) : ''}
                  onValueChange={(v) => set('expenseCol', Number(v))}
                >
                  <SelectTrigger id="debit-select" className="h-8 text-xs">
                    <SelectValue placeholder="Seleccionar columna..." />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {h || `Col ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="credit-select" className="text-xs">Crédito *</Label>
                <Select
                  value={mapping.incomeCol >= 0 ? String(mapping.incomeCol) : ''}
                  onValueChange={(v) => set('incomeCol', Number(v))}
                >
                  <SelectTrigger id="credit-select" className="h-8 text-xs">
                    <SelectValue placeholder="Seleccionar columna..." />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {h || `Col ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="balance-select" className="text-xs">Saldo (opcional)</Label>
            <Select value={balanceCol} onValueChange={setBalanceCol}>
              <SelectTrigger id="balance-select" className="h-8 text-xs">
                <SelectValue placeholder="Sin verificar" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs">
                    {h || `Col ${i + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {balanceCol !== '' && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Verificaremos que el saldo coincida
          </p>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Atrás</Button>
        <Button onClick={onNext} disabled={!canProceed}>Continuar</Button>
      </div>
    </div>
  )
}
