import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState, type ReactElement } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { SidePanel } from '../SidePanel'
import { Dialog } from '../Dialog'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

// ---------------------------------------------------------------------------
// SidePanel
// ---------------------------------------------------------------------------

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <SidePanel open={open} onClose={() => setOpen(false)} title="Panel">
        <p>contenido</p>
      </SidePanel>
    </>
  )
}

describe('SidePanel', () => {
  it('closes the panel on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByText('contenido')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText('contenido')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
  })

  it('renders the title', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })

  it('names its close button in Spanish', async () => {
    const user = userEvent.setup()
    renderWithIntl(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------

describe('Dialog', () => {
  it('always names its dialog for screen readers', () => {
    renderWithIntl(
      <Dialog open title="Editar" description="Editar el movimiento" onOpenChange={() => {}}>
        <p>x</p>
      </Dialog>
    )
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Editar el movimiento')
  })

  it('renders the title', () => {
    renderWithIntl(
      <Dialog open title="Mi título" description="desc" onOpenChange={() => {}}>
        <p>x</p>
      </Dialog>
    )
    expect(screen.getByText('Mi título')).toBeInTheDocument()
  })

  it('names its close button in Spanish', () => {
    renderWithIntl(
      <Dialog open title="Mi título" description="desc" onOpenChange={() => {}}>
        <p>x</p>
      </Dialog>
    )
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })
})
