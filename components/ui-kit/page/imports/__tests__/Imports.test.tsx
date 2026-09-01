import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropzone } from '../Dropzone'
import { Stepper } from '../Stepper'
import { FileProgress } from '../FileProgress'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('Dropzone', () => {
  it('rejects a non-CSV file with a scoped message', async () => {
    renderWithIntl(<Dropzone accept=".csv,.pdf" onFile={vi.fn()} />)
    const input = screen.getByLabelText('Archivo')
    await userEvent.upload(input, new File(['x'], 'a.txt', { type: 'text/plain' }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Formato no admitido')
    })
  })

  it('prompts in Spanish and lists the accepted formats', () => {
    renderWithIntl(<Dropzone accept=".csv,.pdf" onFile={vi.fn()} />)
    expect(screen.getByText('Arrastrá un archivo o hacé clic para seleccionar')).toBeInTheDocument()
    expect(screen.getByText('Formatos aceptados: .csv,.pdf')).toBeInTheDocument()
  })

  it('accepts a valid file', async () => {
    const onFile = vi.fn()
    renderWithIntl(<Dropzone accept=".csv" onFile={onFile} />)
    await userEvent.upload(
      screen.getByLabelText('Archivo'),
      new File(['a,b'], 'data.csv', { type: 'text/csv' })
    )
    expect(onFile).toHaveBeenCalledTimes(1)
  })
})

describe('Stepper', () => {
  it('renders all steps and marks current', () => {
    renderWithIntl(<Stepper steps={['Archivo', 'Revisión', 'Confirmación']} current={1} />)
    expect(screen.getByText('Archivo')).toBeInTheDocument()
    expect(screen.getByText('Revisión')).toBeInTheDocument()
  })

  it('names the step navigation', () => {
    renderWithIntl(<Stepper steps={['Archivo', 'Revisión']} current={0} />)
    expect(screen.getByRole('navigation', { name: 'Pasos del proceso' })).toBeInTheDocument()
  })
})

describe('FileProgress', () => {
  it('renders progress bar during upload', () => {
    renderWithIntl(<FileProgress fileName="data.csv" status="uploading" progress={45} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45')
  })

  it('renders status for completed file', () => {
    renderWithIntl(<FileProgress fileName="data.csv" status="done" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('announces the file status in Spanish, never the raw enum', () => {
    renderWithIntl(<FileProgress fileName="data.csv" status="uploading" progress={45} />)
    expect(screen.getByRole('status')).toHaveAccessibleName('data.csv: Subiendo')
    expect(screen.getByRole('progressbar', { name: 'Progreso de carga' })).toBeInTheDocument()
  })

  it('translates every status of the enum', () => {
    renderWithIntl(<FileProgress fileName="data.csv" status="done" />)
    expect(screen.getByRole('status')).toHaveAccessibleName('data.csv: Completado')
  })
})
