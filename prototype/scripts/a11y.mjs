// Runs axe-core against each page in light and dark mode and fails on serious/critical issues.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
const BASE = process.env.BASE_URL ?? 'http://localhost:4173/'
const ROUTES = ['/', '/materials', '/exams', '/exams/2026-09-h2', '/materials/2026-09-h2-transform-set-a', '/materials/2026-09-h2-all-in-one', '/free', '/blog', '/blog/what-a-good-transform-question-changes', '/support', '/about']
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '<-loopback>,localhost,127.0.0.1' } : undefined
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', proxy })
let bad = 0
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: scheme, ignoreHTTPSErrors: true })
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  const page = await ctx.newPage()
  for (const r of ROUTES) {
    await page.goto(BASE + '#' + r)
    await page.waitForTimeout(1700)
    await page.addScriptTag({ content: axeSource })
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const out = await axe.run(document, { resultTypes: ['violations'] })
      return out.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') }))
    })
    if (res.length) {
      bad += res.length
      console.log(`[${scheme}] ${r}`, JSON.stringify(res))
    }
  }
  await ctx.close()
}
await browser.close()
console.log(bad ? `${bad} serious/critical issue groups` : 'axe: no serious or critical issues')
process.exit(bad ? 1 : 0)
