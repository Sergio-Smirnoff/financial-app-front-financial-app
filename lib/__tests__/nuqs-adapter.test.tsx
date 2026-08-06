import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useQueryState } from 'nuqs'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, it, expect } from 'vitest'

function TestSearchComponent() {
  const [q, setQ] = useQueryState('q', { defaultValue: '' })
  return (
    <div>
      <span data-testid="q-val">{q}</span>
      <button onClick={() => setQ('super')}>Set Q</button>
    </div>
  )
}

describe('nuqs adapter', () => {
  it('updates query state in component', async () => {
    const user = userEvent.setup()
    render(
      <NuqsTestingAdapter>
        <TestSearchComponent />
      </NuqsTestingAdapter>,
    )

    expect(screen.getByTestId('q-val').textContent).toBe('')
    await user.click(screen.getByRole('button', { name: 'Set Q' }))
    expect(screen.getByTestId('q-val').textContent).toBe('super')
  })
})
