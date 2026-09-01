'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AuthSplit } from '@/components/pages/auth/AuthSplit'
import { LoginForm } from '@/components/pages/auth/LoginForm'
import { login } from '@/lib/api/auth'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('auth')

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    await login({ email, password })
    router.replace('/')
    router.refresh()
  }

  return (
    <AuthSplit title={t('login.pageTitle')} subtitle={t('login.pageSubtitle')}>
      <LoginForm onLogin={handleLogin} />
    </AuthSplit>
  )
}
