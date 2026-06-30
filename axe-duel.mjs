import { chromium } from '@playwright/test'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
// axe-core not a dep; load source from CDN-less fallback: try local, else fetch
async function getAxeSource() {
  try {
    return require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
  } catch {
    const res = await fetch('https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js')
    return await res.text()
  }
}

async function runAxe(page, label) {
  const src = await getAxeSource()
  await page.addScriptTag({ content: src })
  const results = await page.evaluate(async () => await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  }))
  const v = results.violations
  console.log(`\n=== ${label}: ${v.length} violations ===`)
  for (const item of v) {
    console.log(`  [${item.impact}] ${item.id}: ${item.help} (${item.nodes.length} nodes)`)
    for (const n of item.nodes) {
      console.log(`    target: ${n.target.join(' ')}`)
      console.log(`    html: ${n.html}`)
      console.log(`    why: ${n.failureSummary?.replace(/\n/g, ' ')}`)
    }
  }
  return v.length
}

const browser = await chromium.launch()
let total = 0
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ colorScheme: theme })
  const page = await ctx.newPage()
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
  await page.getByRole('tab', { name: 'Duel' }).click()
  total += await runAxe(page, `Duel setup (${theme})`)
  // into a turn
  await page.getByRole('button', { name: /start match/i }).click()
  total += await runAxe(page, `Duel P1 privacy gate (${theme})`)
  await page.getByRole('button', { name: /ready/i }).click()
  total += await runAxe(page, `Duel tap turn (${theme})`)
  await ctx.close()
}
await browser.close()
console.log(`\nTOTAL VIOLATIONS: ${total}`)
process.exit(total === 0 ? 0 : 1)
