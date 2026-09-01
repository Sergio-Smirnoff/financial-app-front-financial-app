'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApiError } from '@/lib/api/client'
import { PasswordRules, MIN_PASSWORD_LENGTH } from './PasswordRules'

export interface RegisterFormProps {
  onRegister: (data: { email: string; password: string; name: string; preferredCurrency: string }) => Promise<void>
}

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const t = useTranslations('auth')
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isPasswordValid =
    password.length >= MIN_PASSWORD_LENGTH && /[A-Z]/.test(password) && /[0-9]/.test(password)
  const canProceedStep1 = email.includes('@') && isPasswordValid

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (canProceedStep1) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setEmailError(null)

    try {
      await onRegister({ email, password, name, preferredCurrency: currency })
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setEmailError(t('errors.emailTaken'))
        setStep(1)
      } else if (err instanceof Error && err.message) {
        setEmailError(err.message)
      } else {
        setEmailError(t('errors.registerFailed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">{t('register.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('register.step', {
            step,
            label: step === 1 ? t('register.step1Label') : t('register.step2Label'),
          })}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-sm font-medium">{t('email')}</label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError(null)
                }}
                placeholder={t('emailPlaceholder')}
                aria-invalid={!!emailError}
                required
              />
              {emailError && (
                <p className="text-xs font-semibold text-destructive">{emailError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium">{t('password')}</label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordRules password={password} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!canProceedStep1}>
            {t('register.continue')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-sm font-medium">{t('fullName')}</label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fullNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-currency" className="text-sm font-medium">{t('primaryCurrency')}</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="reg-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">{t('currencies.ars')}</SelectItem>
                  <SelectItem value="USD">{t('currencies.usd')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)}>
              {t('register.back')}
            </Button>
            <Button type="submit" className="w-2/3" disabled={submitting || !name.trim()}>
              {submitting ? t('register.submitting') : t('register.submit')}
            </Button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {t.rich('register.haveAccount', {
          link: (chunks) => (
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  )
}
