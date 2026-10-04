import { useState } from 'react'
import { PriceLine } from '../components/Cards'
import { SheetPage } from '../components/Sheet'
import { Breadcrumbs, Button, ButtonLink, Icon, TypeBadge } from '../components/ui'
import { postBySlug, posts } from '../data/posts'
import { productById } from '../data/products'
import type { BlogBlock, BlogPost } from '../data/types'
import { Link } from '../lib/router'
import { useStore } from '../lib/store'
import { NotFound } from './NotFound'

const CATS = ['전체', '시험 분석', '내신 대비', '수업 노하우', '문법·어휘', '지영랩 소식'] as const

export function BlogIndex() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('전체')
  const list = posts.filter((p) => cat === '전체' || p.category === cat)
  const featured = posts.find((p) => p.featured)!
  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '블로그' }]} />
      <h1 className="font-display text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">수업 노트</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-2">자료를 만들며 정리한 출제 원칙, 시험 직후 수업 설계, 문법·어휘 지도법을 공유합니다.</p>

      {cat === '전체' && (
        <Link
          to={`/blog/${featured.slug}`}
          className="group mt-10 grid overflow-hidden rounded-[18px] border border-line bg-surface md:grid-cols-[1.3fr_1fr]"
        >
          <div className="flex min-w-0 flex-col justify-between gap-8 p-7 md:p-10">
            <div>
              <p className="font-mono text-[11.5px] tracking-[0.06em] text-ink-3">
                {featured.category} · {featured.date} · {featured.readMinutes}분 읽기
              </p>
              <h2 className="mt-4 font-display text-[28px] font-semibold leading-snug tracking-[-0.025em] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-[6px] md:text-[36px]">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-2">{featured.excerpt}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[14px] font-semibold">
              읽기 <Icon name="arrow" size={15} />
            </span>
          </div>
          <div className="relative hidden min-h-[280px] bg-night md:block" aria-hidden="true">
            <div className="absolute inset-x-[16%] top-[12%] rotate-[3deg] shadow-pop">
              <SheetPage product={productById.get('p-2609h2-ta')!} marked />
            </div>
          </div>
        </Link>
      )}

      <div className="no-scrollbar mt-12 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="카테고리">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`-mb-px h-11 shrink-0 border-b-2 px-3 text-[14px] font-medium transition ${
              cat === c ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="grid gap-x-10 md:grid-cols-2">
        {list.map((p) => (
          <li key={p.slug} className="border-b border-line">
            <Link to={`/blog/${p.slug}`} className="group flex flex-col gap-2 py-7">
              <span className="font-mono text-[11.5px] tracking-[0.05em] text-ink-3">
                {p.category} · {p.date} · {p.readMinutes}분
              </span>
              <span className="font-display text-[20px] font-semibold leading-snug tracking-[-0.015em] group-hover:underline group-hover:underline-offset-4">
                {p.title}
              </span>
              <span className="line-clamp-2 text-[14.5px] text-ink-2">{p.excerpt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InlineFree({ id }: { id: string }) {
  const p = productById.get(id)
  const { openDialog } = useStore()
  if (!p) return null
  return (
    <aside className="not-prose my-10 flex items-center gap-5 rounded-[14px] border border-free/30 bg-free-soft p-5">
      <div className="w-[72px] shrink-0 shadow-sheet">
        <SheetPage product={p} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-free">무료자료</p>
        <p className="text-[15.5px] font-semibold leading-snug">{p.title}</p>
        <p className="mt-0.5 text-[13px] text-ink-2">{p.subtitle}</p>
      </div>
      <Button variant="free" size="sm" onClick={() => openDialog({ kind: 'free-claim', productId: p.id })}>
        받기
      </Button>
    </aside>
  )
}

function InlineProduct({ id }: { id: string }) {
  const p = productById.get(id)
  if (!p) return null
  return (
    <aside className="my-10 rounded-[14px] border border-line bg-surface p-5">
      <p className="eyebrow mb-3">이 글에서 다룬 자료</p>
      <Link to={`/materials/${p.slug}`} className="group flex items-center gap-5">
        <div className="w-[72px] shrink-0 shadow-sheet">
          <SheetPage product={p.packageItems ? productById.get(p.packageItems[0])! : p} />
        </div>
        <div className="min-w-0 flex-1">
          <TypeBadge type={p.type} />
          <p className="mt-0.5 text-[15.5px] font-semibold leading-snug group-hover:underline">{p.title}</p>
          <p className="mt-1">
            <PriceLine product={p} />
          </p>
        </div>
        <Icon name="arrow" size={18} className="shrink-0 text-ink-3" />
      </Link>
    </aside>
  )
}

function Block({ b }: { b: BlogBlock }) {
  switch (b.t) {
    case 'p':
      return <p>{b.text}</p>
    case 'h2':
      return <h2 id={b.id}>{b.text}</h2>
    case 'h3':
      return <h3>{b.text}</h3>
    case 'ul':
      return (
        <ul>
          {b.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )
    case 'quote':
      return <blockquote>{b.text}</blockquote>
    case 'steps':
      return (
        <ol className="my-8 grid gap-3 sm:grid-cols-2">
          {b.items.map((s, i) => (
            <li key={s.title} className="rounded-[12px] border border-line bg-surface p-4">
              <p className="flex items-center gap-2 font-semibold">
                <span className="num grid size-6 place-items-center rounded-full bg-ink font-mono text-[12px] text-on-ink">{i + 1}</span>
                {s.title}
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      )
    case 'cta-free':
      return <InlineFree id={b.productId} />
    case 'cta-product':
      return <InlineProduct id={b.productId} />
  }
}

export function BlogPostPage({ slug }: { slug: string }) {
  const post = postBySlug.get(slug)
  if (!post) return <NotFound />
  const toc = (post.body ?? []).filter((b): b is Extract<BlogBlock, { t: 'h2' }> => b.t === 'h2')
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3)
  return (
    <article className="wrap pt-10">
      <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '블로그', to: '/blog' }, { label: post.category }]} />
      <header className="max-w-3xl">
        <p className="font-mono text-[12px] tracking-[0.06em] text-ink-3">
          {post.category} · {post.date} · {post.readMinutes}분 읽기
        </p>
        <h1 className="mt-4 font-display text-[32px] font-semibold leading-[1.28] tracking-[-0.03em] md:text-[44px]">{post.title}</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-ink-2">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-3 border-y border-line py-4 text-[13.5px]">
          <span className="grid size-9 place-items-center rounded-full bg-ink font-display text-[15px] font-semibold text-on-ink">지</span>
          <span>
            <span className="block font-semibold">지영랩 편집팀</span>
            <span className="block text-ink-3">중·고등 영어 자료 제작</span>
          </span>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_240px]">
        <div className="prose-jy min-w-0">
          {(post.body ?? []).map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </div>
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="eyebrow mb-3">이 글의 순서</p>
              <ol className="space-y-2 border-l border-line pl-4 text-[13.5px]">
                {toc.map((h) => (
                  <li key={h.id}>
                    <button type="button" className="text-left text-ink-2 hover:text-ink" onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })}>
                      {h.text}
                    </button>
                  </li>
                ))}
              </ol>
              <RelatedSide post={post} />
            </div>
          </aside>
        )}
      </div>

      <section className="mt-16 border-t border-line pt-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em]">다른 글</h2>
          <ButtonLink to="/blog" variant="ghost" size="sm">
            전체 글 <Icon name="arrow" size={15} />
          </ButtonLink>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {more.map((p) => (
            <li key={p.slug}>
              <Link to={`/blog/${p.slug}`} className="group flex h-full flex-col gap-2 rounded-[14px] border border-line bg-surface p-5 hover:border-line-strong">
                <span className="font-mono text-[11px] text-ink-3">{p.category}</span>
                <span className="font-semibold leading-snug group-hover:underline">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}

function RelatedSide({ post }: { post: BlogPost }) {
  const p = post.relatedProducts[0] ? productById.get(post.relatedProducts[0]) : undefined
  if (!p) return null
  return (
    <Link to={`/materials/${p.slug}`} className="mt-8 block rounded-[12px] border border-line bg-surface p-4 hover:border-line-strong">
      <p className="text-[11.5px] font-semibold text-ink-3">관련 자료</p>
      <p className="mt-1 text-[13.5px] font-semibold leading-snug">{p.title}</p>
      <p className="mt-2 text-[13px]">
        <PriceLine product={p} />
      </p>
    </Link>
  )
}
