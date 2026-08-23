import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../RegisterForm'
import { ApiError } from '@/lib/api/client'
import React from 'react'

describe('RegisterForm', () => {
  it('marks each password rule as it is met', async () => {
    const user = userEvent.setup()
    render(<RegisterForm onRegister={vi.fn()} />)

    await user.type(screen.getByLabelText('Contraseña'), 'Secreta1')
    expect(screen.getByText(/Mínimo 8 caracteres/)).toHaveAttribute('data-met', 'true')
    expect(screen.getByText(/Una mayúscula/)).toHaveAttribute('data-met', 'true')
    expect(screen.getByText(/Un número/)).toHaveAttribute('data-met', 'true')
  })

  it('blocks step 2 until every rule is met', async () => {
    const user = userEvent.setup()
    render(<RegisterForm onRegister={vi.fn()} />)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'corta')
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  it('announces rule changes politely', () => {
    render(<RegisterForm onRegister={vi.fn()} />)
    expect(screen.getByRole('status', { name: 'Requisitos de contraseña' })).toBeInTheDocument()
  })

  it('goes back to step 1 without losing what was typed', async () => {
    const user = userEvent.setup()
    render(<RegisterForm onRegister={vi.fn()} />)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Volver' }))
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com')
  })

  it('surfaces a duplicate-email error on the field, not as a page error', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn().mockRejectedValue(new ApiError('Email already registered', 409))
    render(<RegisterForm onRegister={onRegister} />)

    await user.type(screen.getByLabelText('Email'), 'duplicate@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Ya existe una cuenta con ese email')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('hands the collected profile to the registration handler', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn().mockResolvedValue(undefined)
    render(<RegisterForm onRegister={onRegister} />)

    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(onRegister).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'Secreta123',
      name: 'Ana Pérez',
      preferredCurrency: 'ARS',
    })
  })
})
