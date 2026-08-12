import { expect, type Page } from '@playwright/test'

export const DEMO = {
  email: 'demo@financial.app',
  password: 'Demo!2026pass',
  checkingCbu: '0170099200000000000017',
  savingsCbu: '0170099200000000000024',
  loanName: 'Préstamo personal',
  overBudgetCategory: 'Supermercado',
  importedFile: 'demo-statement.csv',
}

export async function loginAsDemo(page: Page) {
  await page.goto('/login')
  await page.getByLabel(/correo|email/i).fill(DEMO.email)
  await page.getByLabel(/contraseña|password/i).fill(DEMO.password)
  await page.getByRole('button', { name: /ingresar|iniciar/i }).click()
  await expect(page).toHaveURL(/\/$|\/dashboard/)
}
