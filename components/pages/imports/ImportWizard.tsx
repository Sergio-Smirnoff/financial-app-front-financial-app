'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { StepFileSelect } from './steps/StepFileSelect'
import { StepColumnMapper } from './steps/StepColumnMapper'
import { StepPdfPreview } from './steps/StepPdfPreview'
import { StepAccountLink } from './steps/StepAccountLink'
import { StepConfirm } from './steps/StepConfirm'
import { ImportDuplicatesDialog } from './ImportDuplicatesDialog'
import { usePreviewImport, useConfirmImport } from '@/lib/hooks/useImport'
import { useBanks } from '@/lib/hooks/useBanks'
import { useCards } from '@/lib/hooks/useCards'
import {
  ImportFileType, ColumnMapping, ParsedRow, CurrencyCounts, DuplicateItem, ConfirmRequest,
} from '@/types/import'

type WizardStep = 'file_select' | 'preview' | 'account_link' | 'confirm'

const STEPS: WizardStep[] = ['file_select', 'preview', 'account_link', 'confirm']
const STEP_LABELS: Record<WizardStep, string> = {
  file_select: 'File',
  preview: 'Preview',
  account_link: 'Account',
  confirm: 'Confirm',
}

const DEFAULT_MAPPING: ColumnMapping = { dateCol: -1, descCol: -1, expenseCol: null, incomeCol: null }

function autoDetectMapping(headers: string[]): { mapping: ColumnMapping; dateFormat: string } {
  const lower = headers.map(h => h.toLowerCase())
  const find = (...keywords: string[]) => {
    const i = lower.findIndex(h => keywords.some(k => h.includes(k)))
    return i >= 0 ? i : -1
  }
  const expIdx = find('debit', 'débito', 'debito', 'expense', 'gasto', 'egreso', 'salida')
  const incIdx = find('credit', 'crédito', 'credito', 'income', 'ingreso', 'entrada', 'haber')
  return {
    mapping: {
      dateCol: find('date', 'fecha', 'dia', 'day'),
      descCol: find('desc', 'concept', 'concepto', 'detail', 'detalle', 'memo', 'narr'),
      expenseCol: expIdx >= 0 ? expIdx : null,
      incomeCol: incIdx >= 0 ? incIdx : null,
    },
    dateFormat: 'MM/dd/yy',
  }
}

