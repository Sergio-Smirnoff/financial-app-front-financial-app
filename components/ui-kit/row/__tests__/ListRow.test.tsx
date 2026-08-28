import type { ReactElement } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { RowFlag } from '../ListRow'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('RowFlag', () => {
  it('falls back to a translated label per flag type', () => {
    renderWithIntl(<RowFlag type="duplicate" />)
    expect(screen.getByLabelText('Duplicado')).toHaveAttribute('title', 'Duplicado')
  })

  it('translates the failed and warning types too', () => {
    const { unmount } = renderWithIntl(<RowFlag type="failed" />)
    expect(screen.getByLabelText('Fallido')).toBeInTheDocument()
    unmount()
    renderWithIntl(<RowFlag type="warning" />)
    expect(screen.getByLabelText('Advertencia')).toBeInTheDocument()
  })

  it('still prefers an explicit label prop', () => {
    renderWithIntl(<RowFlag type="failed" label="Rechazado por el banco" />)
    expect(screen.getByLabelText('Rechazado por el banco')).toBeInTheDocument()
  })
})
