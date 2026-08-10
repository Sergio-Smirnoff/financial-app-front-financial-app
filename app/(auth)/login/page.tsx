'use client'

import React from 'react'
import { AuthSplit } from '@/components/pages/auth/AuthSplit'
import { LoginForm } from '@/components/pages/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthSplit title="Bienvenido a financial-app" subtitle="Accedé a tu resumen patrimonial, cuentas bancarias e inversiones">
      <LoginForm />
    </AuthSplit>
  )
}
