import { test, expect } from '@playwright/test'

test.describe('Import journey', () => {
  test('loads import route', async ({ page }) => {
    await page.goto('/imports')
    await expect(page).toHaveURL(/\/imports|\/login/)
  })
})
