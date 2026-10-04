// Captures desktop + mobile screenshots of every prototype page.
// Usage: npm run build && (npx vite preview --port 4173 &) && npm run screenshots
import { chromium } from 'playwright'

import { execFileSync } from 'node:child_process'
// Chromium cannot tunnel Google Fonts through this sandbox's proxy; fetch them with curl instead.
async function routeFonts(ctx) {
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    const url = route.request().url()
    try {
      const body = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36', url], { maxBuffer: 64 << 20 })
      const type = url.includes('googleapis') ? 'text/css' : 'font/woff2'
      await route.fulfill({ body, headers: { 'content-type': type, 'access-control-allow-origin': '*' } })
    } catch {
      await route.abort()
    }
  })
}
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/'
const OUT = 'screenshots'
const ROUTES = [
  ['home', '/'],
  ['catalog', '/materials'],
  ['exams', '/exams'],
  ['collection', '/exams/2026-09-h2'],
  ['product', '/materials/2026-09-h2-transform-set-a'],
  ['package', '/materials/2026-09-h2-all-in-one'],
  ['free', '/free'],
  ['blog', '/blog'],
  ['post', '/blog/what-a-good-transform-question-changes'],
  ['about', '/about'],
  ['support', '/support'],
]

const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '<-loopback>,localhost,127.0.0.1' } : undefined
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  proxy,
})
mkdirSync(OUT, { recursive: true })

const shots = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, scheme: 'light' },
  { name: 'mobile', viewport: { width: 390, height: 844 }, scheme: 'light', isMobile: true },
]
const only = process.argv[2]

for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: s.viewport,
    deviceScaleFactor: s.isMobile ? 2 : 1,
    isMobile: !!s.isMobile,
    colorScheme: s.scheme,
    ignoreHTTPSErrors: true,
  })
  await routeFonts(ctx)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  for (const [name, route] of ROUTES) {
    if (only && only !== name) continue
    await page.goto(BASE + '#' + route, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1800)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 0) console.warn(`[overflow] ${s.name} ${name}: ${overflow}px`)
    try { await page.screenshot({ path: `${OUT}/${s.name}-${name}.png`, fullPage: true, timeout: 90000 }) } catch (e) { console.warn('[shot failed]', s.name, name, e.message.split('\n')[0]) }
  }
  if (errors.length) console.warn(`[errors] ${s.name}:`, errors)
  await ctx.close()
}

// Dark-mode spot check of the home page
const dark = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', ignoreHTTPSErrors: true })
await routeFonts(dark)
const dp = await dark.newPage()
await dp.goto(BASE + '#/', { waitUntil: 'networkidle' })
await dp.waitForTimeout(1800)
await dp.screenshot({ path: `${OUT}/desktop-home-dark.png`, fullPage: false })
await browser.close()
console.log('screenshots written to', OUT)
