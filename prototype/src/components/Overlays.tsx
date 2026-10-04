import { useEffect, useRef, useState, type ReactNode } from 'react'
import { productById, products } from '../data/products'
import type { Product } from '../data/types'
import { packageBreakdown, personalPrice, won } from '../lib/format'
import { useRouter } from '../lib/router'
import { useStore } from '../lib/store'
import { SheetPage, sheetPageCount } from './Sheet'
import { Button, Icon, TypeBadge } from './ui'

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  useEscape(onClose)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-[rgb(10_15_25/0.55)] backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        className={`anim-rise relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-pop outline-none sm:rounded-2xl ${
          wide ? 'sm:max-w-5xl' : 'sm:max-w-md'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <p className="min-w-0 truncate font-semibold">{title}</p>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg hover:bg-surface-2" aria-label="닫기">
            <Icon name="x" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg border border-dashed border-line-strong bg-surface-2 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-omr" />
      <span>{children}</span>
    </p>
  )
}

/* ── Sample viewer ───────────────────────────────────────────────────── */

function SampleViewer({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add, has, setCartOpen } = useStore()
  const [page, setPage] = useState(0)
  const [notice, setNotice] = useState(false)
  const total = sheetPageCount(product)
  const freeVisible = product.access === 'free' ? Math.min(total, 3) : 2
  const thumbs = Array.from({ length: Math.min(total, 6) }, (_, i) => i)
  const locked = page >= freeVisible
  return (
    <Modal title={`샘플 보기 · ${product.title}`} onClose={onClose} wide>
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_260px] md:p-6">
        <div className="min-w-0">
          <div className="relative mx-auto max-w-[560px] shadow-sheet">
            <div className={locked ? 'pointer-events-none select-none blur-[5px]' : ''}>
              <SheetPage product={product} page={page} />
            </div>
            {locked && (
              <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_srgb,var(--sheet)_35%,transparent)] p-6 text-center">
                <div className="max-w-[260px] rounded-xl bg-surface p-5 text-ink shadow-pop">
                  <Icon name="lock" size={22} className="mx-auto text-ink-3" />
                  <p className="mt-2 font-semibold">구매 후 전체 {total}쪽을 받을 수 있습니다</p>
                  <p className="mt-1 text-[13px] text-ink-2">샘플은 앞 {freeVisible}쪽까지 공개됩니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <aside className="flex min-w-0 flex-col gap-4">
          <div>
            <TypeBadge type={product.type} />
            <p className="mt-2 text-[14px] font-semibold leading-snug">{product.title}</p>
            {product.sampleNote && <p className="mt-1 text-[13px] text-ink-2">샘플 구성: {product.sampleNote}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="페이지">
            {thumbs.map((i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={page === i}
                onClick={() => setPage(i)}
                className={`relative overflow-hidden rounded-md border-2 transition ${page === i ? 'border-ink' : 'border-transparent opacity-80 hover:opacity-100'}`}
              >
                <div className={i >= freeVisible ? 'blur-[2px]' : ''}>
                  <SheetPage product={product} page={i} />
                </div>
                {i >= freeVisible && (
                  <span className="absolute inset-0 grid place-items-center text-ink-2">
                    <Icon name="lock" size={14} />
                  </span>
                )}
                <span className="num absolute bottom-0.5 right-1 font-mono text-[9px] text-sheet-mute">{i + 1}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <Button variant="outline" onClick={() => setNotice(true)}>
              <Icon name="download" size={16} /> 샘플 PDF 받기
            </Button>
            {product.access === 'paid' && (
              <Button
                variant="primary"
                onClick={() => {
                  if (!has(product.id)) add(product.id)
                  onClose()
                  setCartOpen(true)
                }}
              >
                {has(product.id) ? '장바구니 보기' : '장바구니 담기'}
              </Button>
            )}
            {notice && <DemoNote>프로토타입에서는 실제 파일을 내려받지 않습니다. 출시 후에는 로그인 없이 샘플 PDF를 바로 받습니다.</DemoNote>}
          </div>
        </aside>
      </div>
    </Modal>
  )
}

/* ── Free resource claim: email code login (demo) ────────────────────── */

function FreeClaim({ product, onClose }: { product: Product; onClose: () => void }) {
  const { demoEmail, setDemoEmail, addToLibrary } = useStore()
  const [step, setStep] = useState<'email' | 'code' | 'done'>(demoEmail ? 'done' : 'email')
  const [email, setEmail] = useState('teacher@example.com')
  const [code, setCode] = useState('')
  const [consent, setConsent] = useState(true)
  const { navigate } = useRouter()

  useEffect(() => {
    if (step === 'done') addToLibrary([product.id])
  }, [step, product.id, addToLibrary])

  return (
    <Modal title="무료자료 받기" onClose={onClose}>
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-3 rounded-xl bg-free-soft p-3">
          <div className="w-12 shrink-0 shadow-sheet">
            <SheetPage product={product} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-free">무료자료</p>
            <p className="truncate text-[14px] font-semibold">{product.title}</p>
          </div>
        </div>

        {step === 'email' && (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              setStep('code')
            }}
          >
            <p className="text-[14px] text-ink-2">이메일로 받은 6자리 코드로 로그인합니다. 비밀번호는 필요 없습니다.</p>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor="claim-email">
              이메일
              <input
                id="claim-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-[10px] border border-line-strong bg-surface px-3 text-[15px] font-normal outline-none focus:border-ink"
              />
            </label>
            <label className="flex items-start gap-2 text-[13px] text-ink-2" htmlFor="claim-consent">
              <input id="claim-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-[var(--free)]" />
              (선택) 새 시험 자료가 나오면 이메일로 알림 받기
            </label>
            <Button type="submit" variant="primary" size="lg">
              인증 코드 받기
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              setDemoEmail(email)
              setStep('done')
            }}
          >
            <p className="text-[14px] text-ink-2">
              <b className="text-ink">{email}</b>로 보낸 6자리 코드를 입력하세요.
            </p>
            <input
              id="claim-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="num h-14 rounded-[10px] border border-line-strong bg-surface text-center font-mono text-[24px] tracking-[0.5em] outline-none focus:border-ink"
            />
            <DemoNote>데모: 실제 이메일은 발송되지 않습니다. 아무 숫자나 입력하고 계속하세요.</DemoNote>
            <Button type="submit" variant="primary" size="lg" disabled={code.length < 6}>
              로그인하고 받기
            </Button>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-free">
              <span className="grid size-7 place-items-center rounded-full bg-free text-on-ink">
                <Icon name="check" size={16} />
              </span>
              <p className="font-semibold">내 자료실에 추가했습니다</p>
            </div>
            <p className="text-[14px] text-ink-2">
              출시 사이트에서는 이 화면에서 바로 다운로드가 시작되고, 수정판이 나오면 내 자료실에서 최신본을 받습니다.
            </p>
            <DemoNote>데모: 실제 계정이나 파일이 만들어지지 않았습니다.</DemoNote>
            <Button
              variant="outline"
              onClick={() => {
                onClose()
                navigate('/materials?collection=' + (product.collections[0] ?? ''))
              }}
            >
              관련 유료 자료 보기 <Icon name="arrow" size={16} />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ── Academy license inquiry (demo) ──────────────────────────────────── */

function AcademyInquiry({ product, onClose }: { product?: Product; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <Modal title="학원용 라이선스 견적 문의" onClose={onClose}>
      <div className="p-5">
        {sent ? (
          <div className="flex flex-col gap-3">
            <p className="font-semibold">문의 내용을 확인했습니다</p>
            <p className="text-[14px] text-ink-2">출시 사이트에서는 영업일 1일 안에 강사 수에 맞춘 견적과 계좌 안내를 이메일로 보내드립니다.</p>
            <DemoNote>데모: 문의가 실제로 접수되거나 전송되지 않았습니다.</DemoNote>
            <Button variant="primary" onClick={onClose}>
              닫기
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            <p className="text-[14px] text-ink-2">
              강사 여러 명이 같은 자료를 쓰는 학원은 학원용 라이선스로 구매합니다. 강사 수와 필요한 자료를 알려주시면 견적을 드립니다.
            </p>
            {product && (
              <p className="rounded-lg bg-surface-2 px-3 py-2 text-[13px]">
                <span className="text-ink-3">문의 자료</span> {product.title}
              </p>
            )}
            <Field id="ac-name" label="학원명" placeholder="예: ○○영어학원" />
            <Field id="ac-seats" label="사용 강사 수" placeholder="예: 4" type="number" />
            <Field id="ac-email" label="회신받을 이메일" placeholder="name@academy.kr" type="email" />
            <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor="ac-tax">
              증빙
              <select id="ac-tax" className="h-11 rounded-[10px] border border-line-strong bg-surface px-3 text-[14px] font-normal">
                <option>세금계산서</option>
                <option>현금영수증 (지출증빙)</option>
                <option>필요 없음</option>
              </select>
            </label>
            <Button type="submit" variant="primary" size="lg">
              견적 요청하기
            </Button>
          </form>
        )}
      </div>
    </Modal>
  )
}

export function Field({ id, label, placeholder, type = 'text', defaultValue }: { id: string; label: string; placeholder?: string; type?: string; defaultValue?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-11 rounded-[10px] border border-line-strong bg-surface px-3 text-[14px] font-normal outline-none placeholder:text-ink-3 focus:border-ink"
      />
    </label>
  )
}

/* ── Cart drawer ─────────────────────────────────────────────────────── */

function CartDrawer() {
  const { cart, remove, add, setCartOpen } = useStore()
  const { navigate } = useRouter()
  const close = () => setCartOpen(false)
  useEscape(close)
  const items = cart.map((l) => productById.get(l.productId)).filter((p): p is Product => !!p)
  const subtotal = items.reduce((a, p) => a + (personalPrice(p) ?? 0), 0)

  // Suggest a package when two or more of its items are already in the cart.
  const suggestion = products
    .filter((p) => p.type === 'package' && !cart.some((l) => l.productId === p.id))
    .map((p) => {
      const b = packageBreakdown(p)
      const inCart = b.items.filter((i) => cart.some((l) => l.productId === i.id))
      const inCartSum = inCart.reduce((a, i) => a + (personalPrice(i) ?? 0), 0)
      return { p, b, inCart, inCartSum }
    })
    .find((s) => s.inCart.length >= 2)

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="장바구니">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-[rgb(10_15_25/0.45)]" onClick={close} />
      <aside className="anim-rise absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-surface shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-5 py-4" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))' }}>
          <p className="font-semibold">
            장바구니 <span className="num text-ink-3">{items.length}</span>
          </p>
          <button type="button" onClick={close} className="grid size-9 place-items-center rounded-lg hover:bg-surface-2" aria-label="닫기">
            <Icon name="x" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-ink-2">
              <div>
                <p className="font-semibold text-ink">장바구니가 비어 있습니다</p>
                <p className="mt-1 text-[14px]">이번 시험 자료부터 둘러보세요.</p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => {
                    close()
                    navigate('/exams/2026-09-h2')
                  }}
                >
                  2026 고2 9월 자료 보기
                </Button>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((p) => (
                <li key={p.id} className="flex gap-3">
                  <div className="w-14 shrink-0 self-start shadow-sheet">
                    <SheetPage product={p.type === 'package' ? packageBreakdown(p).items[0] : p} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <TypeBadge type={p.type} />
                    <p className="mt-0.5 text-[14px] font-semibold leading-snug">{p.title}</p>
                    <p className="text-[12px] text-ink-3">개인용 라이선스</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="num text-[14px] font-semibold">{won(personalPrice(p) ?? 0)}</span>
                    <button type="button" onClick={() => remove(p.id)} className="text-[12px] text-ink-3 underline-offset-2 hover:text-ink hover:underline">
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {suggestion && (
            <div className="mt-6 rounded-xl border border-ink p-4">
              <p className="text-[12px] font-semibold text-omr">패키지로 바꾸면 더 저렴합니다</p>
              <p className="mt-1 text-[14px] font-semibold">{suggestion.p.title}</p>
              <p className="mt-1 text-[13px] text-ink-2">
                담은 {suggestion.inCart.length}종({won(suggestion.inCartSum)}) 대신 {suggestion.b.items.length}종 전체를 {won(suggestion.b.price)}에 받습니다.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  suggestion.inCart.forEach((i) => remove(i.id))
                  add(suggestion.p.id)
                }}
              >
                패키지로 바꾸기
              </Button>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-line px-5 py-4" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-[14px] text-ink-2">합계</span>
              <span className="num text-[20px] font-semibold">{won(subtotal)}</span>
            </div>
            <Button
              variant="buy"
              size="lg"
              className="w-full"
              onClick={() => {
                close()
                navigate('/checkout')
              }}
            >
              구매 신청하기
            </Button>
            <p className="mt-2 text-center text-[12px] text-ink-3">계좌이체 · 입금 확인 후 내 자료실에서 바로 다운로드</p>
          </div>
        )}
      </aside>
    </div>
  )
}

export function Overlays() {
  const { dialog, openDialog, cartOpen } = useStore()
  const close = () => openDialog(null)
  const product = dialog && 'productId' in dialog && dialog.productId ? productById.get(dialog.productId) : undefined
  return (
    <>
      {cartOpen && <CartDrawer />}
      {dialog?.kind === 'sample' && product && <SampleViewer product={product} onClose={close} />}
      {dialog?.kind === 'free-claim' && product && <FreeClaim product={product} onClose={close} />}
      {dialog?.kind === 'academy' && <AcademyInquiry product={product} onClose={close} />}
    </>
  )
}
