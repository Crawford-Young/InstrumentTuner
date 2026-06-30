import { test, expect } from '@playwright/test'

test('tap duel runs from setup into a turn', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('tab', { name: 'Duel' }).click()

  // Setup -> start a tap match (tap is default)
  await page.getByRole('button', { name: /start match/i }).click()

  // P1 privacy gate
  await expect(page.getByText(/P1's turn/i)).toBeVisible()
  await page.getByRole('button', { name: /ready/i }).click()

  // Tap four times to submit a tempo
  const tap = page.getByRole('button', { name: /^tap$/i })
  for (let i = 0; i < 4; i++) {
    await tap.click()
    await page.waitForTimeout(120)
  }

  // Advances to P2's turn
  await expect(page.getByText(/P2's turn/i)).toBeVisible()
})
