import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { SectionState } from '../SectionState'

const NOW = '2026-08-06T12:00:00Z'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('SectionState', () => {
  const cases = [
    {
      name: 'loading',
      section: undefined,
      isLoading: true,
      expect: () => expect(screen.getByTestId('skeleton')).toBeInTheDocument(),
    },
    {
      name: 'unavailable',
      section: { status: 'UNAVAILABLE' as const, observedAt: NOW, data: null },
      isLoading: false,
      expect: () => {
        expect(screen.getByText('No pudimos cargar esta sección')).toBeInTheDocument()
        expect(screen.getByText('El resto de la página sigue disponible')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
        expect(screen.queryByText(/\$/)).not.toBeInTheDocument() // never a figure
      },
    },
    {
      name: 'empty',
      section: { status: 'OK' as const, observedAt: NOW, data: [] },
      isLoading: false,
      expect: () => {
        expect(screen.getByText('Todavía no hay datos')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument()
      },
    },
    {
      name: 'ready',
      section: { status: 'OK' as const, observedAt: NOW, data: [{ id: 1 }] },
      isLoading: false,
      expect: () => expect(screen.getByText('fila 1')).toBeInTheDocument(),
    },
  ]

  it.each(cases)('renders the $name state and nothing else', ({ section, isLoading, expect: assert }) => {
    renderWithIntl(
      <SectionState
        section={section}
        isLoading={isLoading}
        skeleton={<div data-testid="skeleton">Cargando...</div>}
        emptyAction={<button>Agregar</button>}
        onRetry={vi.fn()}
      >
        {(data) => <div>fila {(data as Array<{ id: number }>)[0]?.id}</div>}
      </SectionState>
    )
    assert()
  })
})
