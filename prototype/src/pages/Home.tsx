import { CollectionCard, ProductCard } from '../components/Cards'
import { SheetPage } from '../components/Sheet'
import { Button, ButtonLink, Icon, SectionHead, Tag, TypeBadge } from '../components/ui'
import { collectionByKey, collections } from '../data/collections'
import { posts } from '../data/posts'
import { productById, products } from '../data/products'
import type { MaterialType } from '../data/types'
import { packageBreakdown, personalPrice, typeLabel, typeVar, won } from '../lib/format'
import { Link } from '../lib/router'
import { useStore } from '../lib/store'

const setA = productById.get('p-2609h2-ta')!
const pkg = productById.get('p-2609h2-pkg')!

function Hero() {
  const { openDialog } = useStore()
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="wrap grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="min-w-0">
          <p className="eyebrow mb-5">중·고등 영어 교육자료 · 가르치는 분들을 위해</p>
          <h1 className="font-display text-[38px] font-semibold leading-[1.22] tracking-[-0.035em] sm:text-[48px] lg:text-[56px]">
            지문을 외운 학생과
            <br />
            <span className="relative whitespace-nowrap">
              이해한 학생
              <svg className="absolute -bottom-1 left-0 h-3 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8 Q 60 2 110 7 T 198 5" fill="none" stroke="var(--omr)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            을
            <br />
            구분하는 문제.
          </h1>
          <p className="mt-7 max-w-xl text-[16.5px] leading-[1.8] text-ink-2">
            지영랩은 모의고사와 교과서 지문을 원래 문항과 다른 각도에서 다시 묻는 변형문제, 어휘, 문법 자료를 만듭니다. 모든 자료는 샘플을 먼저
            공개하고, 수정판은 구매하신 분께 자동으로 반영됩니다.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink to="/exams/2026-09-h2" size="lg">
              2026 고2 9월 자료 보기 <Icon name="arrow" size={17} />
            </ButtonLink>
            <Button variant="outline" size="lg" onClick={() => openDialog({ kind: 'sample', productId: setA.id })}>
              <Icon name="eye" size={17} /> 샘플 먼저 보기
            </Button>
          </div>
          <ul className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 text-[13.5px] text-ink-2 sm:grid-cols-4">
            {['샘플 공개', 'HWP 편집본', '수정판 자동 반영', '학원용 라이선스'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Icon name="check" size={15} className="text-free" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] pb-6 lg:pb-0">
          <div className="absolute right-[2%] top-[4%] w-[78%] rotate-[4deg] opacity-90 shadow-sheet" aria-hidden="true">
            <SheetPage product={setA} page={1} />
          </div>
          <div className="relative w-[86%] -rotate-[1.5deg] shadow-pop">
            <SheetPage product={setA} marked />
          </div>
          <div className="absolute -bottom-2 right-0 w-[min(250px,62%)] rounded-xl border border-line bg-surface p-3.5 shadow-pop sm:right-[2%]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-ink-3">{setA.code}</span>
              <Tag tone="free">v1.2 반영됨</Tag>
            </div>
            <ol className="mt-2.5 space-y-1.5 border-l border-line pl-3 text-[12px]">
              {setA.changelog.slice(0, 2).map((c) => (
                <li key={c.version} className="relative">
                  <span className="absolute -left-[15.5px] top-1.5 size-2 rounded-full border-2 border-surface bg-ink" />
                  <span className="font-mono text-ink-3">{c.version}</span> {c.note}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function Season() {
  const seasonal = collections.filter((c) => c.isSeasonal)
  return (
    <section className="wrap pt-20">
      <SectionHead
        eyebrow="2026년 9월 · 지금 수업하는 시험"
        title="이번 시험 자료"
        desc="9월 모의고사 직후 2주, 2학기 중간고사 범위와 겹치는 시기에 맞춰 준비했습니다."
        action={
          <Link to="/exams" className="inline-flex items-center gap-1 text-[14px] font-semibold hover:underline">
            시험별 전체 보기 <Icon name="arrow" size={15} />
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {seasonal.map((c, i) => (
          <CollectionCard key={c.key} collection={c} tone={i === 0 ? 'feature' : 'default'} />
        ))}
      </div>
    </section>
  )
}

const TYPES: MaterialType[] = ['transform', 'vocab', 'grammar', 'writing', 'analysis', 'package']
const typeDesc: Record<MaterialType, string> = {
  transform: '원 문항과 다른 유형으로 다시 묻기',
  vocab: '지문 순서 어휘 + Daily Test',
  grammar: '한 단원을 한 번에 끝내는 워크시트',
  writing: '조건 영작 · 요약 · 채점 기준 포함',
  analysis: '끊어 읽기 · 어법 포인트 · 주제문',
  package: '한 회차를 통째로, 더 저렴하게',
}

function Browse() {
  const tb = [collectionByKey.get('textbook:donga-yoon:m3')!, collectionByKey.get('textbook:ne-common1:h1')!, collectionByKey.get('curriculum:grammar-core')!]
  return (
    <section className="wrap pt-24">
      <SectionHead eyebrow="찾는 방법" title="시험으로, 교재로, 자료 유형으로" />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-3">
          {TYPES.map((t) => {
            const count = products.filter((p) => p.type === t && p.access === 'paid').length
            return (
              <Link key={t} to={`/materials?type=${t}`} className="group flex min-w-0 flex-col gap-2 bg-surface p-5 transition hover:bg-surface-2">
                <span className="size-2.5 rounded-full" style={{ background: typeVar[t] }} aria-hidden="true" />
                <span className="text-[16px] font-semibold">{typeLabel[t]}</span>
                <span className="text-[13px] leading-snug text-ink-2">{typeDesc[t]}</span>
                <span className="num mt-auto pt-2 font-mono text-[11.5px] text-ink-3 group-hover:text-ink">{count}종 →</span>
              </Link>
            )
          })}
        </div>
        <div className="flex flex-col gap-3">
          <p className="eyebrow">교과서 · 자체 커리큘럼</p>
          {tb.map((c) => (
            <Link
              key={c.key}
              to={`/exams/${c.slug}`}
              className="group flex items-center justify-between gap-4 rounded-[12px] border border-line bg-surface px-5 py-4 hover:border-line-strong"
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold">{c.title}</span>
                <span className="block text-[12.5px] text-ink-3">{c.org}</span>
              </span>
              <Icon name="arrow" size={16} className="shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ))}
          <p className="mt-1 text-[13px] text-ink-3">교과서 단원 자료는 학기 일정에 맞춰 순차적으로 추가됩니다.</p>
        </div>
      </div>
    </section>
  )
}

function PackageSpotlight() {
  const b = packageBreakdown(pkg)
  const { add, has, setCartOpen } = useStore()
  return (
    <section className="wrap pt-24">
      <div className="grid overflow-hidden rounded-[18px] border border-line bg-surface lg:grid-cols-[1fr_1.05fr]">
        <div className="relative min-h-[300px] bg-surface-2">
          <div className="absolute inset-x-[12%] top-[10%]">
            {b.items.slice(0, 4).map((it, i) => (
              <div
                key={it.id}
                className="absolute inset-x-0 shadow-sheet"
                style={{ top: `${i * 7}%`, transform: `rotate(${(i - 1.5) * 2.5}deg) translateX(${(i - 1.5) * 5}%)` }}
              >
                <SheetPage product={it} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="ink">패키지</Tag>
            <span className="font-mono text-[11.5px] text-ink-3">{pkg.code}</span>
          </div>
          <h2 className="mt-4 font-display text-[26px] font-semibold leading-snug tracking-[-0.02em] md:text-[30px]">{pkg.title}</h2>
          <p className="mt-3 text-[15px] text-ink-2">{pkg.summary}</p>
          <table className="mt-6 w-full text-[14px]">
            <tbody>
              {b.items.map((it) => (
                <tr key={it.id} className="border-b border-line">
                  <td className="py-2.5 pr-3">
                    <TypeBadge type={it.type} className="mr-2" />
                    <span className="text-ink-2">{it.subtitle}</span>
                  </td>
                  <td className="num py-2.5 text-right text-ink-3">{won(personalPrice(it) ?? 0)}</td>
                </tr>
              ))}
              <tr>
                <td className="pt-3 text-ink-3">개별 구매 합계</td>
                <td className="num pt-3 text-right text-ink-3 line-through">{won(b.sum)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <p className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold text-omr">{b.pct}% 절약</span>
              <span className="num font-display text-[34px] font-semibold tracking-[-0.03em]">{won(b.price)}</span>
            </p>
            <div className="flex gap-2">
              <ButtonLink to={`/materials/${pkg.slug}`} variant="outline">
                구성 자세히
              </ButtonLink>
              <Button
                variant="buy"
                onClick={() => {
                  if (!has(pkg.id)) add(pkg.id)
                  setCartOpen(true)
                }}
              >
                {has(pkg.id) ? '장바구니 보기' : '장바구니 담기'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Principles() {
  const steps = [
    ['지문 해부', '주제문, 논리 전환 지점, 지시어와 연결어를 먼저 표시합니다. 변형할 지점은 여기서 정해집니다.'],
    ['각도 선택', '원 문항과 겹치지 않는 유형을 지문당 2–3개 고릅니다. 정답을 기억한 학생은 풀 수 없게 만듭니다.'],
    ['오답 설계', '오답 선지마다 왜 매력적인지 한 줄로 적습니다. 그 한 줄을 못 쓰는 선지는 버립니다.'],
    ['교차 검수', '출제자가 아닌 검수자가 시간을 재고 풉니다. 정답 근거가 한 문장으로 짚이지 않으면 다시 씁니다.'],
  ]
  const promises = [
    ['eye', '샘플을 먼저 공개합니다', '모든 유료 자료의 앞 페이지를 로그인 없이 볼 수 있습니다.'],
    ['edit', 'HWP 편집본을 드립니다', '학원 양식으로 옮기고, 문항을 빼고 더하는 작업을 다시 타이핑 없이.'],
    ['refresh', '수정판은 자동으로', '오류를 고치면 버전이 올라가고, 내 자료실에서 최신본을 받습니다.'],
    ['building', '학원 단위로도 삽니다', '여러 강사가 함께 쓰는 학원은 학원용 라이선스로 견적을 드립니다.'],
  ] as const
  return (
    <section className="mt-24 border-y border-line bg-surface">
      <div className="wrap grid gap-14 py-20 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <p className="eyebrow mb-3">제작 원칙</p>
          <h2 className="font-display text-[28px] font-semibold leading-[1.3] tracking-[-0.02em] md:text-[34px]">
            모든 문항은 네 단계를
            <br />
            거쳐 나갑니다
          </h2>
          <ol className="mt-10 space-y-7">
            {steps.map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[44px_1fr] gap-4">
                <span className="num grid size-11 place-items-center rounded-full border border-line-strong font-mono text-[14px]">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold">{t}</p>
                  <p className="mt-1 text-[14.5px] text-ink-2">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/blog/what-a-good-transform-question-changes" className="mt-8 inline-flex items-center gap-1 text-[14px] font-semibold hover:underline">
            설계 원칙 자세히 읽기 <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="grid content-start gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2">
          {promises.map(([icon, t, d]) => (
            <div key={t} className="flex flex-col gap-3 bg-paper p-6">
              <Icon name={icon} size={22} className="text-ink" />
              <p className="text-[15.5px] font-semibold">{t}</p>
              <p className="text-[13.5px] leading-relaxed text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewArrivals() {
  const list = products
    .filter((p) => p.access === 'paid' && p.type !== 'package')
    .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
    .slice(0, 8)
  return (
    <section className="wrap pt-24">
      <SectionHead
        eyebrow="신규 · 업데이트"
        title="새로 나온 자료"
        action={
          <Link to="/materials?sort=new" className="inline-flex items-center gap-1 text-[14px] font-semibold hover:underline">
            전체 자료 <Icon name="arrow" size={15} />
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

function FreeBand() {
  const free = products.filter((p) => p.access === 'free').slice(0, 3)
  const { openDialog } = useStore()
  return (
    <section className="wrap pt-24">
      <div className="rounded-[18px] border border-free/30 bg-free-soft p-6 md:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr]">
          <div className="min-w-0">
            <p className="eyebrow mb-3 !text-free">무료자료</p>
            <h2 className="font-display text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] md:text-[30px]">
              유료 자료에서 그대로 떼어 온 페이지입니다
            </h2>
            <p className="mt-4 text-[15px] text-ink-2">
              무료자료는 따로 만든 맛보기가 아닙니다. 같은 검수를 거친 실제 자료의 일부라서, 받아 보시면 지영랩 자료의 품질을 그대로 확인할 수 있습니다.
            </p>
            <ButtonLink to="/free" variant="free" className="mt-6">
              무료자료 전체 보기 <Icon name="arrow" size={16} />
            </ButtonLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {free.map((p) => (
              <div key={p.id} className="flex min-w-0 flex-col rounded-[14px] border border-line bg-surface p-4">
                <div className="mx-auto w-[72%] shadow-sheet">
                  <SheetPage product={p} />
                </div>
                <p className="mt-4 line-clamp-2 text-[14.5px] font-semibold leading-snug">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-[12.5px] text-ink-2">{p.subtitle}</p>
                <Button variant="free" size="sm" className="mt-auto w-full" onClick={() => openDialog({ kind: 'free-claim', productId: p.id })}>
                  <Icon name="download" size={15} /> 무료로 받기
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Journal() {
  const [feat, ...rest] = posts
  return (
    <section className="wrap pt-24">
      <SectionHead
        eyebrow="블로그"
        title="수업 노트"
        desc="자료를 만들며 정리한 출제 원칙과 수업 설계를 공유합니다."
        action={
          <Link to="/blog" className="inline-flex items-center gap-1 text-[14px] font-semibold hover:underline">
            블로그 <Icon name="arrow" size={15} />
          </Link>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <Link to={`/blog/${feat.slug}`} className="group flex min-w-0 flex-col justify-between gap-8 rounded-[14px] bg-night p-7 text-on-night md:p-9">
          <div>
            <p className="font-mono text-[11.5px] tracking-[0.08em] opacity-70">
              {feat.category} · {feat.date} · {feat.readMinutes}분
            </p>
            <h3 className="mt-4 font-display text-[26px] font-semibold leading-snug tracking-[-0.02em] md:text-[32px]">{feat.title}</h3>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed opacity-80">{feat.excerpt}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[14px] font-semibold">
            읽기 <Icon name="arrow" size={15} className="transition group-hover:translate-x-0.5" />
          </span>
        </Link>
        <ul className="flex flex-col divide-y divide-line">
          {rest.slice(0, 4).map((p) => (
            <li key={p.slug}>
              <Link to={`/blog/${p.slug}`} className="group flex flex-col gap-1.5 py-5 first:pt-0">
                <span className="font-mono text-[11px] tracking-[0.06em] text-ink-3">
                  {p.category} · {p.date}
                </span>
                <span className="text-[16.5px] font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function AcademyCta() {
  const { openDialog } = useStore()
  return (
    <section className="wrap pt-24">
      <div className="flex flex-col items-start justify-between gap-6 rounded-[18px] border border-line bg-surface p-7 md:flex-row md:items-center md:p-10">
        <div className="min-w-0 max-w-2xl">
          <p className="eyebrow mb-2">학원용 라이선스</p>
          <h2 className="font-display text-[24px] font-semibold leading-snug tracking-[-0.02em]">강사 여러 명이 함께 쓰는 학원이라면</h2>
          <p className="mt-2 text-[15px] text-ink-2">강사 수에 맞춘 라이선스 견적과 세금계산서 발행을 도와드립니다. 시즌 자료를 묶어 연간으로 받는 구성도 가능합니다.</p>
        </div>
        <Button variant="primary" size="lg" onClick={() => openDialog({ kind: 'academy' })}>
          <Icon name="building" size={17} /> 견적 문의하기
        </Button>
      </div>
    </section>
  )
}

export function Home() {
  return (
    <>
      <Hero />
      <Season />
      <PackageSpotlight />
      <Browse />
      <NewArrivals />
      <Principles />
      <FreeBand />
      <Journal />
      <AcademyCta />
    </>
  )
}
