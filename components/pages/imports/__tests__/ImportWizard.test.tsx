import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepColumnMapper } from '../steps/StepColumnMapper'
import React from 'react'

if (typeof window !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
}

const headers = ['fecha', 'descripcion', 'monto', 'debito', 'credito', 'saldo']
const rows = [['2026-08-01', 'Super', '100', '100', '0', '5000']]

describe('StepColumnMapper', () => {
  it('accepts a single signed amount column', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    const mapping = { dateCol: 0, descCol: 1, expenseCol: -1, incomeCol: -1 }

    render(
      <StepColumnMapper
        headers={headers}
        rows={rows}
        mapping={mapping}
        onMappingChange={vi.fn()}
        onNext={onNext}
        onBack={vi.fn()}
      />
    )

    await user.click(screen.getByRole('radio', { name: 'Una columna con signo' }))
    expect(screen.getByLabelText('Importe *')).toBeInTheDocument()
  })

  it('accepts separate débito and crédito columns', async () => {
    const user = userEvent.setup()
    render(
      <StepColumnMapper
        headers={headers}
        rows={rows}
        mapping={{ dateCol: 0, descCol: 1, expenseCol: -1, incomeCol: -1 }}
        onMappingChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    )

    await user.click(screen.getByRole('radio', { name: 'Columnas separadas' }))
    expect(screen.getByLabelText('Débito *')).toBeInTheDocument()
    expect(screen.getByLabelText('Crédito *')).toBeInTheDocument()
  })

  it('wires the optional balance column to the reconciliation check', async () => {
    const user = userEvent.setup()
    render(
      <StepColumnMapper
        headers={headers}
        rows={rows}
        mapping={{ dateCol: 0, descCol: 1, expenseCol: 2, incomeCol: 2 }}
        onMappingChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    )

    await user.click(screen.getByLabelText('Saldo (opcional)'))
    await user.click(screen.getByRole('option', { name: 'saldo' }))
    expect(screen.getByText('Verificaremos que el saldo coincida')).toBeInTheDocument()
  })

  it('blocks continuing while a required mapping is missing', () => {
    render(
      <StepColumnMapper
        headers={headers}
        rows={rows}
        mapping={{ dateCol: -1, descCol: -1, expenseCol: -1, incomeCol: -1 }}
        onMappingChange={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })
})
