import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { SidePanel } from '../SidePanel'
import { Dialog } from '../Dialog'

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
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByText('contenido')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText('contenido')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
  })

  it('renders the title', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByText('Panel')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------

describe('Dialog', () => {
  it('always names its dialog for screen readers', () => {
    render(
      <Dialog open title="Editar" description="Editar el movimiento" onOpenChange={() => {}}>
        <p>x</p>
      </Dialog>
    )
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Editar el movimiento')
  })

  it('renders the title', () => {
    render(
      <Dialog open title="Mi título" description="desc" onOpenChange={() => {}}>
        <p>x</p>
      </Dialog>
    )
    expect(screen.getByText('Mi título')).toBeInTheDocument()
  })
})
