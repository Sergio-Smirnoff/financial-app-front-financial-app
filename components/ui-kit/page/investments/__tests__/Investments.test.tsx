import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuotePill } from '../QuotePill'
import { MarketStrip } from '../MarketStrip'
import { PositionForm } from '../PositionForm'
import { Dropzone } from '../../imports/Dropzone'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

const NOW = new Date().toISOString()

describe('QuotePill', () => {
  it('formats riesgo país as points, not percent', () => {
    renderWithIntl(
      <QuotePill
        quote={{
          code: 'RIESGO_PAIS',
          label: 'Riesgo país',
          value: '742',
          variation: -12,
          unit: 'POINTS',
          observedAt: NOW,
        }}
      />
    )
    expect(screen.getByText('−12 pts')).toBeInTheDocument()
  })

  it('formats percent variation for regular tickers', () => {
    renderWithIntl(
      <QuotePill
        quote={{
          code: 'GGAL',
          label: 'Galicia',
          value: '1250',
          variation: 2.5,
          unit: 'PERCENT',
          observedAt: NOW,
        }}
      />
    )
    expect(screen.getByText(/2,5 %/)).toBeInTheDocument()
  })
})

describe('Dropzone', () => {
  it('rejects a non-CSV file with a scoped message', async () => {
    renderWithIntl(<Dropzone accept=".csv,.pdf" onFile={vi.fn()} />)
    await userEvent.upload(
      screen.getByLabelText('Archivo'),
      new File(['x'], 'a.txt', { type: 'text/plain' })
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Formato no admitido')
    })
  })
})

describe('MarketStrip', () => {
  it('titles the strip in Spanish', () => {
    renderWithIntl(<MarketStrip quotes={[]} observedAt={NOW} />)
    expect(screen.getByText('Mercado')).toBeInTheDocument()
  })
})

describe('PositionForm', () => {
  it('labels every field and the add-mode form', () => {
    renderWithIntl(<PositionForm mode="add" onCancel={vi.fn()} />)
    expect(screen.getByRole('form', { name: 'Agregar posición' })).toBeInTheDocument()
    expect(screen.getByLabelText('Ticker')).toHaveAttribute('placeholder', 'p.ej. GGAL')
    expect(screen.getByLabelText('Cantidad')).toBeInTheDocument()
    expect(screen.getByLabelText('Precio de compra')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument()
  })

  it('switches the form name and submit label in edit mode', () => {
    renderWithIntl(<PositionForm mode="edit" />)
    expect(screen.getByRole('form', { name: 'Editar posición' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('submits the decimals normalised as exact strings', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithIntl(<PositionForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Ticker'), 'ggal')
    await user.type(screen.getByLabelText('Cantidad'), '1,50')
    await user.type(screen.getByLabelText('Precio de compra'), '4850')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    expect(onSubmit).toHaveBeenCalledWith({ ticker: 'GGAL', quantity: '1.5', purchasePrice: '4850', currency: 'ARS' })
  })

  it('flags an exponent quantity on the field and submits nothing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithIntl(<PositionForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Ticker'), 'GGAL')
    await user.type(screen.getByLabelText('Cantidad'), '1e-7')
    await user.type(screen.getByLabelText('Precio de compra'), '4850')
    await user.click(screen.getByRole('button', { name: 'Agregar' }))

    const quantity = screen.getByLabelText('Cantidad')
    expect(quantity).toHaveAttribute('aria-invalid', 'true')
    expect(quantity).toHaveAccessibleDescription('Ingresá un número válido (ej: 1,5).')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
