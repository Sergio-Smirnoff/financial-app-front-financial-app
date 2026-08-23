'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuthSplit } from '@/components/pages/auth/AuthSplit'
import { RegisterForm } from '@/components/pages/auth/RegisterForm'
import { register } from '@/lib/api/auth'

export default function RegisterPage() {
  const router = useRouter()

  const handleRegister = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const [firstName, ...rest] = name.trim().split(/\s+/)
    await register({ email, password, firstName, lastName: rest.join(' ') })
    router.replace('/')
    router.refresh()
  }

  return (
    <AuthSplit title="Sumate a financial-app" subtitle="Comenzá a gestionar tus cuentas, tarjetas y presupuesto en un solo lugar">
      <RegisterForm onRegister={handleRegister} />
    </AuthSplit>
  )
}
