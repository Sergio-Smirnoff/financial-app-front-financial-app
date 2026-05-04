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
import { Badge } from '@/components/ui/badge'
import { ColumnMapping } from '@/types/import'
import { cn } from '@/lib/utils'

interface Props {
  headers: string[]
  rows: string[][]
  mapping: ColumnMapping
  onMappingChange: (m: ColumnMapping) => void
  onNext: () => void
  onBack: () => void
}

interface FieldDef {
  key: keyof ColumnMapping
  label: string
  required: boolean
  color: string
}

const FIELDS: FieldDef[] = [
  { key: 'dateCol', label: 'Date', required: true, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'descCol', label: 'Description', required: true, color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'expenseCol', label: 'Expense', required: false, color: 'bg-red-100 text-red-700 border-red-200' },
  { key: 'incomeCol', label: 'Income', required: false, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
]

export function StepColumnMapper({
  headers, rows, mapping,
  onMappingChange, onNext, onBack,
}: Props) {
  const set = (key: keyof ColumnMapping, value: number | null) =>
    onMappingChange({ ...mapping, [key]: value })

  const canProceed =
    mapping.dateCol >= 0 &&
    mapping.descCol >= 0 &&
    (mapping.expenseCol !== null || mapping.incomeCol !== null)

  const getMappedFields = (colIdx: number) => {
    return FIELDS.filter(f => mapping[f.key] === colIdx)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-4">Map your columns to database fields</h3>
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map(({ key, label, required }) => {
            const val = mapping[key]
            const strVal = val === null || val === undefined || val >= headers.length ? 'ignore' : String(val)
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
                    <SelectValue placeholder="Select column..." />
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
      </div>

      {rows.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Preview — first {rows.length} rows</p>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  {headers.map((h, i) => {
                    const mappedFields = getMappedFields(i)
                    return (
                      <TableHead key={i} className="text-xs py-2 h-auto align-top">
                        <div className="space-y-1.5">
                          <div className="font-medium text-foreground">{h || `Col ${i + 1}`}</div>
                          <div className="flex flex-wrap gap-1">
                            {mappedFields.map(f => (
                              <Badge 
                                key={f.key} 
                                variant="outline" 
                                className={cn("text-[10px] px-1 py-0 h-4 font-normal uppercase", f.color)}
                              >
                                {f.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableHead>
                    )
                  })}
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
