'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ColumnMapping } from '@/types/import'

interface Props {
  headers: string[]
  rows: string[][]
  mapping: ColumnMapping
  dateFormat: string
  onMappingChange: (m: ColumnMapping) => void
  onDateFormatChange: (fmt: string) => void
  onNext: () => void
  onBack: () => void
}

interface FieldDef {
  key: keyof ColumnMapping
  label: string
  required: boolean
}

const FIELDS: FieldDef[] = [
  { key: 'dateCol', label: 'Date', required: true },
  { key: 'descCol', label: 'Description', required: true },
  { key: 'expenseCol', label: 'Expense amount', required: false },
  { key: 'incomeCol', label: 'Income amount', required: false },
]

export function StepColumnMapper({
  headers, rows, mapping, dateFormat,
  onMappingChange, onDateFormatChange, onNext, onBack,
}: Props) {
  const set = (key: keyof ColumnMapping, value: number | null) =>
    onMappingChange({ ...mapping, [key]: value })

  const canProceed =
    mapping.dateCol >= 0 &&
    mapping.descCol >= 0 &&
    (mapping.expenseCol !== null || mapping.incomeCol !== null)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Map your columns to database fields</h3>
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map(({ key, label, required }) => {
            const val = mapping[key]
            const strVal = val === null ? 'ignore' : String(val)
            return (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">
                  {label}
                  {required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                <Select
                  value={strVal}
                  onValueChange={(v) => set(key, v === 'ignore' ? null : Number(v))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {!required && (
                      <SelectItem value="ignore" className="text-xs text-muted-foreground">
                        — ignore —
                      </SelectItem>
                    )}
                    {headers.map((h, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {h || `Col ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>

        <div className="mt-4 space-y-1.5">
          <Label className="text-xs">Date format</Label>
          <Input
            value={dateFormat}
            onChange={(e) => onDateFormatChange(e.target.value)}
            placeholder="MM/dd/yy"
            className="h-8 text-xs w-40"
          />
          <p className="text-xs text-muted-foreground">Examples: MM/dd/yy · dd/MM/yyyy · yyyy-MM-dd</p>
        </div>
      </div>

      {rows.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Preview — first {rows.length} rows</p>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  {headers.map((h, i) => (
                    <TableHead key={i} className="text-xs py-2">{h || `Col ${i + 1}`}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, ri) => (
                  <TableRow key={ri}>
                    {row.map((cell, ci) => (
                      <TableCell key={ci} className="text-xs py-1.5">{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!canProceed}>Next</Button>
      </div>
    </div>
  )
}
