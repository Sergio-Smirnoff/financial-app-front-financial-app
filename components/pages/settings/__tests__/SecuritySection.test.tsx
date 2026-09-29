import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { SecuritySection } from '../SecuritySection'
import { api } from '@/lib/api/client'

vi.mock('@/lib/api/client', () => ({
  api: { delete: vi.fn(async () => ({})) },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="es-AR" messages={esAR}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
)

const section = {
  status: 'OK',
  observedAt: '2026-08-31T00:00:00Z',
  data: [
    { id: '65', device: 'Chrome · Linux', current: true, lastSeenAt: '2026-08-31T00:00:00Z' },
    { id: '42', device: 'Firefox · Windows', current: false, lastSeenAt: '2026-08-30T00:00:00Z' },
  ],
}

describe('SecuritySection revokes a session', () => {
  it('calls the sessions endpoint with the interpolated session id', async () => {
    const user = userEvent.setup()
    render(<SecuritySection section={section} isLoading={false} />, { wrapper })

    const rows = await screen.findAllByTestId('session-row')
    await user.click(within(rows[1]).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    const actions = within(dialog).getAllByRole('button')
    await user.click(actions[actions.length - 1])

    expect(api.delete).toHaveBeenCalledWith('/api/v1/users/me/sessions/42')
  })
})

describe('SecuritySection marks only the session the gateway reports as current', () => {
  it('marks the reported session and offers no revoke for it', async () => {
    render(<SecuritySection section={section} isLoading={false} />, { wrapper })
    const rows = await screen.findAllByTestId('session-row')
    expect(within(rows[0]).getByTestId('session-current')).toBeInTheDocument()
    expect(within(rows[0]).queryByRole('button')).not.toBeInTheDocument()
    expect(within(rows[1]).queryByTestId('session-current')).not.toBeInTheDocument()
  })

  it('marks no session when none is current, so every one can be revoked', async () => {
    const noneCurrent = { ...section, data: section.data.map((s) => ({ ...s, current: false })) }
    render(<SecuritySection section={noneCurrent} isLoading={false} />, { wrapper })
    const rows = await screen.findAllByTestId('session-row')
    expect(screen.queryByTestId('session-current')).not.toBeInTheDocument()
    for (const row of rows) expect(within(row).getByRole('button')).toBeInTheDocument()
  })
})
