import { test, expect } from '@playwright/test'

test.describe('InstrumentTuner', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock microphone permission
    await context.grantPermissions(['microphone'])
    await page.goto('/')
  })

  test('page loads with Note Detector tab active', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Note Detector' })).toHaveAttribute(
      'data-state',
      'active',
    )
  })

  test('Start button is visible on load', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start microphone' })).toBeVisible()
  })

  test('switching to Tuner tab shows string selector after Start', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tuner' }).click()
    await expect(page.getByRole('group', { name: /string selector/i })).toBeVisible()
  })

  test('instrument selector shows Guitar and Ukulele options', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tuner' }).click()
    await page.getByRole('combobox', { name: /instrument/i }).click()
    await expect(page.getByRole('option', { name: 'Guitar' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Ukulele' })).toBeVisible()
  })

  test('tuner gauge is present in Tuner tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tuner' }).click()
    await expect(page.getByRole('img', { name: /tuner gauge/i })).toBeVisible()
  })
})
