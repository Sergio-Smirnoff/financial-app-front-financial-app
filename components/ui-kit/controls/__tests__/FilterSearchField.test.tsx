import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { FilterSearchField } from '../FilterSearchField'

function Controlled({ initial, onValueChange }: { initial: string; onValueChange: (v: string) => void }) {
  const [value, setValue] = useState(initial)
  return (
    <FilterSearchField
      value={value}
      label="Buscar por descripción"
      onValueChange={(v) => {
        setValue(v)
        onValueChange(v)
      }}
    />
  )
}

describe('FilterSearchField', () => {
  it('shows the value it is given instead of starting empty', () => {
    render(<FilterSearchField value="cafe" label="Buscar por descripción" onValueChange={() => {}} />)
    expect(screen.getByRole('searchbox', { name: 'Buscar por descripción' })).toHaveValue('cafe')
  })

  it('reports every edit and never reports on its own', async () => {
    const onValueChange = vi.fn()
    render(<Controlled initial="" onValueChange={onValueChange} />)
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.type(screen.getByRole('searchbox'), 'Coto')
    expect(onValueChange).toHaveBeenLastCalledWith('Coto')
    expect(onValueChange).toHaveBeenCalledTimes(4)
  })
})
