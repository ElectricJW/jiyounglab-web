import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, Link } from '../lib/router'
import { useStore } from '../lib/store'
import { Logo } from './Cards'
import { Icon } from './ui'

const NAV = [
  { to: '/exams', label: '시험별 자료', match: '/exams' },
  { to: '/materials', label: '전체 자료', match: '/materials' },
  { to: '/free', label: '무료자료', match: '/free' },
  { to: '/blog', label: '블로그', match: '/blog' },
  { to: '/about', label: '지영랩 소개', match: '/about' },
]

function Header() {
  const { path, navigate } = useRouter()
  const { cart, setCartOpen } = useStore()
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!menu) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setMenu(false)
    navigate(q.trim() ? `/materials?q=${encodeURIComponent(q.trim())}` : '/materials')
  }

  return (
    <header
      className="sticky z-40 border-b border-line bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-md"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="wrap flex h-16 items-center gap-6">
        <Link to="/" aria-label="지영랩 홈" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = path.startsWith(n.match)
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-lg px-3 py-2 text-[14px] font-medium transition ${active ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={active ? 'border-b-2 border-omr pb-1' : ''}>{n.label}</span>
              </Link>
            )
          })}
        </nav>
        <form onSubmit={submit} className="ml-auto hidden min-w-0 flex-1 justify-end md:flex" role="search">
          <label className="flex h-10 w-full max-w-[280px] items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-ink-3 focus-within:border-ink">
            <Icon name="search" size={16} />
            <input
              id="header-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="시험, 교재, 문법 단원 검색"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link to="/support" className="hidden h-10 items-center gap-1.5 rounded-lg px-3 text-[13.5px] text-ink-2 hover:text-ink sm:inline-flex">
            <Icon name="user" size={17} />
            로그인
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative grid size-10 place-items-center rounded-lg text-ink hover:bg-surface-2"
            aria-label={`장바구니 ${cart.length}개`}
          >
            <Icon name="cart" size={20} />
            {cart.length > 0 && (
              <span className="num absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-omr px-1 text-[10.5px] font-bold leading-[18px] text-omr-ink">
                {cart.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            className="grid size-10 place-items-center rounded-lg text-ink hover:bg-surface-2 lg:hidden"
            aria-label="메뉴"
            aria-expanded={menu}
          >
            <Icon name={menu ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>
      {menu && (
        <div className="border-t border-line bg-paper lg:hidden">
          <div className="wrap flex flex-col gap-1 py-4">
            <form onSubmit={submit} role="search" className="mb-2 md:hidden">
              <label className="flex h-11 items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-ink-3">
                <Icon name="search" size={16} />
                <input
                  id="mobile-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="시험, 교재, 문법 단원 검색"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
                />
              </label>
            </form>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMenu(false)}
                className="flex items-center justify-between rounded-lg px-2 py-3 text-[16px] font-medium"
              >
                {n.label}
                <Icon name="chevron" size={16} className="text-ink-3" />
              </Link>
            ))}
            <Link to="/support" onClick={() => setMenu(false)} className="flex items-center justify-between rounded-lg px-2 py-3 text-[16px] font-medium">
              고객센터 · 학원 문의
              <Icon name="chevron" size={16} className="text-ink-3" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="min-w-0">
          <Logo />
          <p className="mt-4 max-w-sm text-[13.5px] text-ink-2">
            가르치는 사람을 위한 중·고등 영어 교육자료. 시험과 교재 단위로 찾고, 샘플로 확인하고, 바로 받습니다.
          </p>
        </div>
        <FooterCol
          title="자료"
          links={[
            ['/exams', '시험별 자료'],
            ['/materials?type=grammar', 'Grammar'],
            ['/materials?type=vocab', 'Vocabulary'],
            ['/free', '무료자료'],
          ]}
        />
        <FooterCol
          title="지영랩"
          links={[
            ['/about', '제작 원칙'],
            ['/blog', '블로그'],
            ['/support', '학원 라이선스 문의'],
            ['/support', '고객센터'],
          ]}
        />
        <FooterCol
          title="정책"
          links={[
            ['/support', '이용약관'],
            ['/support', '개인정보처리방침'],
            ['/support', '환불 정책'],
            ['/support', '자료 이용 라이선스'],
          ]}
        />
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-6 text-[12px] leading-relaxed text-ink-3 md:flex-row md:justify-between">
          <p>
            상호 지영랩(JIYOUNGLAB) · 대표 ○○○ · 사업자등록번호 000-00-00000 · 통신판매업 신고 제0000-○○○○-0000호
            <br />
            주소 ○○시 ○○구 ○○로 00 · 고객센터 help@jiyounglab.example
          </p>
          <p className="font-mono">© 2026 JIYOUNGLAB</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2.5 text-[14px]">
        {links.map(([to, label]) => (
          <li key={label}>
            <Link to={to} className="text-ink-2 hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PrototypeChip() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-[calc(92px+env(safe-area-inset-bottom,0px))] left-3 z-50 lg:bottom-[calc(12px+env(safe-area-inset-bottom,0px))]">
      {open && (
        <div className="mb-2 w-[280px] rounded-xl border border-line bg-surface p-4 text-[12.5px] leading-relaxed text-ink-2 shadow-pop">
          <p className="mb-1 font-semibold text-ink">지영랩 웹사이트 프로토타입</p>
          화면의 상품·가격·글은 모두 데모 데이터입니다. 결제, 주문, 회원가입, 이메일 발송은 실제로 일어나지 않습니다.
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 font-mono text-[11px] tracking-[0.08em] text-ink-2 shadow-sheet"
        aria-expanded={open}
      >
        <span className="size-1.5 rounded-full bg-omr" />
        PROTOTYPE
      </button>
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <button
        type="button"
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-surface focus:p-2"
      >
        본문으로 건너뛰기
      </button>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <PrototypeChip />
    </div>
  )
}
