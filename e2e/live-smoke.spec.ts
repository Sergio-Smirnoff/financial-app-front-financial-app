import { test, expect } from '@playwright/test'
import { DEMO, loginAsDemo } from './fixtures/live'

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page)
})

test('Resumen renders composed KPIs and the flow chart', async ({ page }) => {
  await page.goto('/')
  const cashTile = page.locator('[class*="kpi"]').filter({ hasText: 'Efectivo' }).first()
  await expect(cashTile).toContainText(/\$\s?[\d.]+/)
  await expect(page.getByRole('img', { name: /flujo mensual/i })).toBeVisible()
  await expect(page.getByText(/sin datos|no hay/i)).toHaveCount(0)
})

test('Bancos renders all seven sections with seeded entities', async ({ page }) => {
  await page.goto('/banks')
  await expect(page.getByTestId('banks-kpi-account-count')).toHaveText('2')
  await expect(page.getByTestId('import-health-rail').getByTestId('import-health-row').first()).toBeVisible()
  await expect(page.getByTestId('payment-calendar-entry').first()).toBeVisible()
  await page.getByRole('tab', { name: /préstamos/i }).click()
  await expect(page.getByText(DEMO.loanName)).toBeVisible()
})

test('Movimientos renders the summary strip, rows and method filter', async ({ page }) => {
  await page.goto('/transactions')
  await expect(page.getByTestId('tx-summary-income')).not.toBeEmpty()
  await expect(page.getByTestId('tx-row')).not.toHaveCount(0)
  await expect(page.getByRole('option', { name: 'Tarjeta de débito' })).toBeAttached()
})

test('Categorías flags the deliberately over-cap budget', async ({ page }) => {
  await page.goto('/categories')
  const row = page.getByTestId('budget-row').filter({ hasText: DEMO.overBudgetCategory })
  await expect(row).toBeVisible()
  await expect(row.getByTestId('budget-over-flag')).toBeVisible()
})

test('Inversiones renders portfolio sections and degrades only the market strip', async ({ page }) => {
  await page.goto('/investments')
  await expect(page.getByTestId('inv-kpi-market-value')).toBeVisible()
  await expect(page.getByTestId('position-row').or(page.getByTestId('positions-empty'))).toBeVisible()
})

test('Importaciones lists the seeded run and its reconciliation', async ({ page }) => {
  await page.goto('/imports')
  await expect(page.getByTestId('import-run-row').filter({ hasText: DEMO.importedFile })).toBeVisible()
  await expect(page.getByTestId('reconciliation-card')).toBeVisible()
})

test('Ajustes renders profile, preferences, notifications, fees and sessions', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByText(DEMO.email)).toBeVisible()
  await expect(page.getByTestId('pref-primary-currency')).toHaveValue(/ARS|USD/)
  await expect(page.getByTestId('notification-pref-row').first()).toBeVisible()
  await expect(page.getByTestId('session-current')).toBeVisible()
  await expect(page.getByTestId('fees-accounts')).toBeVisible()
})

test('global search returns a grouped movements hit', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('Coto')
  await expect(page.getByRole('group', { name: /movimientos/i })).toBeVisible()
  await expect(page.getByTestId('search-hit').first()).toHaveAttribute('href', /.+/)
})
