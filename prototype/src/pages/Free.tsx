import { SheetPage } from '../components/Sheet'
import { Breadcrumbs, Button, Icon, SectionHead, TypeBadge } from '../components/ui'
import { productById, products } from '../data/products'
import { gradeLabel } from '../lib/format'
import { Link } from '../lib/router'
import { useStore } from '../lib/store'

export function Free() {
  const { openDialog } = useStore()
  const free = products.filter((p) => p.access === 'free')
  const [lead, ...rest] = free
  const samples = ['p-2609h2-ta', 'p-2609h2-vo', 'p-gc-07', 'p-2609h2-an'].map((id) => productById.get(id)!)
  const leadPaid = productById.get('p-2609h2-vo')!

  return (
    <>
      <section className="border-b border-line bg-free-soft">
        <div className="wrap pb-14 pt-10">
          <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '무료자료' }]} />
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div className="min-w-0">
              <p className="eyebrow mb-4 !text-free">무료자료</p>
              <h1 className="font-display text-[34px] font-semibold leading-[1.22] tracking-[-0.035em] md:text-[46px]">
                써 보고 판단하세요.
                <br />
                유료 자료와 같은 원고입니다.
              </h1>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-2">
                무료자료는 따로 만든 맛보기가 아니라, 같은 검수를 거친 실제 자료에서 떼어 온 페이지입니다. 이메일 인증만 하면 바로 받고, 내 자료실에서
                수정판까지 계속 받을 수 있습니다.
              </p>
              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                {[
                  ['eye', '샘플', '모든 유료 자료 · 로그인 없이'],
                  ['download', '무료자료', '이메일 인증 후 바로'],
                  ['mail', '시험 알림', '새 회차 자료가 나오면'],
                ].map(([icon, t, d]) => (
                  <div key={t} className="rounded-[12px] border border-free/25 bg-surface px-4 py-3">
                    <Icon name={icon as 'eye'} size={18} className="text-free" />
                    <p className="mt-2 text-[14px] font-semibold">{t}</p>
                    <p className="text-[12.5px] text-ink-2">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute right-0 top-[6%] w-[76%] rotate-[5deg] shadow-sheet" aria-hidden="true">
                <SheetPage product={leadPaid} page={1} />
              </div>
              <div className="relative w-[84%] -rotate-[2deg] shadow-pop">
                <SheetPage product={lead} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="pt-16">
          <div className="grid gap-8 rounded-[18px] border border-line bg-surface p-6 md:grid-cols-[200px_1fr] md:p-8">
            <div className="mx-auto w-[160px] shadow-sheet md:w-full">
              <SheetPage product={lead} />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="text-[12.5px] font-semibold text-free">이번 주 무료자료</p>
              <h2 className="mt-1 font-display text-[24px] font-semibold leading-snug tracking-[-0.02em] md:text-[28px]">{lead.title}</h2>
              <p className="mt-3 max-w-2xl text-[15px] text-ink-2">{lead.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-ink-2">
                {lead.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-1.5">
                    <Icon name="check" size={15} className="text-free" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-auto md:pt-6">
                <Button variant="free" size="lg" onClick={() => openDialog({ kind: 'free-claim', productId: lead.id })}>
                  <Icon name="download" size={17} /> 무료로 받기
                </Button>
                <Link to={`/materials/${leadPaid.slug}`} className="text-[14px] text-ink-2 underline underline-offset-2 hover:text-ink">
                  전체 420개 어휘 + Daily Test 보기
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-16">
          <SectionHead title="무료자료 전체" desc="받은 자료는 내 자료실에 보관됩니다." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <article key={p.id} className="flex min-w-0 flex-col rounded-[14px] border border-line bg-surface">
                <Link to={`/materials/${p.slug}`} className="block rounded-t-[14px] bg-surface-2 px-[18%] pt-6">
                  <div className="h-[170px] overflow-hidden shadow-sheet">
                    <SheetPage product={p} />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between">
                    <TypeBadge type={p.type} />
                    <span className="font-mono text-[11px] text-ink-3">{p.grades.map((g) => gradeLabel[g]).join('·')}</span>
                  </div>
                  <Link to={`/materials/${p.slug}`} className="text-[16px] font-semibold leading-snug hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-[13.5px] text-ink-2">{p.summary}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="flex gap-1">
                      {[...new Set(p.files.map((f) => f.format))].map((f) => (
                        <span key={f} className="rounded-[5px] border border-line-strong px-1.5 font-mono text-[11px] text-ink-2">
                          {f}
                        </span>
                      ))}
                    </span>
                    <Button variant="free" size="sm" onClick={() => openDialog({ kind: 'free-claim', productId: p.id })}>
                      무료로 받기
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-20">
          <SectionHead
            eyebrow="샘플"
            title="유료 자료도 앞 페이지는 공개합니다"
            desc="로그인 없이 바로 열어 볼 수 있습니다. 구매 전에 문항 수준과 해설 방식을 확인하세요."
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {samples.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openDialog({ kind: 'sample', productId: p.id })}
                className="group flex min-w-0 flex-col gap-3 rounded-[14px] border border-line bg-surface p-3 text-left hover:border-line-strong"
              >
                <div className="relative overflow-hidden rounded-md bg-surface-2 p-3">
                  <div className="shadow-sheet transition group-hover:-translate-y-1">
                    <SheetPage product={p} />
                  </div>
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-semibold text-on-ink">
                    <Icon name="eye" size={13} /> 샘플
                  </span>
                </div>
                <TypeBadge type={p.type} />
                <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug">{p.title}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
