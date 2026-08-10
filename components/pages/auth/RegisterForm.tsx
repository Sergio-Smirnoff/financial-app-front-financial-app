'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PasswordRules } from './PasswordRules'

export interface RegisterFormProps {
  onRegister?: (data: { email: string; password: string; name: string; preferredCurrency: string }) => Promise<void>
}

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
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
      if (onRegister) {
        await onRegister({ email, password, name, preferredCurrency: currency })
      } else {
        if (email.includes('duplicate')) {
          throw new Error('DUPLICATE_EMAIL')
        }
      }
      router.push('/')
    } catch (err: any) {
      if (err.message === 'DUPLICATE_EMAIL' || err.status === 409) {
        setEmailError('Ya existe una cuenta con ese email')
        setStep(1)
      } else {
        setEmailError('Ocurrió un error al registrar la cuenta')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Crear Cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Paso {step} de 2 — {step === 1 ? 'Credenciales de acceso' : 'Perfil de usuario'}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError(null)
                }}
                placeholder="usuario@ejemplo.com"
                aria-invalid={!!emailError}
                required
              />
              {emailError && (
                <p className="text-xs font-semibold text-destructive">{emailError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium">Contraseña</label>
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
            Continuar
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-sm font-medium">Nombre completo</label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ana Pérez"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-currency" className="text-sm font-medium">Moneda principal</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="reg-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                  <SelectItem value="USD">Dólares (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)}>
              Volver
            </Button>
            <Button type="submit" className="w-2/3" disabled={submitting || !name.trim()}>
              {submitting ? 'Creando...' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés una cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
