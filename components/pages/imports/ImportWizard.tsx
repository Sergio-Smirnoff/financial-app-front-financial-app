'use client'

import { useState } from 'react'
import { ImportFileType, ParsedRow, CurrencyCounts, ColumnMapping } from '@/types/import'
import { StepFileSelect } from './steps/StepFileSelect'
import { StepColumnMapper } from './steps/StepColumnMapper'
import { StepPdfPreview } from './steps/StepPdfPreview'
import { StepAccountLink } from './steps/StepAccountLink'
import { StepConfirm } from './steps/StepConfirm'
import { ImportDuplicatesDialog } from './ImportDuplicatesDialog'
import { useConfirmImport, usePreviewFile } from '@/lib/hooks/useImport'
import { useBanks } from '@/lib/hooks/useBanks'
import { useCards } from '@/lib/hooks/useCards'
import { toast } from 'sonner'

type WizardStep = 'file_select' | 'preview' | 'account_link' | 'confirm'

interface WizardState {
  step: WizardStep
  fileType: ImportFileType | null
  file: File | null
  tempKey: string | null
  fileHash: string | null
  // CSV only
  csvHeaders: string[]
  csvRows: string[][]
  columnMapping: ColumnMapping
  dateFormat: string
  // PDF only
  parsedPreview: ParsedRow[]
  totalCount: number
  currencyCounts: CurrencyCounts
  // account link
  bankId: number | null
  accountId: number | null
  cardId: number | null
  usdAccountId: number | null
}

