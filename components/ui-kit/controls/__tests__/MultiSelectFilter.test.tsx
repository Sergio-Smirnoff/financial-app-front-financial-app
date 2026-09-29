import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MultiSelectFilter, type MultiSelectOption } from '../MultiSelectFilter'

const OPTIONS: MultiSelectOption[] = [
  { value: 'none', label: 'Sin categorizar' },
  { value: '1', label: 'Supermercado' },
  { value: '2', label: 'Supermercado / Almacén' },
]

function Harness({ initial, onSelectedChange }: { initial: string[]; onSelectedChange: (next: string[]) => void }) {
  const [selected, setSelected] = useState(initial)
  return (
    <MultiSelectFilter
      label="Filtrar por categoría"
      triggerText={selected.length ? selected.join('+') : 'Todas las categorías'}
      options={OPTIONS}
      selected={selected}
      onSelectedChange={(next) => {
        setSelected(next)
        onSelectedChange(next)
      }}
    />
  )
}

describe('MultiSelectFilter', () => {
  it('lists every option as a checkbox item reflecting the selection', async () => {
    const user = userEvent.setup()
    render(<Harness initial={['1']} onSelectedChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: /^Filtrar por categoría:/ }))
    expect(screen.getByRole('menuitemcheckbox', { name: 'Supermercado' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('menuitemcheckbox', { name: 'Sin categorizar' })).toHaveAttribute('aria-checked', 'false')
  })

  it('stays open so several values can be picked, in option order', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<Harness initial={[]} onSelectedChange={onSelectedChange} />)
    await user.click(screen.getByRole('button', { name: /^Filtrar por categoría:/ }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Supermercado / Almacén' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Sin categorizar' }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(['none', '2'])
    expect(screen.getByRole('menuitemcheckbox', { name: 'Supermercado' })).toBeInTheDocument()
  })

  it('unticks a selected value', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<Harness initial={['none', '1']} onSelectedChange={onSelectedChange} />)
    await user.click(screen.getByRole('button', { name: /^Filtrar por categoría:/ }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Sin categorizar' }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(['1'])
  })

  it('names the trigger with its label and the current selection', () => {
    render(<Harness initial={['1']} onSelectedChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Filtrar por categoría: 1' })).toBeInTheDocument()
  })

  it('keeps a selected value the options do not list', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(<Harness initial={['999']} onSelectedChange={onSelectedChange} />)
    await user.click(screen.getByRole('button', { name: /^Filtrar por categoría:/ }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Sin categorizar' }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(['none', '999'])
  })
})
