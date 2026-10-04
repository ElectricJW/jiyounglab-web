// Click-through smoke test of the demo journeys against a running preview server.
// Usage: npm run build && (npx vite preview --port 4173 &) && npm run smoke
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/'
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '<-loopback>,localhost,127.0.0.1' } : undefined
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium', proxy })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, ignoreHTTPSErrors: true })
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && !m.text().includes('fonts.g') && !m.text().includes('ERR_FAILED') && errors.push(m.text()))

let failed = 0
async function step(name, fn) {
  try {
    await fn()
    console.log('  ✓', name)
  } catch (e) {
    failed++
    console.log('  ✗', name, '-', e.message.split('\n')[0])
  }
}
const expectText = async (text) => page.getByText(text, { exact: false }).first().waitFor({ timeout: 4000 })

await page.goto(BASE + '#/')

await step('home renders hero and season cards', async () => {
  await expectText('구분하는 문제')
  await expectText('이번 시험 자료')
})

await step('home → exam hub via hero CTA', async () => {
  await page.getByRole('link', { name: /2026 고2 9월 자료 보기/ }).click()
  await expectText('어떤 자료가 몇 번을 다루나요')
})

await step('hub tab filters to Vocabulary', async () => {
  await page.getByRole('tab', { name: 'Vocabulary' }).click()
  await expectText('어휘 리스트 420')
})

await step('catalog filter by Grammar narrows results', async () => {
  await page.goto(BASE + '#/materials')
  await page.getByRole('checkbox', { name: /^Grammar/ }).check()
  const count = await page.locator('main a[href^="#/materials/"]').count()
  if (count !== 5) throw new Error(`expected 5 grammar items (4 units + 1 free), got ${count}`)
})

await step('catalog search finds 관계사', async () => {
  await page.goto(BASE + '#/materials?q=관계사')
  await expectText('Unit 07 관계사')
})

await step('product detail: sample viewer opens and locks later pages', async () => {
  await page.goto(BASE + '#/materials/2026-09-h2-transform-set-a')
  await page.getByRole('button', { name: /샘플 크게 보기/ }).click()
  await page.getByRole('tab').nth(3).click()
  await expectText('구매 후 전체')
  await page.keyboard.press('Escape')
})

await step('academy license switches CTA to quote inquiry', async () => {
  await page.getByLabel(/학원용/).check()
  await page.getByRole('button', { name: /학원용 견적 문의/ }).click()
  await page.getByRole('button', { name: '견적 요청하기' }).click()
  await expectText('문의가 실제로 접수되거나 전송되지 않았습니다')
  await page.keyboard.press('Escape')
})

await step('buy now → checkout → demo order state', async () => {
  await page.getByLabel(/개인용/).check()
  await page.getByRole('button', { name: '바로 구매 신청' }).click()
  await expectText('디지털 자료 환불 안내')
  const submit = page.getByRole('button', { name: '구매 신청하기' })
  if (!(await submit.isDisabled())) throw new Error('submit should be disabled before consent')
  await page.getByLabel(/청약철회가 제한되는 것에 동의/).check()
  await submit.click()
  await expectText('여기까지가 프로토타입의 구매 흐름입니다')
})

await step('cart suggests the package when two of its items are added', async () => {
  await page.goto(BASE + '#/materials/2026-09-h2-vocabulary')
  await page.getByRole('button', { name: /^장바구니$/ }).click()
  await expectText('패키지로 바꾸면 더 저렴합니다')
  await page.getByRole('button', { name: '패키지로 바꾸기' }).click()
  await expectText('올인원 패키지')
  await page.keyboard.press('Escape')
})

await step('free resource claim: email → code → library (demo)', async () => {
  await page.goto(BASE + '#/free')
  await page.getByRole('button', { name: /무료로 받기/ }).first().click()
  await page.getByRole('button', { name: '인증 코드 받기' }).click()
  await page.locator('#claim-code').fill('123456')
  await page.getByRole('button', { name: '로그인하고 받기' }).click()
  await expectText('내 자료실에 추가했습니다')
  await page.keyboard.press('Escape')
})

await step('blog post renders body and inline CTAs', async () => {
  await page.goto(BASE + '#/blog/what-a-good-transform-question-changes')
  await expectText('설계 4단계')
  await expectText('이 글에서 다룬 자료')
})

await step('unknown route shows 404', async () => {
  await page.goto(BASE + '#/nope')
  await expectText('찾는 페이지가 없습니다')
})

await step('every internal link resolves to a real page', async () => {
  const routes = new Set()
  for (const start of ['#/', '#/materials', '#/exams', '#/free', '#/blog']) {
    await page.goto(BASE + start)
    await page.waitForTimeout(150)
    for (const h of await page.$$eval('a[href^="#/"]', (as) => as.map((a) => a.getAttribute('href')))) routes.add(h)
  }
  const broken = []
  for (const r of routes) {
    await page.goto(BASE + r)
    await page.waitForTimeout(60)
    if (await page.getByText('찾는 페이지가 없습니다').count()) broken.push(r)
  }
  console.log(`    checked ${routes.size} links`)
  if (broken.length) throw new Error('broken: ' + broken.join(', '))
})

await browser.close()
if (errors.length) {
  console.log('page errors:', errors)
  failed++
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed')
process.exit(failed ? 1 : 0)
