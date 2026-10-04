import { useState } from 'react'
import { ProductCard } from '../components/Cards'
import { SheetPage } from '../components/Sheet'
import { Breadcrumbs, Button, ButtonLink, Icon, SectionHead, Tag, TypeBadge } from '../components/ui'
import { posts } from '../data/posts'
import { productById, products } from '../data/products'
import type { Collection as C, MaterialType } from '../data/types'
import { gradeLabel, packageBreakdown, sourceLabel, typeLabel, won } from '../lib/format'
import { Link } from '../lib/router'
import { useStore } from '../lib/store'
import { NotFound } from './NotFound'
import { collectionBySlug } from '../data/collections'

function CoverageTable({ c }: { c: C }) {
  if (!c.items) return null
  const ids = new Set(c.items.flatMap((i) => i.products))
  const cols = products.filter((p) => ids.has(p.id))
  return (
    <section className="pt-20">
      <SectionHead
        eyebrow="문항별 커버리지"
        title="어떤 자료가 몇 번을 다루나요"
        desc="문항 번호와 유형만 표시합니다. 원문 지문은 구매한 자료 안에서만 볼 수 있습니다."
      />
      <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-line-strong bg-surface-2 text-left">
              <th className="sticky left-0 z-10 bg-surface-2 px-4 py-3 font-mono text-[11.5px] font-medium text-ink-3">번호</th>
              <th className="px-3 py-3 text-[12.5px] font-semibold">유형</th>
              {cols.map((p) => (
                <th key={p.id} className="px-3 py-3 text-center">
                  <Link to={`/materials/${p.slug}`} className="inline-flex flex-col items-center gap-0.5 hover:underline">
                    <TypeBadge type={p.type} />
                    <span className="text-[11px] font-normal text-ink-3">{p.subtitle.split('·')[0].trim()}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.items.map((it) => (
              <tr key={it.no} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="num sticky left-0 bg-surface px-4 py-2.5 font-mono text-[12.5px] font-medium">{it.no}</td>
                <td className="px-3 py-2.5 text-ink-2">{it.kind}</td>
                {cols.map((p) => (
                  <td key={p.id} className="px-3 py-2.5 text-center">
                    {it.products.includes(p.id) ? (
                      <span role="img" className="inline-block size-3.5 rounded-full bg-ink" aria-label="포함" />
                    ) : (
                      <span role="img" className="inline-block size-3.5 rounded-full border border-line-strong" aria-label="미포함" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function Collection({ slug }: { slug: string }) {
  const c = collectionBySlug.get(slug)
  const { add, has, setCartOpen } = useStore()
  const [tab, setTab] = useState<'all' | MaterialType>('all')
  if (!c) return <NotFound />

  const all = products.filter((p) => p.collections.includes(c.key))
  const paid = all.filter((p) => p.access === 'paid')
  const free = all.filter((p) => p.access === 'free')
  const pkg = paid.find((p) => p.type === 'package')
  const singles = paid.filter((p) => p.type !== 'package')
  const tabs = ['all', ...new Set(singles.map((p) => p.type))] as ('all' | MaterialType)[]
  const shown = tab === 'all' ? singles : singles.filter((p) => p.type === tab)
  const related = posts.filter((p) => p.relatedProducts.some((id) => all.some((a) => a.id === id))).slice(0, 3)

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="wrap pb-12 pt-10">
          <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '시험별 자료', to: '/exams' }, { label: c.title }]} />
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="neutral">{sourceLabel[c.kind]}</Tag>
                <span className="font-mono text-[11.5px] text-ink-3">{c.org}</span>
                {c.isSeasonal && <Tag tone="omr">이번 시즌</Tag>}
              </div>
              <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.2] tracking-[-0.035em] md:text-[48px]">{c.title}</h1>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">{c.intro}</p>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line">
              {c.facts.map((f) => (
                <div key={f.label} className="bg-paper px-4 py-3.5">
                  <dt className="font-mono text-[11px] tracking-[0.06em] text-ink-3">{f.label}</dt>
                  <dd className="mt-0.5 text-[14.5px] font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="wrap">
        {pkg && (
          <section className="pt-14">
            {(() => {
              const b = packageBreakdown(pkg)
              return (
                <div className="grid items-center gap-8 rounded-[18px] border border-ink bg-surface p-6 md:grid-cols-[180px_1fr_auto] md:p-8">
                  <div className="relative mx-auto h-[150px] w-[150px] md:h-[180px] md:w-[180px]">
                    {b.items.slice(0, 3).map((it, i) => (
                      <div
                        key={it.id}
                        className="absolute left-[18%] w-[64%] shadow-sheet"
                        style={{ top: `${i * 6}%`, transform: `rotate(${(i - 1) * 6}deg)` }}
                      >
                        <SheetPage product={it} />
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-omr">이 회차를 한 번에 · {b.pct}% 절약</p>
                    <h2 className="mt-1 font-display text-[22px] font-semibold leading-snug tracking-[-0.02em] md:text-[26px]">{pkg.title}</h2>
                    <p className="mt-2 text-[14px] text-ink-2">
                      {b.items.map((i) => typeLabel[i.type]).join(' · ')} — 자료 {b.items.length}종 · 총 {pkg.specs.pages}쪽
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <p className="flex items-baseline gap-2">
                      <span className="num text-[13px] text-ink-3 line-through">{won(b.sum)}</span>
                      <span className="num font-display text-[28px] font-semibold tracking-[-0.03em]">{won(b.price)}</span>
                    </p>
                    <div className="flex gap-2">
                      <ButtonLink to={`/materials/${pkg.slug}`} variant="outline" size="sm">
                        구성 보기
                      </ButtonLink>
                      <Button
                        variant="buy"
                        size="sm"
                        onClick={() => {
                          if (!has(pkg.id)) add(pkg.id)
                          setCartOpen(true)
                        }}
                      >
                        패키지 담기
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </section>
        )}

        <section className="pt-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[26px] font-semibold tracking-[-0.02em]">
              단품 자료 <span className="num text-ink-3">{singles.length}</span>
            </h2>
            <div className="no-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto px-1" role="tablist" aria-label="자료 유형">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition ${
                    tab === t ? 'bg-ink text-on-ink' : 'border border-line bg-surface text-ink-2 hover:text-ink'
                  }`}
                >
                  {t === 'all' ? '전체' : typeLabel[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <CoverageTable c={c} />

        {(free.length > 0 || related.length > 0) && (
          <section className="grid gap-10 pt-20 lg:grid-cols-2">
            {free.length > 0 && (
              <div>
                <p className="eyebrow mb-4 !text-free">이 시험 무료자료</p>
                {free.map((p) => (
                  <FreeRow key={p.id} id={p.id} />
                ))}
              </div>
            )}
            {related.length > 0 && (
              <div>
                <p className="eyebrow mb-4">관련 글</p>
                <ul className="divide-y divide-line border-y border-line">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link to={`/blog/${p.slug}`} className="group flex items-center justify-between gap-4 py-4">
                        <span className="min-w-0">
                          <span className="block font-mono text-[11px] text-ink-3">{p.category}</span>
                          <span className="block font-semibold group-hover:underline">{p.title}</span>
                        </span>
                        <Icon name="arrow" size={16} className="shrink-0 text-ink-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  )
}

function FreeRow({ id }: { id: string }) {
  const p = productById.get(id)!
  const { openDialog } = useStore()
  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-free/30 bg-free-soft p-4">
      <div className="w-16 shrink-0 shadow-sheet">
        <SheetPage product={p} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{p.title}</p>
        <p className="mt-0.5 text-[13px] text-ink-2">
          {p.specs.pages}쪽 · {p.grades.map((g) => gradeLabel[g]).join('·')}
        </p>
      </div>
      <Button variant="free" size="sm" onClick={() => openDialog({ kind: 'free-claim', productId: p.id })}>
        무료로 받기
      </Button>
    </div>
  )
}

