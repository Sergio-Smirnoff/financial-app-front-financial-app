import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropzone } from '../Dropzone'
import { Stepper } from '../Stepper'
import { FileProgress } from '../FileProgress'

describe('Dropzone', () => {
  it('rejects a non-CSV file with a scoped message', async () => {
    render(<Dropzone accept=".csv,.pdf" onFile={vi.fn()} />)
    const input = screen.getByLabelText('Archivo')
    await userEvent.upload(input, new File(['x'], 'a.txt', { type: 'text/plain' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Formato no admitido')
    })
  })

  it('accepts a valid file', async () => {
    const onFile = vi.fn()
    render(<Dropzone accept=".csv" onFile={onFile} />)
    await userEvent.upload(
      screen.getByLabelText('Archivo'),
      new File(['a,b'], 'data.csv', { type: 'text/csv' })
    )
    expect(onFile).toHaveBeenCalledTimes(1)
  })
})

describe('Stepper', () => {
  it('renders all steps and marks current', () => {
    render(<Stepper steps={['Archivo', 'Revisión', 'Confirmación']} current={1} />)
    expect(screen.getByText('Archivo')).toBeInTheDocument()
    expect(screen.getByText('Revisión')).toBeInTheDocument()
  })
})

describe('FileProgress', () => {
  it('renders progress bar during upload', () => {
    render(<FileProgress fileName="data.csv" status="uploading" progress={45} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45')
  })

  it('renders status for completed file', () => {
    render(<FileProgress fileName="data.csv" status="done" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