export function ImportWizard() {
  const { banks } = useBanks()
  const [state, setState] = useState<WizardState>({
    step: 'file_select',
    fileType: null,
    file: null,
    tempKey: null,
    fileHash: null,
    csvHeaders: [],
    csvRows: [],
    columnMapping: { dateCol: 0, descCol: 1, expenseCol: 2, incomeCol: 3 },
    dateFormat: 'yyyy-MM-dd',
    parsedPreview: [],
    totalCount: 0,
    currencyCounts: { ARS: 0, USD: 0, skipped: 0 },
    bankId: null,
    accountId: null,
    cardId: null,
    usdAccountId: null,
  })

  const { data: cards = [] } = useCards(state.bankId ?? undefined)

  const selectedBank = banks.find(b => b.id === state.bankId)
  const selectedAccount = selectedBank?.accounts.find(a => a.id === state.accountId)
  const selectedCard = (cards as any[]).find(c => c.id === state.cardId)
  const selectedUsdAccount = selectedBank?.accounts.find(a => a.id === state.usdAccountId)

  const [duplicates, setDuplicates] = useState<any[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)

  const previewMutation = usePreviewFile()
  const confirmMutation = useConfirmImport()

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const handleFileSelected = async (file: File, type: ImportFileType) => {
    updateState({ file, fileType: type })
    try {
      const res = await previewMutation.mutateAsync({ file, type })
      updateState({
        tempKey: res.tempKey,
        fileHash: res.fileHash,
        csvHeaders: res.headers || [],
        csvRows: res.rows || [],
        parsedPreview: res.preview || [],
        totalCount: res.totalCount || 0,
        currencyCounts: res.currencyCounts || { ARS: 0, USD: 0, skipped: 0 },
        step: 'preview'
      })
    } catch (error) {
      toast.error('Failed to parse file')
    }
  }

  const handleNext = () => {
    if (state.step === 'preview') {
      updateState({ step: 'account_link' })
    } else if (state.step === 'account_link') {
      updateState({ step: 'confirm' })
    }
  }

  const handleBack = () => {
    if (state.step === 'preview') {
      updateState({ step: 'file_select' })
    } else if (state.step === 'account_link') {
      updateState({ step: 'preview' })
    } else if (state.step === 'confirm') {
      updateState({ step: 'account_link' })
    }
  }

  const reset = () => {
    setState({
      step: 'file_select',
      fileType: null,
      file: null,
      tempKey: null,
      fileHash: null,
      csvHeaders: [],
      csvRows: [],
      columnMapping: { dateCol: 0, descCol: 1, expenseCol: 2, incomeCol: 3 },
      dateFormat: 'yyyy-MM-dd',
      parsedPreview: [],
      totalCount: 0,
      currencyCounts: { ARS: 0, USD: 0, skipped: 0 },
      bankId: null,
      accountId: null,
      cardId: null,
      usdAccountId: null,
    })
    setDuplicates([])
    setSessionId(null)
  }

  const handleConfirm = async () => {
    try {
      const res = await confirmMutation.mutateAsync({
        tempKey: state.tempKey!,
        type: state.fileType!,
        columnMapping: state.fileType === 'CSV' ? {
          dateCol: state.columnMapping.dateCol,
          descCol: state.columnMapping.descCol,
          expenseCol: state.columnMapping.expenseCol ?? undefined,
          incomeCol: state.columnMapping.incomeCol ?? undefined,
        } : undefined,
        dateFormat: state.fileType === 'CSV' ? state.dateFormat : undefined,
        accountId: state.accountId || undefined,
        cardId: state.cardId || undefined,
        arsAccountId: state.accountId || undefined,
        usdAccountId: state.usdAccountId || undefined,
      })

      if (res.duplicates && res.duplicates.length > 0) {
        setDuplicates(res.duplicates)
        setSessionId(res.sessionId || null)
      } else {
        toast.success(`Imported ${res.imported} transactions`)
        reset()
      }
    } catch (error) {
      toast.error('Import failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Import Transactions</h2>
        <div className="flex gap-1">
          {['file_select', 'preview', 'account_link', 'confirm'].map((s, i) => (
            <div 
              key={s} 
              className={`h-1.5 w-8 rounded-full ${
                ['file_select', 'preview', 'account_link', 'confirm'].indexOf(state.step) >= i 
                  ? 'bg-primary' : 'bg-muted'
              }`} 
            />
          ))}
        </div>
      </div>

      {state.step === 'file_select' && (
        <StepFileSelect 
          isLoading={previewMutation.isPending} 
          onFileSelected={handleFileSelected} 
        />
      )}
      
      {state.step === 'preview' && state.fileType === 'CSV' && (
        <StepColumnMapper 
          headers={state.csvHeaders}
          rows={state.csvRows}
          mapping={state.columnMapping}
          onMappingChange={(m) => updateState({ columnMapping: m })}
          onNext={handleNext} 
          onBack={handleBack} 
        />
      )}

      {state.step === 'preview' && state.fileType !== 'CSV' && (
        <StepPdfPreview 
          preview={state.parsedPreview}
          totalCount={state.totalCount}
          currencyCounts={state.currencyCounts}
          fileType={state.fileType!}
          onNext={handleNext} 
          onBack={handleBack} 
        />
      )}

      {state.step === 'account_link' && (
        <StepAccountLink 
          fileType={state.fileType!}
          currencyCounts={state.currencyCounts}
          bankId={state.bankId}
          accountId={state.accountId}
          cardId={state.cardId}
          usdAccountId={state.usdAccountId}
          onBankChange={(id) => updateState({ bankId: id })}
          onAccountChange={(id) => updateState({ accountId: id })}
          onCardChange={(id) => updateState({ cardId: id })}
          onUsdAccountChange={(id) => updateState({ usdAccountId: id })}
          onNext={handleNext} 
          onBack={handleBack} 
        />
      )}

      {state.step === 'confirm' && (
        <StepConfirm 
          file={state.file!}
          fileType={state.fileType!}
          bank={selectedBank}
          account={selectedAccount as any}
          card={selectedCard as any}
          usdAccount={selectedUsdAccount as any}
          totalCount={state.totalCount}
          currencyCounts={state.currencyCounts}
          isLoading={confirmMutation.isPending}
          onConfirm={handleConfirm} 
          onBack={handleBack}
        />
      )}

      {duplicates.length > 0 && (
        <ImportDuplicatesDialog 
          open={duplicates.length > 0}
          onOpenChange={(open) => !open && setDuplicates([])}
          duplicates={duplicates} 
          sessionId={sessionId!} 
          onResolved={() => { toast.success('Import finished'); reset(); }} 
        />
      )}
    </div>
  )
}
