import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsContent } from '../SettingsContent'
import type { SettingsBff, Section } from '@/lib/api/bff/types'
import React from 'react'

const NOW = new Date().toISOString()

const fixture: SettingsBff = {
  profile: {
    status: 'OK',
    observedAt: NOW,
    data: { email: 'user@test.com', name: 'Ana Pérez', preferredCurrency: 'ARS' },
  },
  security: {
    status: 'OK',
    observedAt: NOW,
    data: { mfaEnabled: false, lastPasswordChange: NOW },
  },
}

vi.mock('@/lib/hooks/useSettingsPage', () => ({
  useSettingsPage: vi.fn(),
}))

import { useSettingsPage } from '@/lib/hooks/useSettingsPage'

function renderSettings(data: SettingsBff) {
  vi.mocked(useSettingsPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <SettingsContent />
    </QueryClientProvider>
  )
}

describe('SettingsContent', () => {
  it('reflects the active section in the URL', () => {
    renderSettings(fixture)
    const link = screen.getByRole('link', { name: 'Comisiones y costos' })
    expect(link).toHaveAttribute('href', '#fees')
  })

  it('shows the SaveBar only when a form is dirty', async () => {
    const user = userEvent.setup()
    renderSettings(fixture)
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Nombre'), 'x')
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('marks the current session and cannot revoke it', () => {
    renderSettings(fixture)
    const current = screen.getByText('Esta sesión').closest('[data-row]')!
    expect(within(current).queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('confirms before revoking another session', async () => {
    const user = userEvent.setup()
    renderSettings(fixture)
    const otherSession = screen.getByText('Chrome · Buenos Aires').closest('[data-row]')!
    await user.click(within(otherSession).getByRole('button', { name: 'Cerrar sesión' }))
    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription(/Chrome · Buenos Aires/)
  })

  it('validates the new password against the live rules', async () => {
    const user = userEvent.setup()
    renderSettings(fixture)
    await user.type(screen.getByLabelText('Nueva contraseña'), 'corta')
    expect(screen.getByText('Mínimo 8 caracteres')).toHaveAttribute('data-met', 'false')
  })

  it('previews the number format live', async () => {
    const user = userEvent.setup()
    renderSettings(fixture)
    await user.click(screen.getByLabelText('Decimales'))
    await user.click(screen.getByRole('option', { name: 'Sin decimales' }))
    expect(screen.getByTestId('format-preview')).toHaveTextContent('$ 1.284.000')
  })

  it('renders one toggle per UI category, including PAYMENT_DUE as a single combined toggle', () => {
    renderSettings(fixture)
    expect(screen.getByLabelText('Vencimiento de tarjetas y cuotas')).toBeInTheDocument()
    expect(screen.queryByLabelText('Vencimiento de préstamos')).not.toBeInTheDocument()
  })

  it('groups fees by scope and shows IVA treatment', () => {
    renderSettings(fixture)
    expect(screen.getByRole('rowgroup', { name: 'Cuentas' })).toBeInTheDocument()
    expect(screen.getByText('IVA 21 %')).toBeInTheDocument()
  })

  it('shows the debit/credit tax rate as a computed figure', () => {
    renderSettings(fixture)
    expect(screen.getByText('0,60 %')).toBeInTheDocument()
  })

  it('renders export and delete as disabled with an explanation', () => {
    renderSettings(fixture)
    expect(screen.getByRole('button', { name: 'Exportar datos (CSV)' })).toBeDisabled()
    expect(screen.getAllByText('Próximamente').length).toBeGreaterThan(0)
  })
})
