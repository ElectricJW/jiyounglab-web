import { useState } from 'react'
import { DemoNote, Field } from '../components/Overlays'
import { SheetPage } from '../components/Sheet'
import { Breadcrumbs, Button, ButtonLink, Icon, TypeBadge } from '../components/ui'
import { productById } from '../data/products'
import type { Product } from '../data/types'
import { packageBreakdown, personalPrice, won } from '../lib/format'
import { useRouter } from '../lib/router'
import { useStore } from '../lib/store'

type Receipt = 'none' | 'cash' | 'tax'

export function Checkout() {
  const { cart, demoEmail } = useStore()
  const { navigate } = useRouter()
  const [receipt, setReceipt] = useState<Receipt>('none')
  const [agree, setAgree] = useState(false)
  const items = cart.map((l) => productById.get(l.productId)).filter((p): p is Product => !!p)
  const total = items.reduce((a, p) => a + (personalPrice(p) ?? 0), 0)

  if (items.length === 0) {
    return (
      <div className="wrap max-w-xl pt-20 text-center">
        <h1 className="font-display text-[28px] font-semibold">구매 신청할 자료가 없습니다</h1>
        <p className="mt-2 text-ink-2">장바구니에 자료를 담은 뒤 다시 시도하세요.</p>
        <ButtonLink to="/materials" className="mt-6">
          자료 둘러보기
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '구매 신청' }]} />
      <h1 className="font-display text-[30px] font-semibold tracking-[-0.03em] md:text-[38px]">구매 신청</h1>
      <form
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]"
        onSubmit={(e) => {
          e.preventDefault()
          if (agree) navigate('/order/demo')
        }}
      >
        <div className="flex min-w-0 flex-col gap-10">
          <section>
            <h2 className="mb-4 text-[17px] font-semibold">구매자 정보</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="buyer-name" label="이름" defaultValue="김선생" />
              <Field id="buyer-email" label="이메일 (자료 안내를 받을 주소)" type="email" defaultValue={demoEmail ?? 'teacher@example.com'} />
            </div>
            <p className="mt-2 text-[12.5px] text-ink-3">데모 값이 미리 채워져 있습니다. 입력한 정보는 어디에도 저장되지 않습니다.</p>
          </section>

          <section>
            <h2 className="mb-4 text-[17px] font-semibold">결제 방법</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label htmlFor="pay-bank" className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-ink bg-surface p-4">
                <input id="pay-bank" type="radio" name="pay" defaultChecked className="mt-1 accent-[var(--ink)]" />
                <span>
                  <span className="block font-semibold">계좌이체</span>
                  <span className="block text-[13px] text-ink-2">신청 후 안내 계좌로 입금 → 확인되면 바로 다운로드</span>
                </span>
              </label>
              <div className="flex items-start gap-3 rounded-[12px] border border-dashed border-line-strong p-4 text-ink-3">
                <input type="radio" disabled aria-label="카드 · 간편결제 (준비 중)" className="mt-1" />
                <span>
                  <span className="block font-semibold">카드 · 간편결제</span>
                  <span className="block text-[13px]">준비 중입니다</span>
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-[17px] font-semibold">증빙</h2>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="증빙">
              {(
                [
                  ['none', '필요 없음'],
                  ['cash', '현금영수증'],
                  ['tax', '세금계산서'],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={receipt === v}
                  onClick={() => setReceipt(v)}
                  className={`h-10 rounded-full px-4 text-[14px] font-medium ${receipt === v ? 'bg-ink text-on-ink' : 'border border-line-strong bg-surface text-ink-2'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {receipt === 'cash' && (
              <div className="mt-4 max-w-sm">
                <Field id="cash-no" label="휴대폰 번호 또는 현금영수증 카드번호" placeholder="010-0000-0000" />
              </div>
            )}
            {receipt === 'tax' && (
              <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
                <Field id="tax-biz" label="사업자등록번호" placeholder="000-00-00000" />
                <Field id="tax-name" label="상호 (학원명)" placeholder="○○영어학원" />
              </div>
            )}
            <p className="mt-3 text-[12.5px] text-ink-3">입금 확인 후 영업일 1일 안에 발행합니다.</p>
          </section>

          <section className="rounded-[14px] border border-line bg-surface p-5">
            <h2 className="mb-3 text-[15px] font-semibold">디지털 자료 환불 안내</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-2">
              <li>다운로드 전에는 구매 후 7일 이내 전액 환불됩니다.</li>
              <li>파일을 한 번이라도 내려받으면 전자상거래법에 따라 청약철회가 제한됩니다.</li>
              <li>구매 전 샘플과 미리보기로 자료 구성을 확인해 주세요.</li>
            </ul>
            <label htmlFor="agree" className="mt-4 flex cursor-pointer items-start gap-2.5 text-[14px] font-medium">
              <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-4 accent-[var(--ink)]" />
              위 내용을 확인했으며, 다운로드 후 청약철회가 제한되는 것에 동의합니다.
            </label>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[16px] border border-line bg-surface p-5">
            <h2 className="text-[15px] font-semibold">
              주문 자료 <span className="num text-ink-3">{items.length}</span>
            </h2>
            <ul className="mt-4 flex flex-col gap-4 border-b border-line pb-4">
              {items.map((p) => (
                <li key={p.id} className="flex gap-3">
                  <div className="w-11 shrink-0 self-start shadow-sheet">
                    <SheetPage product={p.type === 'package' ? packageBreakdown(p).items[0] : p} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <TypeBadge type={p.type} />
                    <p className="text-[13.5px] font-semibold leading-snug">{p.title}</p>
                  </div>
                  <span className="num text-[13.5px] font-semibold">{won(personalPrice(p) ?? 0)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between pt-4">
              <span className="text-[14px] text-ink-2">입금하실 금액</span>
              <span className="num font-display text-[28px] font-semibold tracking-[-0.03em]">{won(total)}</span>
            </div>
            <Button type="submit" variant="buy" size="lg" className="mt-4 w-full" disabled={!agree}>
              구매 신청하기
            </Button>
            {!agree && <p className="mt-2 text-center text-[12.5px] text-ink-3">환불 안내에 동의하면 신청할 수 있습니다.</p>}
          </div>
        </aside>
      </form>
    </div>
  )
}

export function OrderDemo() {
  const { cart, clear } = useStore()
  const items = cart.map((l) => productById.get(l.productId)).filter((p): p is Product => !!p)
  const total = items.reduce((a, p) => a + (personalPrice(p) ?? 0), 0)
  const steps = [
    ['구매 신청 접수', '주문번호(예: JY-20261004-0007)와 입금 안내가 화면과 이메일로 전달됩니다.'],
    ['계좌로 입금', `안내 계좌로 ${won(total)}을 입금합니다. 입금자명은 신청 시 이름과 같아야 확인이 빠릅니다.`],
    ['입금 확인', '지영랩이 입금을 확인하면 다운로드 권한이 열리고 알림 메일이 갑니다.'],
    ['내 자료실에서 다운로드', '자료는 내 자료실에 계속 보관되고, 수정판이 나오면 최신본을 받습니다.'],
  ]
  return (
    <div className="wrap max-w-3xl pt-14">
      <div className="rounded-[18px] border border-dashed border-omr bg-omr-soft p-6 md:p-8">
        <p className="font-mono text-[12px] tracking-[0.1em] text-omr">DEMO · 프로토타입</p>
        <h1 className="mt-2 font-display text-[28px] font-semibold leading-snug tracking-[-0.03em] md:text-[34px]">여기까지가 프로토타입의 구매 흐름입니다</h1>
        <p className="mt-3 text-[15px] text-ink-2">
          실제 주문은 만들어지지 않았고, 결제·이메일 발송·개인정보 저장도 일어나지 않았습니다. 출시 사이트에서 이 다음에 일어날 일은 아래와 같습니다.
        </p>
      </div>

      <ol className="mt-10 flex flex-col">
        {steps.map(([t, d], i) => (
          <li key={t} className="grid grid-cols-[40px_1fr] gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <span className={`num grid size-10 place-items-center rounded-full font-mono text-[14px] ${i === 0 ? 'bg-ink text-on-ink' : 'border border-line-strong'}`}>
                {i + 1}
              </span>
              {i < steps.length - 1 && <span className="mt-2 w-px flex-1 bg-line-strong" />}
            </div>
            <div className="pt-1.5">
              <p className="text-[16px] font-semibold">{t}</p>
              <p className="mt-1 text-[14.5px] text-ink-2">{d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <DemoNote>온라인 카드·간편결제는 결제대행사(PG) 계약 후 같은 주문 구조 위에 추가됩니다. 그때는 2–3단계가 자동으로 처리됩니다.</DemoNote>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/materials">
          계속 둘러보기 <Icon name="arrow" size={16} />
        </ButtonLink>
        <Button variant="outline" onClick={clear}>
          장바구니 비우기
        </Button>
      </div>
    </div>
  )
}
