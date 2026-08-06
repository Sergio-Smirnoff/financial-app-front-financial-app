import { test, expect } from '@playwright/test'

test.describe('Position journey', () => {
  test('loads investments route', async ({ page }) => {
    await page.goto('/investments')
    await expect(page).toHaveURL(/\/investments|\/login/)
  })
})
