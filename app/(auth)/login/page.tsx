'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuthSplit } from '@/components/pages/auth/AuthSplit'
import { LoginForm } from '@/components/pages/auth/LoginForm'
import { login } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    await login({ email, password })
    router.replace('/')
    router.refresh()
  }

  return (
    <AuthSplit title="Bienvenido a financial-app" subtitle="Accedé a tu resumen patrimonial, cuentas bancarias e inversiones">
      <LoginForm onLogin={handleLogin} />
    </AuthSplit>
  )
}
