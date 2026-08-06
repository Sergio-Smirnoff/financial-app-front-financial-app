import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SectionState } from '../SectionState'

const NOW = '2026-08-06T12:00:00Z'

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
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
        expect(screen.queryByText(/\$/)).not.toBeInTheDocument() // never a figure
      },
    },
    {
      name: 'empty',
      section: { status: 'OK' as const, observedAt: NOW, data: [] },
      isLoading: false,
      expect: () => expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument(),
    },
    {
      name: 'ready',
      section: { status: 'OK' as const, observedAt: NOW, data: [{ id: 1 }] },
      isLoading: false,
      expect: () => expect(screen.getByText('fila 1')).toBeInTheDocument(),
    },
  ]

  it.each(cases)('renders the $name state and nothing else', ({ section, isLoading, expect: assert }) => {
    render(
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
