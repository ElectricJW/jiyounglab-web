import { useMemo, useState } from 'react'
import { CollectionCard, ProductCard } from '../components/Cards'
import { Modal } from '../components/Overlays'
import { Breadcrumbs, Button, Icon, SectionHead } from '../components/ui'
import { collectionByKey, collections } from '../data/collections'
import { products } from '../data/products'
import type { Grade, MaterialType, Product } from '../data/types'
import { formatsOf, gradeLabel, personalPrice, sourceLabel, typeLabel } from '../lib/format'
import { splitPath, useRouter } from '../lib/router'

const GRADES: Grade[] = ['m3', 'h1', 'h2', 'h3']
const TYPES: MaterialType[] = ['transform', 'vocab', 'grammar', 'writing', 'analysis', 'package']
const SOURCES = ['mock', 'kice', 'textbook', 'curriculum'] as const
const FORMATS = ['PDF', 'HWP', 'HWPX']

type Sort = 'recommended' | 'new' | 'price-asc' | 'price-desc'

interface Filters {
  q: string
  type: string[]
  grade: string[]
  source: string[]
  format: string[]
  access: string[]
  collection: string
  sort: Sort
}

function parse(query: URLSearchParams): Filters {
  const list = (k: string) => (query.get(k) ? query.get(k)!.split(',') : [])
  return {
    q: query.get('q') ?? '',
    type: list('type'),
    grade: list('grade'),
    source: list('source'),
    format: list('format'),
    access: list('access'),
    collection: query.get('collection') ?? '',
    sort: (query.get('sort') as Sort) ?? 'recommended',
  }
}

function serialize(f: Filters): string {
  const q = new URLSearchParams()
  if (f.q) q.set('q', f.q)
  for (const k of ['type', 'grade', 'source', 'format', 'access'] as const) if (f[k].length) q.set(k, f[k].join(','))
  if (f.collection) q.set('collection', f.collection)
  if (f.sort !== 'recommended') q.set('sort', f.sort)
  const s = q.toString()
  return '/materials' + (s ? '?' + s : '')
}

function sourceOf(p: Product) {
  return p.collections.map((k) => collectionByKey.get(k)?.kind).filter(Boolean) as string[]
}

