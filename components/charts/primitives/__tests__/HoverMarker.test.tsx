import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HoverMarker } from '../HoverMarker'

function renderMarker(deltaText: string, isPositiveDelta: boolean) {
  return render(
    <svg>
      <HoverMarker
        x={10}
        y={20}
        height={200}
        width={400}
        dateText="1 sep"
        valueText="$ 100"
        deltaText={deltaText}
        isPositiveDelta={isPositiveDelta}
      />
    </svg>
  )
}

describe('HoverMarker', () => {
  it('shows a zero delta without a sign when the series went down', () => {
    renderMarker('0,0 %', false)
    expect(screen.getByText('(0,0 %)')).toBeInTheDocument()
  })

  it('shows a zero delta without a sign when the series went up', () => {
    renderMarker('0,0 %', true)
    expect(screen.getByText('(0,0 %)')).toBeInTheDocument()
  })

  it('keeps the sign the formatter already wrote', () => {
    renderMarker('−2,5 %', false)
    expect(screen.getByText('(−2,5 %)')).toBeInTheDocument()
  })
})
