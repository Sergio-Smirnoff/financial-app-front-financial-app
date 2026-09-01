import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { Toast } from '../Toast'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('Toast', () => {
  it('names its close button in Spanish', () => {
    renderWithIntl(<Toast description="Se guardaron los cambios" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })
})
