'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useBanks } from '@/lib/hooks/useBanks'
import { StatementPreviewResponse, CsvPreviewResponse, FileType, TransactionMappingRequest } from '@/types/upload'
import { uploadApi } from '@/lib/api/upload'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CategorySelector } from './CategorySelector'

interface ImportPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previewData: StatementPreviewResponse | null
  csvPreviewData: CsvPreviewResponse | null
  fileType: FileType
  onSuccess: () => void
}

export function ImportPreviewDialog({
  open,
  onOpenChange,
  previewData,
  csvPreviewData,
  fileType,
  onSuccess
}: ImportPreviewDialogProps) {
  const { banks } = useBanks()
  
  const [selectedBankId, setSelectedBankId] = useState<number | undefined>()
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>()
  
  // CSV Column Mapping State
  const [dateCol, setDateCol] = useState<string>('0')
  const [descCol, setDescCol] = useState<string>('1')
  const [debitCol, setDebitCol] = useState<string>('2')
  const [creditCol, setCreditCol] = useState<string>('3')
  
  // Mappings for PDF/Pre-parsed transactions
  const [mappings, setMappings] = useState<TransactionMappingRequest[]>([])

  const [isConfirming, setIsConfirming] = useState(false)

  // Initialize mappings when previewData changes
  useEffect(() => {
    if (previewData) {
      setMappings(previewData.transactions.map(tx => ({
        ...tx,
        categoryId: tx.type === 'INCOME' ? 1105 : 1104 // Default to Unassigned
      })))
    } else {
      setMappings([])
    }
  }, [previewData])

  // Filter accounts by selected bank
  const availableAccounts = useMemo(() => {
    if (!selectedBankId) return []
    return banks.find(b => b.id === selectedBankId)?.accounts || []
  }, [banks, selectedBankId])

  // Reset account when bank changes
  useEffect(() => {
    setSelectedAccountId(undefined)
  }, [selectedBankId])

  const handleMappingChange = (index: number, categoryId: number) => {
    const newMappings = [...mappings]
    newMappings[index].categoryId = categoryId
    setMappings(newMappings)
  }

  const handleConfirm = async () => {
    if (!selectedAccountId) {
      toast.error('Please select a destination account')
      return
    }

    setIsConfirming(true)
    try {
      if (fileType === 'CSV' && csvPreviewData) {
        await uploadApi.confirmCsv({
          tempKey: csvPreviewData.tempKey,
          accountId: selectedAccountId,
          fileType: 'CSV',
          dateCol: Number(dateCol),
          descCol: Number(descCol),
          debitCol: Number(debitCol),
          creditCol: Number(creditCol),
          dateFormat: 'MM/dd/yy'
        })
      } else if (previewData) {
        await uploadApi.confirmPdf(previewData.tempKey, selectedAccountId, fileType, mappings)
      }
      
      toast.success('Import completed successfully')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Confirm error:', error)
      toast.error('Failed to confirm import')
    } finally {
      setIsConfirming(false)
    }
  }

  const isCsv = fileType === 'CSV'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isCsv ? 'CSV Column Mapping' : 'Preview & Map Transactions'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4 space-y-6">
          {/* Account Selection Section */}
          <div className="grid grid-cols-2 gap-4 border-b pb-6">
            <div className="space-y-2">
              <Label>Select Bank</Label>
              <Select
                value={selectedBankId?.toString()}
                onValueChange={(v) => setSelectedBankId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose bank..." />
                </SelectTrigger>
                <SelectContent>
                  {banks.map(bank => (
                    <SelectItem key={bank.id} value={String(bank.id)}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Account</Label>
              <Select
                value={selectedAccountId?.toString()}
                onValueChange={(v) => setSelectedAccountId(Number(v))}
                disabled={!selectedBankId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedBankId ? "Choose account..." : "Select a bank first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map(acc => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name} ({acc.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isCsv && csvPreviewData && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Map CSV Columns to Database Fields</h3>
              <div className="grid grid-cols-4 gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="space-y-1.5">
                  <Label className="text-xs">Date Column</Label>
                  <Select value={dateCol} onValueChange={setDateCol}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {csvPreviewData.headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)} className="text-xs">{h || `Col ${i+1}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description Column</Label>
                  <Select value={descCol} onValueChange={setDescCol}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {csvPreviewData.headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)} className="text-xs">{h || `Col ${i+1}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Debit Column</Label>
                  <Select value={debitCol} onValueChange={setDebitCol}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {csvPreviewData.headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)} className="text-xs">{h || `Col ${i+1}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Credit Column</Label>
                  <Select value={creditCol} onValueChange={setCreditCol}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {csvPreviewData.headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)} className="text-xs">{h || `Col ${i+1}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      {csvPreviewData.headers.map((h, i) => (
                        <TableHead key={i} className="text-xs">{h || `Col ${i+1}`}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreviewData.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <TableCell key={colIndex} className="text-xs py-2">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Showing first 5 rows for preview purposes.</p>
            </div>
          )}

          {!isCsv && previewData && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[300px]">Category Mapping</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((tx, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(tx.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={tx.description}>
                        {tx.description}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.currency} {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <CategorySelector 
                          value={tx.categoryId} 
                          onChange={(catId) => handleMappingChange(index, catId)} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isConfirming || !selectedAccountId}>
            {isConfirming ? 'Importing...' : 'Confirm Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
