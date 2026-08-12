import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { SettingsContent } from '../SettingsContent'
import fixture from '@/lib/api/bff/__fixtures__/settings.json'
import type { SettingsBff } from '@/lib/api/bff/types'

vi.mock('@/lib/api/bff/settings', () => ({ getSettings: vi.fn(async () => fixture as unknown as SettingsBff) }))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

const bff = fixture as unknown as SettingsBff

describe('SettingsContent renders the real contract', () => {
  it('shows the profile from the profile section', async () => {
    render(<SettingsContent />, { wrapper })
    expect(await screen.findByText(bff.profile?.data?.email || 'demo@financial.app')).toBeInTheDocument()
  })

  it('reflects stored currency preferences in the controls', async () => {
    render(<SettingsContent />, { wrapper })
    const primary = await screen.findByTestId('pref-primary-currency')
    expect(primary).toHaveValue(bff.preferences?.data?.primaryCurrency || 'ARS')
    expect(screen.getByTestId('pref-decimals')).toHaveValue(String(bff.preferences?.data?.decimals || 2))
  })

  it('renders one toggle row per notification category', async () => {
    render(<SettingsContent />, { wrapper })
    const rows = await screen.findAllByTestId('notification-pref-row')
    expect(rows).toHaveLength(bff.notificationPrefs?.data?.length || 0)
  })

  it('lists the active sessions and marks the current one', async () => {
    render(<SettingsContent />, { wrapper })
    const rows = await screen.findAllByTestId('session-row')
    expect(rows).toHaveLength(bff.sessions?.data?.length || 0)
    expect(screen.getByTestId('session-current')).toBeInTheDocument()
  })

  it('renders the fee tables and the debit/credit tax rate', async () => {
    render(<SettingsContent />, { wrapper })
    expect(await screen.findByTestId('fees-accounts')).toBeInTheDocument()
    expect(screen.getByTestId('debit-credit-tax')).toHaveTextContent(String(bff.fees?.data?.debitCreditTaxRate || 0))
  })

  it('keeps data export and account deletion disabled with proximamente badge', async () => {
    render(<SettingsContent />, { wrapper })
    expect(await screen.findByRole('button', { name: /Exportar datos/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Eliminar cuenta/i })).toBeDisabled()
    expect(screen.getAllByText('Próximamente').length).toBeGreaterThanOrEqual(2)
  })
})
