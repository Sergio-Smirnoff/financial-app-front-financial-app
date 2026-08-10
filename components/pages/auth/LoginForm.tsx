'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export interface LoginFormProps {
  onLogin?: (credentials: { email: string; password: string; rememberMe: boolean }) => Promise<void>
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setSubmitting(true)
    setError(null)

    try {
      if (onLogin) {
        await onLogin({ email, password, rememberMe })
      } else {
        // Simulate auth call failure if invalid
        if (password === 'wrong') {
          throw new Error('Invalid credentials')
        }
        router.push('/')
      }
    } catch (err: any) {
      setError('Email o contraseña incorrectos')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Iniciar Sesión</h1>
        <p className="text-sm text-muted-foreground">
          Ingresá tus credenciales para acceder a tu plataforma
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium">Email</label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium">Contraseña</label>
          </div>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(!!checked)}
          />
          <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
            Mantener sesión iniciada
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting || !email || !password}>
        {submitting ? 'Ingresando...' : 'Ingresar'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés una cuenta?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Registrate
        </Link>
      </p>
    </form>
  )
}
