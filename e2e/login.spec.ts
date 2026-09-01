import { test, expect } from '@playwright/test'

test.describe('Login journey', () => {
  test('navigates to login page or loads main page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
  })
})