function matches(p: Product, f: Filters) {
  if (f.q) {
    const hay = `${p.title} ${p.subtitle} ${p.summary} ${typeLabel[p.type]} ${p.grades.map((g) => gradeLabel[g]).join(' ')}`.toLowerCase()
    if (!f.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false
  }
  if (f.type.length && !f.type.includes(p.type)) return false
  if (f.grade.length && !p.grades.some((g) => f.grade.includes(g))) return false
  if (f.source.length && !sourceOf(p).some((s) => f.source.includes(s))) return false
  if (f.format.length && !formatsOf(p).some((x) => f.format.includes(x))) return false
  if (f.access.length && !f.access.includes(p.access)) return false
  if (f.collection && !p.collections.includes(f.collection)) return false
  return true
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: { value: string; label: string; count: number }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="mb-3 text-[13px] font-semibold">{title}</legend>
      <div className="flex flex-col gap-1">
        {options.map((o) => {
          const id = `f-${title}-${o.value}`
          const on = selected.includes(o.value)
          return (
            <label key={o.value} htmlFor={id} className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 text-[14px] hover:text-ink">
              <input id={id} type="checkbox" checked={on} onChange={() => onToggle(o.value)} className="size-4 accent-[var(--ink)]" />
              <span className={on ? 'font-medium text-ink' : 'text-ink-2'}>{o.label}</span>
              <span className="num ml-auto font-mono text-[11.5px] text-ink-3">{o.count}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function FilterPanel({ f, set }: { f: Filters; set: (f: Filters) => void }) {
  const toggle = (k: 'type' | 'grade' | 'source' | 'format' | 'access') => (v: string) =>
    set({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] })
  const count = (pred: (p: Product) => boolean) => products.filter(pred).length
  return (
    <div>
      <FilterGroup
        title="구분"
        options={[
          { value: 'paid', label: '유료 자료', count: count((p) => p.access === 'paid') },
          { value: 'free', label: '무료자료', count: count((p) => p.access === 'free') },
        ]}
        selected={f.access}
        onToggle={toggle('access')}
      />
      <FilterGroup
        title="학년"
        options={GRADES.map((g) => ({ value: g, label: gradeLabel[g], count: count((p) => p.grades.includes(g)) }))}
        selected={f.grade}
        onToggle={toggle('grade')}
      />
      <FilterGroup
        title="출처"
        options={SOURCES.map((s) => ({ value: s, label: sourceLabel[s], count: count((p) => sourceOf(p).includes(s)) }))}
        selected={f.source}
        onToggle={toggle('source')}
      />
      <FilterGroup
        title="자료 유형"
        options={TYPES.map((t) => ({ value: t, label: typeLabel[t], count: count((p) => p.type === t) }))}
        selected={f.type}
        onToggle={toggle('type')}
      />
      <FilterGroup
        title="파일 형식"
        options={FORMATS.map((x) => ({ value: x, label: x === 'PDF' ? 'PDF' : `${x} (편집 가능)`, count: count((p) => formatsOf(p).includes(x)) }))}
        selected={f.format}
        onToggle={toggle('format')}
      />
    </div>
  )
}

export function Catalog() {
  const { path, navigate } = useRouter()
  const f = parse(splitPath(path).query)
  const [mobileOpen, setMobileOpen] = useState(false)
  const set = (next: Filters) => {
    const to = serialize(next)
    // keep scroll position while filtering
    const y = window.scrollY
    navigate(to)
    window.scrollTo({ top: y })
  }

  const list = useMemo(() => {
    const out = products.filter((p) => matches(p, f))
    const price = (p: Product) => (p.access === 'free' ? 0 : (personalPrice(p) ?? 0))
    switch (f.sort) {
      case 'new':
        return out.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
      case 'price-asc':
        return out.sort((a, b) => price(a) - price(b))
      case 'price-desc':
        return out.sort((a, b) => price(b) - price(a))
      default:
        return out.sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured) || b.releasedAt.localeCompare(a.releasedAt))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  const chips: { label: string; clear: () => void }[] = []
  if (f.q) chips.push({ label: `“${f.q}”`, clear: () => set({ ...f, q: '' }) })
  if (f.collection) chips.push({ label: collectionByKey.get(f.collection)?.title ?? f.collection, clear: () => set({ ...f, collection: '' }) })
  for (const t of f.type) chips.push({ label: typeLabel[t as MaterialType], clear: () => set({ ...f, type: f.type.filter((x) => x !== t) }) })
  for (const g of f.grade) chips.push({ label: gradeLabel[g as Grade], clear: () => set({ ...f, grade: f.grade.filter((x) => x !== g) }) })
  for (const s of f.source) chips.push({ label: sourceLabel[s as (typeof SOURCES)[number]], clear: () => set({ ...f, source: f.source.filter((x) => x !== s) }) })
  for (const x of f.format) chips.push({ label: x, clear: () => set({ ...f, format: f.format.filter((y) => y !== x) }) })
  for (const a of f.access) chips.push({ label: a === 'free' ? '무료자료' : '유료 자료', clear: () => set({ ...f, access: f.access.filter((y) => y !== a) }) })

  const clearAll = () => navigate('/materials')

  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '전체 자료' }]} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">전체 자료</h1>
          <p className="mt-2 text-[15px] text-ink-2">시험, 학년, 자료 유형으로 좁혀 보세요. 모든 유료 자료는 샘플을 먼저 볼 수 있습니다.</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel f={f} set={set} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Icon name="filter" size={15} /> 필터{chips.length ? ` ${chips.length}` : ''}
            </Button>
            <p className="num text-[14px] text-ink-2">
              자료 <b className="text-ink">{list.length}</b>개
            </p>
            <label className="ml-auto flex items-center gap-2 text-[13px] text-ink-2" htmlFor="sort">
              정렬
              <select
                id="sort"
                value={f.sort}
                onChange={(e) => set({ ...f, sort: e.target.value as Sort })}
                className="h-9 rounded-lg border border-line-strong bg-surface px-2 text-[13px] text-ink"
              >
                <option value="recommended">추천순</option>
                <option value="new">최신순</option>
                <option value="price-asc">낮은 가격순</option>
                <option value="price-desc">높은 가격순</option>
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={c.clear}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink bg-surface px-3 text-[13px] font-medium"
                >
                  {c.label} <Icon name="x" size={13} />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="px-2 text-[13px] text-ink-3 underline underline-offset-2 hover:text-ink">
                모두 지우기
              </button>
            </div>
          )}
          {list.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-line-strong p-12 text-center">
              <p className="font-semibold">조건에 맞는 자료가 없습니다</p>
              <p className="mt-1 text-[14px] text-ink-2">필터를 하나씩 지워 보거나, 원하는 자료를 알려 주세요.</p>
              <Button variant="outline" className="mt-5" onClick={clearAll}>
                필터 초기화
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <Modal title="필터" onClose={() => setMobileOpen(false)}>
          <div className="p-5">
            <FilterPanel f={f} set={set} />
            <div className="sticky bottom-0 mt-4 flex gap-2 bg-surface pt-3">
              <Button variant="outline" className="flex-1" onClick={clearAll}>
                초기화
              </Button>
              <Button variant="primary" className="flex-[2]" onClick={() => setMobileOpen(false)}>
                자료 {list.length}개 보기
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export function ExamsIndex() {
  const groups = [
    { title: '모의고사 · 평가원', list: collections.filter((c) => c.kind === 'mock' || c.kind === 'kice') },
    { title: '교과서 내신', list: collections.filter((c) => c.kind === 'textbook') },
    { title: '자체 커리큘럼', list: collections.filter((c) => c.kind === 'curriculum') },
  ]
  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '시험별 자료' }]} />
      <h1 className="font-display text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">시험별 자료</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-2">
        시험 한 회차, 교과서 한 권 단위로 자료를 모았습니다. 회차 페이지에서는 문항 번호별로 어떤 자료가 다루는지 확인할 수 있습니다.
      </p>
      <div className="mt-12 flex flex-col gap-14">
        {groups.map((g) => (
          <section key={g.title}>
            <SectionHead title={g.title} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {g.list.map((c, i) => (
                <CollectionCard key={c.key} collection={c} tone={g.title.startsWith('모의') && i === 0 ? 'feature' : 'default'} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
