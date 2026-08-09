import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuotePill } from '../QuotePill'
import { Dropzone } from '../../imports/Dropzone'

const NOW = new Date().toISOString()

describe('QuotePill', () => {
  it('formats riesgo país as points, not percent', () => {
    render(
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
    render(
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
    render(<Dropzone accept=".csv,.pdf" onFile={vi.fn()} />)
    await userEvent.upload(
      screen.getByLabelText('Archivo'),
      new File(['x'], 'a.txt', { type: 'text/plain' })
    )
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Formato no admitido')
    })
  })
})
