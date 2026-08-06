import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import messages from '../../messages/es-AR.json'

function TestComponent() {
  const t = useTranslations('common')
  return <p>{t('retry')}</p>
}

it('renders a catalogue string, not a key', () => {
  render(
    <NextIntlClientProvider locale="es-AR" messages={messages}>
      <TestComponent />
    </NextIntlClientProvider>,
  )
  expect(screen.getByText('Reintentar')).toBeInTheDocument()
})
