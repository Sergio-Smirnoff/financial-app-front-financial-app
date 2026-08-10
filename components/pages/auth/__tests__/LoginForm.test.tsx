import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import React from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('LoginForm', () => {
  it('sends remember-me with the credentials', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn().mockResolvedValue(undefined)
    render(<LoginForm onLogin={onLogin} />)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    await user.click(screen.getByLabelText('Mantener sesión iniciada'))
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(onLogin).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'Secreta123',
      rememberMe: true,
    })
  })

  it('gives the same message for a wrong email and a wrong password', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn().mockRejectedValue(new Error('Invalid factor'))
    render(<LoginForm onLogin={onLogin} />)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email o contraseña incorrectos')
  })

  it('keeps the field values after a failed attempt', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn().mockRejectedValue(new Error('Invalid factor'))
    render(<LoginForm onLogin={onLogin} />)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com')
  })

  it('offers no Google button', () => {
    render(<LoginForm />)
    expect(screen.queryByRole('button', { name: /Google/i })).not.toBeInTheDocument()
  })
})
