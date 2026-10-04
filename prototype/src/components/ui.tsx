import type { ButtonHTMLAttributes, ReactNode, SVGProps } from 'react'
import type { MaterialType } from '../data/types'
import { typeLabel, typeVar } from '../lib/format'
import { Link } from '../lib/router'

/* ── Icons (1.6px stroke, 20px grid) ─────────────────────────────────── */

type IconName =
  | 'search'
  | 'cart'
  | 'arrow'
  | 'arrow-left'
  | 'check'
  | 'x'
  | 'menu'
  | 'download'
  | 'lock'
  | 'file'
  | 'chevron'
  | 'refresh'
  | 'shield'
  | 'eye'
  | 'edit'
  | 'user'
  | 'mail'
  | 'layers'
  | 'filter'
  | 'building'

const paths: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.2 13.2 4 4" />
    </>
  ),
  cart: (
    <>
      <path d="M2.5 3.5h2l1.8 9.2a1.3 1.3 0 0 0 1.3 1h7.2a1.3 1.3 0 0 0 1.3-1l1.2-6.2H5.3" />
      <circle cx="8" cy="17" r="1" />
      <circle cx="14.5" cy="17" r="1" />
    </>
  ),
  arrow: <path d="M4 10h12m-4.5-4.5L16 10l-4.5 4.5" />,
  'arrow-left': <path d="M16 10H4m4.5-4.5L4 10l4.5 4.5" />,
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  x: <path d="m5 5 10 10M15 5 5 15" />,
  menu: <path d="M3 6h14M3 10h14M3 14h14" />,
  download: <path d="M10 3v10m-4-4 4 4 4-4M4 16.5h12" />,
  lock: (
    <>
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </>
  ),
  file: (
    <>
      <path d="M5.5 2.5h6l4 4v11h-10z" />
      <path d="M11.5 2.5v4h4" />
    </>
  ),
  chevron: <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />,
  refresh: <path d="M15.5 8A6 6 0 1 0 16 11.5M15.5 3.5V8H11" />,
  shield: (
    <>
      <path d="M10 2.5 4 5v4.5c0 3.8 2.6 6.6 6 8 3.4-1.4 6-4.2 6-8V5z" />
      <path d="m7.3 10 2 2 3.6-3.8" />
    </>
  ),
  eye: (
    <>
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" />
      <circle cx="10" cy="10" r="2.3" />
    </>
  ),
  edit: <path d="m12.5 4 3.5 3.5L7.5 16H4v-3.5zM10.5 6l3.5 3.5" />,
  user: (
    <>
      <circle cx="10" cy="7" r="3.2" />
      <path d="M3.8 17c.8-3.2 3.3-4.8 6.2-4.8s5.4 1.6 6.2 4.8" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="m3 5.5 7 5.5 7-5.5" />
    </>
  ),
  layers: <path d="m10 2.5 7.5 4-7.5 4-7.5-4zM2.5 10l7.5 4 7.5-4M2.5 13.5l7.5 4 7.5-4" />,
  filter: <path d="M3 5h14M6 10h8M8.5 15h3" />,
  building: (
    <>
      <path d="M4 17.5V3.5h8v14M12 7.5h4v10M2.5 17.5h15" />
      <path d="M6.5 6.5h3M6.5 9.5h3M6.5 12.5h3" />
    </>
  ),
}

export function Icon({ name, size = 18, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}

/* ── Buttons: CTA hierarchy ──────────────────────────────────────────────
   buy      OMR red, one per view: the purchase decision
   primary  ink: main navigation action (explore, add to cart)
   free     teal outline: free-resource acquisition
   outline  secondary action
   ghost    tertiary, in-line
*/
type Variant = 'buy' | 'primary' | 'free' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantCls: Record<Variant, string> = {
  buy: 'bg-omr text-omr-ink hover:brightness-110 shadow-[0_8px_20px_-10px_var(--omr)]',
  primary: 'bg-ink text-on-ink hover:opacity-90',
  free: 'border border-free text-free bg-free-soft hover:bg-free hover:text-on-ink',
  outline: 'border border-line-strong text-ink bg-surface hover:border-ink',
  ghost: 'text-ink hover:bg-surface-2',
}
const sizeCls: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-[14px] gap-2',
  lg: 'h-13 px-6 text-[15px] gap-2',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `inline-flex items-center justify-center rounded-[10px] font-semibold tracking-[-0.01em] whitespace-nowrap transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variantCls[variant]} ${sizeCls[size]} ${extra}`
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: { variant?: Variant; size?: Size } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={buttonClass(variant, size, className)} {...rest} />
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}

/* ── Badges ──────────────────────────────────────────────────────────── */

export function TypeBadge({ type, className = '' }: { type: MaterialType; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${className}`}
      style={{ color: typeVar[type] }}
    >
      <span className="size-2 rounded-full" style={{ background: typeVar[type] }} aria-hidden="true" />
      {typeLabel[type]}
    </span>
  )
}

export function FormatChip({ format, editable }: { format: string; editable?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[5px] border border-line-strong px-1.5 py-px font-mono text-[11px] font-medium text-ink-2"
      title={editable ? '편집 가능한 파일' : undefined}
    >
      {format}
      {editable && <Icon name="edit" size={11} />}
    </span>
  )
}

export function Tag({ tone = 'neutral', children }: { tone?: 'neutral' | 'new' | 'free' | 'omr' | 'ink'; children: ReactNode }) {
  const cls = {
    neutral: 'bg-surface-2 text-ink-2',
    new: 'bg-navy-soft text-ink',
    free: 'bg-free-soft text-free',
    omr: 'bg-omr-soft text-omr',
    ink: 'bg-ink text-on-ink',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${cls}`}>{children}</span>
}

export function VersionStamp({ version, date }: { version: string; date: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-ink-3">
      <Icon name="refresh" size={12} />
      {version} · {date}
    </span>
  )
}

/* ── OMR bubble: the brand's signature mark ──────────────────────────── */

export function Bubble({ filled, n, className = '' }: { filled?: boolean; n?: number | string; className?: string }) {
  return (
    <span
      className={`inline-grid size-[1.15em] place-items-center rounded-full border font-mono text-[0.62em] leading-none ${
        filled ? 'border-sheet-ink bg-sheet-ink text-sheet' : 'border-sheet-omr text-sheet-omr'
      } ${className}`}
      aria-hidden="true"
    >
      {n}
    </span>
  )
}

export function SectionHead({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow?: string
  title: ReactNode
  desc?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-[26px] font-semibold leading-[1.3] tracking-[-0.02em] md:text-[32px]">{title}</h2>
        {desc && <p className="mt-3 text-[15px] text-ink-2">{desc}</p>}
      </div>
      {action}
    </div>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="현재 위치" className="mb-6 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-3">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {i > 0 && <Icon name="chevron" size={12} />}
          {it.to ? (
            <Link to={it.to} className="hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink-2">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
