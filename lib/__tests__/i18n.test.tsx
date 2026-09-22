import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import messages from '../../messages/es-AR.json'
import esAR from '@/messages/es-AR.json'
import en from '@/messages/en.json'

function TestComponent() {
  const t = useTranslations('common')
  return <p>{t('retry')}</p>
}

describe('i18n', () => {
  it('renders a catalogue string, not a key', () => {
    render(
      <NextIntlClientProvider locale="es-AR" messages={messages}>
        <TestComponent />
      </NextIntlClientProvider>,
    )
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })
})

describe('catalogue keys referenced from code', () => {
  it('provides common.actions in both locales', () => {
    expect(esAR.common.actions).toBe('Acciones')
    expect(en.common.actions).toBe('Actions')
  })

  it('provides the subcategory button label in both locales', () => {
    expect(esAR.categories.budget.addSubcategory).toBeTruthy()
    expect(en.categories.budget.addSubcategory).toBeTruthy()
  })
})
