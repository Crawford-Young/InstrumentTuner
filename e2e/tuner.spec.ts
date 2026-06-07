import { test, expect } from '@playwright/test'

test.describe('InstrumentTuner', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock microphone permission
    await context.grantPermissions(['microphone'])
    await page.goto('/')
  })

  test('page loads with Tuner tab active', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Tuner' })).toHaveAttribute(
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

test.describe('Metronome tab', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone'])
    await page.goto('/')
    await page.getByRole('tab', { name: 'Metronome' }).click()
  })

  test('Metronome tab is visible in nav', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Metronome' })).toBeVisible()
  })

  test('switching to Metronome tab shows BPM display', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Metronome' })).toHaveAttribute(
      'data-state',
      'active',
    )
    await expect(page.getByText('BPM')).toBeVisible()
  })

  test('default BPM is 120', async ({ page }) => {
    await expect(page.getByText('120')).toBeVisible()
  })

  test('BPM slider is present with range 40–240', async ({ page }) => {
    const slider = page.getByRole('slider', { name: /bpm slider/i })
    await expect(slider).toBeVisible()
    await expect(slider).toHaveAttribute('min', '40')
    await expect(slider).toHaveAttribute('max', '240')
  })

  test('beat indicator shows 4 dots by default', async ({ page }) => {
    const beatGroup = page.getByRole('group', { name: /beat indicator/i })
    await expect(beatGroup).toBeVisible()
    const dots = beatGroup.locator('[aria-label]')
    await expect(dots).toHaveCount(4)
  })

  test('time signature buttons present — 2/4, 3/4, 4/4', async ({ page }) => {
    const group = page.getByRole('group', { name: /beats per measure/i })
    await expect(group.getByRole('button', { name: '2/4' })).toBeVisible()
    await expect(group.getByRole('button', { name: '3/4' })).toBeVisible()
    await expect(group.getByRole('button', { name: '4/4' })).toBeVisible()
  })

  test('4/4 is pressed by default', async ({ page }) => {
    const btn = page.getByRole('group', { name: /beats per measure/i }).getByRole('button', { name: '4/4' })
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  test('switching to 3/4 updates beat indicator to 3 dots', async ({ page }) => {
    await page.getByRole('group', { name: /beats per measure/i }).getByRole('button', { name: '3/4' }).click()
    const beatGroup = page.getByRole('group', { name: /beat indicator/i })
    const dots = beatGroup.locator('[aria-label]')
    await expect(dots).toHaveCount(3)
  })

  test('tap tempo button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /tap tempo/i })).toBeVisible()
  })

  test('Start metronome button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /start metronome/i })).toBeVisible()
  })

  test('clicking Start changes button to Stop', async ({ page }) => {
    await page.getByRole('button', { name: /start metronome/i }).click()
    await expect(page.getByRole('button', { name: /stop metronome/i })).toBeVisible()
  })

  test('clicking Stop returns button to Start', async ({ page }) => {
    await page.getByRole('button', { name: /start metronome/i }).click()
    await page.getByRole('button', { name: /stop metronome/i }).click()
    await expect(page.getByRole('button', { name: /start metronome/i })).toBeVisible()
  })

  test('BPM slider change updates displayed BPM', async ({ page }) => {
    await page.evaluate(() => {
      const slider = document.querySelector('[aria-label="BPM slider"]') as HTMLInputElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(slider, '80')
      slider.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await expect(page.getByText('80')).toBeVisible()
  })
})
