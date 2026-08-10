'use client'

import React from 'react'
import { AuthSplit } from '@/components/pages/auth/AuthSplit'
import { RegisterForm } from '@/components/pages/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthSplit title="Sumate a financial-app" subtitle="Comenzá a gestionar tus cuentas, tarjetas y presupuesto en un solo lugar">
      <RegisterForm />
    </AuthSplit>
  )
}