export function ImportWizard() {
  const { banks } = useBanks()
  const previewMutation = usePreviewImport()
  const confirmMutation = useConfirmImport()

  const [step, setStep] = useState<WizardStep>('file_select')
  const [fileType, setFileType] = useState<ImportFileType | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [tempKey, setTempKey] = useState<string | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(DEFAULT_MAPPING)
  const [dateFormat, setDateFormat] = useState('MM/dd/yy')
  const [parsedPreview, setParsedPreview] = useState<ParsedRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currencyCounts, setCurrencyCounts] = useState<CurrencyCounts>({ ARS: 0, USD: 0, skipped: 0 })
  const [bankId, setBankId] = useState<number | null>(null)
  const [accountId, setAccountId] = useState<number | null>(null)
  const [cardId, setCardId] = useState<number | null>(null)
  const [usdAccountId, setUsdAccountId] = useState<number | null>(null)
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [dupeOpen, setDupeOpen] = useState(false)

  const { data: cards = [] } = useCards(bankId ?? undefined)
  const selectedBank = banks.find(b => b.id === bankId)
  const selectedAccount = selectedBank?.accounts.find(a => a.id === accountId)
  const selectedUsdAccount = selectedBank?.accounts.find(a => a.id === usdAccountId)
  const selectedCard = cards.find((c: any) => c.id === cardId)

  function reset() {
    setStep('file_select')
    setFileType(null)
    setFile(null)
    setTempKey(null)
    setCsvHeaders([])
    setCsvRows([])
    setColumnMapping(DEFAULT_MAPPING)
    setDateFormat('MM/dd/yy')
    setParsedPreview([])
    setTotalCount(0)
    setCurrencyCounts({ ARS: 0, USD: 0, skipped: 0 })
    setBankId(null)
    setAccountId(null)
    setCardId(null)
    setUsdAccountId(null)
    setDuplicates([])
    setSessionId(null)
  }

  function handleFileSelected(f: File, type: ImportFileType) {
    setFile(f)
    setFileType(type)
    previewMutation.mutate({ file: f, type }, {
      onSuccess(data) {
        setTempKey(data.tempKey)
        if (type === 'CSV') {
          setCsvHeaders(data.headers ?? [])
          setCsvRows(data.rows ?? [])
          const { mapping, dateFormat: fmt } = autoDetectMapping(data.headers ?? [])
          setColumnMapping(mapping)
          setDateFormat(fmt)
        } else {
          setParsedPreview(data.preview ?? [])
          setTotalCount(data.totalCount ?? 0)
          setCurrencyCounts(data.currencyCounts ?? { ARS: 0, USD: 0, skipped: 0 })
        }
        setStep('preview')
      },
      onError(e: any) {
        if (e?.status === 409) {
          toast.error(e.message ?? 'File already imported')
        } else {
          toast.error(e.message ?? 'Failed to parse file')
        }
      },
    })
  }

  function handleConfirm() {
    if (!file || !fileType || !tempKey) return
    const req: ConfirmRequest = {
      tempKey,
      type: fileType,
      ...(fileType === 'CSV' && { columnMapping, dateFormat }),
      ...(fileType === 'VISA_PDF'
        ? { cardId: cardId ?? undefined, arsAccountId: accountId ?? undefined, usdAccountId: usdAccountId ?? undefined }
        : { accountId: accountId ?? undefined }),
    }
    confirmMutation.mutate(req, {
      onSuccess(data) {
        toast.success(`Imported ${data.imported} transactions`)
        if (data.duplicates.length > 0) {
          setDuplicates(data.duplicates)
          setSessionId(data.sessionId ?? null)
          setDupeOpen(true)
        }
        reset()
      },
      onError(e: any) {
        toast.error(e.message ?? 'Import failed')
      },
    })
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = i < stepIndex
          const active = i === stepIndex
          return (
            <div key={s} className="flex items-center">
              <div className={[
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                active ? 'bg-primary text-primary-foreground' : done ? 'text-primary' : 'text-muted-foreground',
              ].join(' ')}>
                <span className={[
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                  active ? 'bg-primary-foreground text-primary' : done ? 'bg-primary text-primary-foreground' : 'bg-muted',
                ].join(' ')}>
                  {done ? '✓' : i + 1}
                </span>
                {STEP_LABELS[s]}
              </div>
              {i < STEPS.length - 1 && (
                <div className={['h-px w-6', i < stepIndex ? 'bg-primary' : 'bg-border'].join(' ')} />
              )}
            </div>
          )
        })}
      </div>

      {step === 'file_select' && (
        <StepFileSelect
          isLoading={previewMutation.isPending}
          onFileSelected={handleFileSelected}
        />
      )}

      {step === 'preview' && fileType === 'CSV' && (
        <StepColumnMapper
          headers={csvHeaders}
          rows={csvRows}
          mapping={columnMapping}
          dateFormat={dateFormat}
          onMappingChange={setColumnMapping}
          onDateFormatChange={setDateFormat}
          onNext={() => setStep('account_link')}
          onBack={() => setStep('file_select')}
        />
      )}

      {step === 'preview' && fileType !== 'CSV' && fileType !== null && (
        <StepPdfPreview
          preview={parsedPreview}
          totalCount={totalCount}
          currencyCounts={currencyCounts}
          fileType={fileType}
          onNext={() => setStep('account_link')}
          onBack={() => setStep('file_select')}
        />
      )}

      {step === 'account_link' && (
        <StepAccountLink
          fileType={fileType!}
          currencyCounts={fileType === 'VISA_PDF' ? currencyCounts : undefined}
          bankId={bankId}
          accountId={accountId}
          cardId={cardId}
          usdAccountId={usdAccountId}
          onBankChange={setBankId}
          onAccountChange={setAccountId}
          onCardChange={setCardId}
          onUsdAccountChange={setUsdAccountId}
          onNext={() => setStep('confirm')}
          onBack={() => setStep('preview')}
        />
      )}

      {step === 'confirm' && file && fileType && (
        <StepConfirm
          file={file}
          fileType={fileType}
          bank={selectedBank}
          account={selectedAccount
            ? { id: selectedAccount.id, name: selectedAccount.name, currency: selectedAccount.currency }
            : undefined}
          card={selectedCard}
          usdAccount={selectedUsdAccount
            ? { id: selectedUsdAccount.id, name: selectedUsdAccount.name, currency: selectedUsdAccount.currency }
            : undefined}
          totalCount={totalCount}
          currencyCounts={fileType === 'VISA_PDF' ? currencyCounts : undefined}
          isLoading={confirmMutation.isPending}
          onConfirm={handleConfirm}
          onBack={() => setStep('account_link')}
        />
      )}

      <ImportDuplicatesDialog
        open={dupeOpen}
        onOpenChange={setDupeOpen}
        duplicates={duplicates}
        sessionId={sessionId ?? ''}
        onResolved={() => setDupeOpen(false)}
      />
    </div>
  )
}
