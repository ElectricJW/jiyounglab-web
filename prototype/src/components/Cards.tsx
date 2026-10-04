import type { Collection, Product } from '../data/types'
import { products } from '../data/products'
import { formatsOf, gradeLabel, packageBreakdown, personalPrice, sourceLabel, won } from '../lib/format'
import { Link } from '../lib/router'
import { SheetPage } from './Sheet'
import { FormatChip, Icon, Tag, TypeBadge } from './ui'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <rect x="1" y="1" width="28" height="28" rx="8" fill="var(--ink)" />
        <circle cx="10.5" cy="15" r="4.2" fill="none" stroke="var(--paper)" strokeWidth="1.6" />
        <circle cx="19.5" cy="15" r="4.2" fill="var(--omr)" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[19px] font-semibold tracking-[-0.03em]">지영랩</span>
        {!compact && <span className="mt-1 font-mono text-[9.5px] tracking-[0.22em] text-ink-3">JIYOUNGLAB</span>}
      </span>
    </span>
  )
}

function Cover({ product }: { product: Product }) {
  const isPkg = product.type === 'package'
  const pkgItems = isPkg ? packageBreakdown(product).items.slice(0, 3) : []
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-[14px] bg-surface-2">
      {isPkg ? (
        <div className="absolute inset-x-[14%] top-[13%]">
          {pkgItems.map((it, i) => (
            <div
              key={it.id}
              className="absolute inset-x-0 shadow-sheet transition-transform duration-300 group-hover:-translate-y-1"
              style={{ top: `${i * 9}%`, transform: `rotate(${(i - 1) * 3}deg) translateX(${(i - 1) * 6}%)`, zIndex: i }}
            >
              <SheetPage product={it} />
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-x-[17%] top-[12%] shadow-sheet transition-transform duration-300 group-hover:-translate-y-1.5">
          <SheetPage product={product} />
        </div>
      )}
      <div className="absolute left-3 top-3 flex gap-1.5">
        {product.access === 'free' && <Tag tone="free">무료</Tag>}
        {product.isNew && <Tag tone="new">NEW</Tag>}
        {isPkg && <Tag tone="ink">패키지</Tag>}
      </div>
    </div>
  )
}

export function PriceLine({ product }: { product: Product }) {
  if (product.access === 'free') {
    return <span className="text-[15px] font-semibold text-free">무료 · 로그인 후 받기</span>
  }
  const price = personalPrice(product)
  if (product.type === 'package') {
    const b = packageBreakdown(product)
    return (
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-[13px] font-semibold text-omr">{b.pct}%</span>
        <span className="num text-[16px] font-semibold">{won(b.price)}</span>
        <span className="num text-[12.5px] text-ink-3 line-through">{won(b.sum)}</span>
      </span>
    )
  }
  return <span className="num text-[16px] font-semibold">{price === null ? '견적 문의' : won(price)}</span>
}

export function ProductCard({ product }: { product: Product }) {
  const formats = formatsOf(product)
  return (
    <Link
      to={`/materials/${product.slug}`}
      className="group flex min-w-0 flex-col rounded-[14px] border border-line bg-surface transition hover:border-line-strong hover:shadow-pop"
    >
      <Cover product={product} />
      <div className="flex flex-1 flex-col gap-2.5 p-4 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <TypeBadge type={product.type} />
          <span className="font-mono text-[11px] text-ink-3">{product.grades.map((g) => gradeLabel[g]).join(' · ')}</span>
        </div>
        <h3 className="line-clamp-2 text-[15.5px] font-semibold leading-[1.45] tracking-[-0.01em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
          {product.title}
        </h3>
        <p className="line-clamp-1 text-[13px] text-ink-2">{product.subtitle}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          <span className="num mr-1 text-[12px] text-ink-3">
            {product.specs.pages}쪽{product.specs.questions ? ` · ${product.specs.questions}문항` : ''}
            {!product.specs.questions && product.specs.words ? ` · ${product.specs.words}단어` : ''}
          </span>
          {formats.map((f) => (
            <FormatChip key={f} format={f} editable={f.startsWith('HWP') || f === 'DOCX'} />
          ))}
        </div>
        <div className="flex items-end justify-between border-t border-line pt-3">
          <PriceLine product={product} />
        </div>
      </div>
    </Link>
  )
}

export function CollectionCard({ collection, tone = 'default' }: { collection: Collection; tone?: 'default' | 'feature' }) {
  const count = products.filter((p) => p.collections.includes(collection.key) && p.access === 'paid').length
  const feature = tone === 'feature'
  const big = collection.month ?? (collection.kind === 'textbook' ? 'TB' : 'GC')
  return (
    <Link
      to={`/exams/${collection.slug}`}
      className={`group relative flex min-w-0 flex-col justify-between gap-6 overflow-hidden rounded-[14px] border p-5 transition ${
        feature ? 'border-night bg-night text-on-night' : 'border-line bg-surface hover:border-line-strong hover:shadow-pop'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-mono text-[11px] tracking-[0.08em] ${feature ? 'opacity-70' : 'text-ink-3'}`}>
            {sourceLabel[collection.kind]} · {collection.org}
          </p>
          <h3 className="mt-2 font-display text-[20px] font-semibold leading-snug tracking-[-0.02em]">{collection.title}</h3>
        </div>
        <span
          className={`num shrink-0 font-display text-[44px] font-semibold leading-none tracking-[-0.04em] ${
            feature ? 'text-[color-mix(in_srgb,var(--omr)_70%,white)]' : 'text-ink-3 group-hover:text-omr'
          } transition-colors`}
          aria-hidden="true"
        >
          {big}
        </span>
      </div>
      <div className={`flex items-center justify-between text-[13px] ${feature ? 'opacity-85' : 'text-ink-2'}`}>
        <span>
          {gradeLabel[collection.grade]} · 자료 {count}종
        </span>
        <span className="inline-flex items-center gap-1 font-semibold">
          자료 보기 <Icon name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
