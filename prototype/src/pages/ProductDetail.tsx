import { useState } from 'react'
import { ProductCard } from '../components/Cards'
import { SheetPage, sheetPageCount } from '../components/Sheet'
import { Breadcrumbs, Button, FormatChip, Icon, Tag, TypeBadge, VersionStamp } from '../components/ui'
import { collectionByKey } from '../data/collections'
import { productBySlug, products } from '../data/products'
import type { Product } from '../data/types'
import { formatsOf, gradeLabel, packageBreakdown, packagesContaining, personalPrice, typeLabel, won } from '../lib/format'
import { Link, useRouter } from '../lib/router'
import { useStore } from '../lib/store'
import { NotFound } from './NotFound'

type LicenseChoice = 'personal' | 'academy'

function Gallery({ product }: { product: Product }) {
  const { openDialog } = useStore()
  const [page, setPage] = useState(0)
  const isPkg = product.type === 'package'
  const items = isPkg ? packageBreakdown(product).items : []
  const total = sheetPageCount(product)
  const open = isPkg ? 2 : product.access === 'free' ? 3 : 2

  if (isPkg) {
    return (
      <div className="rounded-[18px] border border-line bg-surface-2 p-6 md:p-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => openDialog({ kind: 'sample', productId: it.id })}
              className="group flex min-w-0 flex-col gap-2 text-left"
            >
              <div className="shadow-sheet transition group-hover:-translate-y-1">
                <SheetPage product={it} />
              </div>
              <span className="text-[12px] font-semibold leading-snug">{typeLabel[it.type]}</span>
              <span className="-mt-1.5 line-clamp-1 text-[11.5px] text-ink-3">{it.subtitle}</span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-ink-2">자료를 누르면 각 자료의 샘플을 볼 수 있습니다.</p>
      </div>
    )
  }

  const locked = page >= open
  return (
    <div className="min-w-0">
      <div className="relative rounded-[18px] border border-line bg-surface-2 px-[8%] pb-[7%] pt-[7%]">
        <div className="relative mx-auto max-w-[520px] shadow-pop">
          <div className={locked ? 'pointer-events-none select-none blur-[5px]' : ''}>
            <SheetPage product={product} page={page} />
          </div>
          {locked && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <div className="rounded-xl bg-surface px-5 py-4 shadow-pop">
                <Icon name="lock" size={20} className="mx-auto text-ink-3" />
                <p className="mt-1.5 text-[14px] font-semibold">구매 후 전체 {total}쪽 제공</p>
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" className="absolute right-4 top-4" onClick={() => openDialog({ kind: 'sample', productId: product.id })}>
          <Icon name="eye" size={15} /> 샘플 크게 보기
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPage(i)}
            aria-label={`${i + 1}쪽 보기`}
            className={`relative overflow-hidden rounded-lg border-2 bg-surface-2 p-1.5 transition ${page === i ? 'border-ink' : 'border-transparent hover:border-line-strong'}`}
          >
            <div className={i >= open ? 'blur-[2px]' : ''}>
              <SheetPage product={product} page={i} />
            </div>
            {i >= open && (
              <span className="absolute inset-0 grid place-items-center text-ink-2">
                <Icon name="lock" size={15} />
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-ink-3">
        미리보기 {open}쪽 공개 · {product.sampleNote ? `샘플 PDF: ${product.sampleNote}` : '샘플 PDF 제공'}
      </p>
    </div>
  )
}

function BuyPanel({ product }: { product: Product }) {
  const { add, has, setCartOpen, openDialog } = useStore()
  const { navigate } = useRouter()
  const [license, setLicense] = useState<LicenseChoice>('personal')
  const isFree = product.access === 'free'
  const isPkg = product.type === 'package'
  const b = isPkg ? packageBreakdown(product) : null
  const price = personalPrice(product)
  const pkgs = packagesContaining(product.id)
  const inCart = has(product.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <TypeBadge type={product.type} />
          <span className="text-[12.5px] text-ink-3">{product.grades.map((g) => gradeLabel[g]).join(' · ')}</span>
          {product.isNew && <Tag tone="new">NEW</Tag>}
          {isFree && <Tag tone="free">무료</Tag>}
        </div>
        <h1 className="mt-3 font-display text-[28px] font-semibold leading-[1.28] tracking-[-0.03em] md:text-[34px]">{product.title}</h1>
        <p className="mt-2 text-[15px] text-ink-2">{product.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-[11.5px] text-ink-3">{product.code}</span>
          <VersionStamp version={product.version} date={product.updatedAt} />
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[12px] border border-line bg-line text-center">
        <div className="bg-surface px-2 py-3">
          <dt className="text-[11.5px] text-ink-3">분량</dt>
          <dd className="num mt-0.5 text-[15px] font-semibold">{product.specs.pages}쪽</dd>
        </div>
        <div className="bg-surface px-2 py-3">
          <dt className="text-[11.5px] text-ink-3">{product.specs.questions ? '문항' : '어휘'}</dt>
          <dd className="num mt-0.5 text-[15px] font-semibold">
            {product.specs.questions ? `${product.specs.questions}문항` : product.specs.words ? `${product.specs.words}개` : '—'}
          </dd>
        </div>
        <div className="bg-surface px-2 py-3">
          <dt className="text-[11.5px] text-ink-3">형식</dt>
          <dd className="mt-1 flex flex-wrap justify-center gap-1">
            {formatsOf(product).map((f) => (
              <FormatChip key={f} format={f} editable={f !== 'PDF'} />
            ))}
          </dd>
        </div>
      </dl>

      {isFree ? (
        <div className="flex flex-col gap-3 rounded-[14px] border border-free/30 bg-free-soft p-5">
          <p className="text-[14px] text-ink-2">무료 회원으로 로그인하면 바로 받을 수 있습니다. 받은 자료는 내 자료실에 보관되고, 수정판도 자동으로 반영됩니다.</p>
          <Button variant="free" size="lg" onClick={() => openDialog({ kind: 'free-claim', productId: product.id })}>
            <Icon name="download" size={17} /> 로그인하고 무료로 받기
          </Button>
        </div>
      ) : (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[13px] font-semibold">라이선스</legend>
            {(
              [
                ['personal', '개인용', '구매한 선생님 본인의 수업에서 사용', price !== null ? won(price) : '—'],
                ['academy', '학원용', '같은 학원 강사 여러 명이 함께 사용', '견적 문의'],
              ] as const
            ).map(([v, t, d, pr]) => (
              <label
                key={v}
                htmlFor={`lic-${v}`}
                className={`flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 transition ${
                  license === v ? 'border-ink bg-surface' : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <input id={`lic-${v}`} type="radio" name="license" checked={license === v} onChange={() => setLicense(v)} className="accent-[var(--ink)]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold">{t}</span>
                  <span className="block text-[12.5px] text-ink-3">{d}</span>
                </span>
                <span className="num text-[14px] font-semibold">{pr}</span>
              </label>
            ))}
          </fieldset>

          {license === 'personal' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[14px] text-ink-2">결제 금액</span>
                <span className="flex items-baseline gap-2">
                  {b && (
                    <>
                      <span className="text-[14px] font-semibold text-omr">{b.pct}%</span>
                      <span className="num text-[14px] text-ink-3 line-through">{won(b.sum)}</span>
                    </>
                  )}
                  <span className="num font-display text-[32px] font-semibold tracking-[-0.03em]">{won(price ?? 0)}</span>
                </span>
              </div>
              <div className="grid grid-cols-[1fr_1.4fr] gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (!inCart) add(product.id)
                    setCartOpen(true)
                  }}
                >
                  {inCart ? '담김 ✓' : '장바구니'}
                </Button>
                <Button
                  variant="buy"
                  size="lg"
                  onClick={() => {
                    if (!inCart) add(product.id)
                    navigate('/checkout')
                  }}
                >
                  바로 구매 신청
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="primary" size="lg" onClick={() => openDialog({ kind: 'academy', productId: product.id })}>
              <Icon name="building" size={17} /> 학원용 견적 문의
            </Button>
          )}

          <ul className="flex flex-col gap-2 border-t border-line pt-5 text-[13.5px] text-ink-2">
            <li className="flex gap-2">
              <Icon name="download" size={16} className="mt-0.5 shrink-0 text-ink" />
              입금 확인 즉시 내 자료실에서 다운로드
            </li>
            <li className="flex gap-2">
              <Icon name="refresh" size={16} className="mt-0.5 shrink-0 text-ink" />
              수정판이 나오면 추가 비용 없이 최신본 제공
            </li>
            <li className="flex gap-2">
              <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-ink" />
              다운로드 전에는 전액 환불 · 현금영수증/세금계산서 발행
            </li>
          </ul>
        </>
      )}

      {pkgs.map((pk) => {
        const pb = packageBreakdown(pk)
        return (
          <Link key={pk.id} to={`/materials/${pk.slug}`} className="group rounded-[14px] border border-ink p-4 transition hover:shadow-pop">
            <p className="text-[12px] font-semibold text-omr">이 자료가 포함된 패키지 · {pb.pct}% 절약</p>
            <p className="mt-1 text-[14.5px] font-semibold leading-snug group-hover:underline">{pk.title}</p>
            <p className="num mt-1 text-[13px] text-ink-2">
              자료 {pb.items.length}종 {won(pb.sum)} → <b className="text-ink">{won(pb.price)}</b>
            </p>
          </Link>
        )
      })}
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line py-12">
      <h2 className="mb-6 font-display text-[22px] font-semibold tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  )
}

export function ProductDetail({ slug }: { slug: string }) {
  const product = productBySlug.get(slug)
  const { add, has, openDialog } = useStore()
  const { navigate } = useRouter()
  if (!product) return <NotFound />
  const col = product.collections[0] ? collectionByKey.get(product.collections[0]) : undefined
  const isPkg = product.type === 'package'
  const isFree = product.access === 'free'
  const b = isPkg ? packageBreakdown(product) : null
  const related = products.filter((p) => p.id !== product.id && p.access === 'paid' && p.collections.some((c) => product.collections.includes(c))).slice(0, 3)
  const price = personalPrice(product)

  const sections = [
    ['intro', '자료 소개'],
    ['files', isPkg ? '포함 자료' : '파일 구성'],
    ['history', '수정 이력'],
    ['terms', '이용 안내'],
  ]

  return (
    <div className="pb-24 lg:pb-0">
      <div className="wrap pt-8">
        <Breadcrumbs
          items={[
            { label: '홈', to: '/' },
            isFree ? { label: '무료자료', to: '/free' } : { label: '전체 자료', to: '/materials' },
            ...(col ? [{ label: col.title, to: `/exams/${col.slug}` }] : []),
            { label: product.subtitle.split('·')[0].trim() || product.title },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Gallery product={product} />
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BuyPanel product={product} />
          </div>
        </div>

        <nav className="sticky z-30 mt-14 border-b border-line bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur" style={{ top: 'calc(64px + env(safe-area-inset-top, 0px))' }} aria-label="상세 섹션">
          <ul className="no-scrollbar flex gap-6 overflow-x-auto">
            {sections.map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-12 whitespace-nowrap text-[14px] font-medium text-ink-2 hover:text-ink"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-[860px]">
          <Section id="intro" title="자료 소개">
            <p className="max-w-[68ch] text-[16px] leading-[1.85]">{product.summary}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 rounded-[12px] border border-line bg-surface px-4 py-3 text-[14.5px]">
                  <Icon name="check" size={17} className="mt-0.5 shrink-0 text-free" />
                  {h}
                </li>
              ))}
            </ul>
            {col && (
              <p className="mt-6 text-[14px] text-ink-2">
                출처: <Link to={`/exams/${col.slug}`} className="font-semibold text-ink underline underline-offset-2">{col.title}</Link>
                {product.specs.coverage ? ` · 범위 ${product.specs.coverage}` : ''}. 원문 지문은 구매한 파일 안에만 들어 있습니다.
              </p>
            )}
          </Section>

          <Section id="files" title={isPkg ? '포함 자료' : '파일 구성'}>
            {isPkg && b ? (
              <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
                <table className="w-full text-[14px]">
                  <tbody>
                    {b.items.map((it) => (
                      <tr key={it.id} className="border-b border-line">
                        <td className="px-4 py-3.5">
                          <TypeBadge type={it.type} />
                          <Link to={`/materials/${it.slug}`} className="mt-0.5 block font-semibold hover:underline">
                            {it.title}
                          </Link>
                          <span className="text-[12.5px] text-ink-3">
                            {it.specs.pages}쪽 · {formatsOf(it).join(' · ')} · {it.version}
                          </span>
                        </td>
                        <td className="num px-4 py-3.5 text-right text-ink-3">{won(personalPrice(it) ?? 0)}</td>
                      </tr>
                    ))}
                    <tr className="bg-surface-2">
                      <td className="px-4 py-3 text-ink-2">개별 구매 합계 → 패키지 가격</td>
                      <td className="num px-4 py-3 text-right">
                        <span className="text-ink-3 line-through">{won(b.sum)}</span> <b>{won(b.price)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-line bg-surface-2 text-left text-[12px] text-ink-3">
                      <th className="px-4 py-2.5 font-medium">파일</th>
                      <th className="px-4 py-2.5 font-medium">형식</th>
                      <th className="px-4 py-2.5 text-right font-medium">분량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.files.map((f) => (
                      <tr key={f.label + f.format} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <Icon name="file" size={16} className="shrink-0 text-ink-3" />
                            {f.label}
                          </span>
                          {f.editable && <span className="ml-6 text-[12px] text-ink-3">한컴오피스 한글에서 편집 가능</span>}
                        </td>
                        <td className="px-4 py-3">
                          <FormatChip format={f.format} editable={f.editable} />
                        </td>
                        <td className="num px-4 py-3 text-right text-ink-2">{f.pages}쪽</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-[13px] text-ink-3">
              {product.specs.answerKey ? '정답 포함' : '정답 없음'} · {product.specs.explanation ? '해설 포함' : '해설 없음'} · A4 인쇄 기준
            </p>
          </Section>

          <Section id="history" title="수정 이력">
            <ol className="relative ml-1.5 border-l border-line-strong">
              {product.changelog.map((c, i) => (
                <li key={c.version} className="relative pb-6 pl-6 last:pb-0">
                  <span className={`absolute -left-[7px] top-1 size-3 rounded-full border-2 border-paper ${i === 0 ? 'bg-omr' : 'bg-line-strong'}`} />
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-mono text-[13px] font-semibold">{c.version}</span>
                    <span className="num font-mono text-[12px] text-ink-3">{c.date}</span>
                    {i === 0 && <Tag tone="free">현재 버전</Tag>}
                  </p>
                  <p className="mt-1 text-[14.5px] text-ink-2">{c.note}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 rounded-[12px] bg-surface-2 px-4 py-3 text-[13.5px] text-ink-2">
              이미 구매하신 분은 내 자료실에서 언제나 최신 버전을 받습니다. 어떤 부분이 바뀌었는지 위 이력에 기록합니다.
            </p>
          </Section>

          <Section id="terms" title="이용 안내">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['개인용 라이선스', '구매한 선생님 본인의 수업에서 사용합니다. 담당 학생에게 인쇄물로 나눠 주는 것은 자유롭게 할 수 있습니다. 파일 자체를 다른 사람에게 전달하거나 온라인에 올릴 수 없습니다.'],
                ['학원용 라이선스', '같은 학원 강사가 함께 사용합니다. 강사 수에 따라 견적을 드리며, 세금계산서 발행이 가능합니다.'],
                ['환불', '다운로드 전에는 구매 후 7일 이내 전액 환불됩니다. 디지털 자료 특성상 다운로드 후에는 청약철회가 제한되며, 이 내용은 구매 신청 단계에서 다시 안내합니다.'],
                ['오류 제보', '자료에서 오류를 발견하시면 고객센터로 알려 주세요. 확인 후 수정판을 올리고 수정 이력에 기록합니다.'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-[14px] border border-line bg-surface p-5">
                  <p className="font-semibold">{t}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{d}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {related.length > 0 && (
          <section className="border-t border-line pt-12">
            <h2 className="mb-6 font-display text-[22px] font-semibold tracking-[-0.02em]">같은 시험의 다른 자료</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile purchase bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pt-3 lg:hidden"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      >
        {isFree ? (
          <Button variant="free" size="lg" className="w-full" onClick={() => openDialog({ kind: 'free-claim', productId: product.id })}>
            로그인하고 무료로 받기
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-ink-3">{product.title}</p>
              <p className="num text-[18px] font-semibold">{won(price ?? 0)}</p>
            </div>
            <Button
              variant="buy"
              size="lg"
              onClick={() => {
                if (!has(product.id)) add(product.id)
                navigate('/checkout')
              }}
            >
              구매 신청
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
