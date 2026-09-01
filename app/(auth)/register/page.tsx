'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AuthSplit } from '@/components/pages/auth/AuthSplit'
import { RegisterForm } from '@/components/pages/auth/RegisterForm'
import { register } from '@/lib/api/auth'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('auth')

  const handleRegister = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const [firstName, ...rest] = name.trim().split(/\s+/)
    await register({ email, password, firstName, lastName: rest.join(' ') })
    router.replace('/')
    router.refresh()
  }

  return (
    <AuthSplit title={t('register.pageTitle')} subtitle={t('register.pageSubtitle')}>
      <RegisterForm onRegister={handleRegister} />
    </AuthSplit>
  )
}
