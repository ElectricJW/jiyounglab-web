import { SheetPage } from '../components/Sheet'
import { Breadcrumbs, ButtonLink, Icon } from '../components/ui'
import { productById } from '../data/products'

export function About() {
  const an = productById.get('p-2609h2-an')!
  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '지영랩 소개' }]} />
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <p className="eyebrow mb-4">JIYOUNGLAB</p>
          <h1 className="font-display text-[34px] font-semibold leading-[1.25] tracking-[-0.035em] md:text-[46px]">
            가르치는 사람이
            <br />
            다시 고치지 않아도 되는 자료
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.85] text-ink-2">
            지영랩은 중·고등 영어를 가르치는 선생님을 위한 자료를 만듭니다. 시험이 끝난 직후 가장 바쁜 2주 동안, 선생님이 자료를 만드는 대신 학생을 볼
            수 있도록 돕는 것이 목표입니다. 그래서 문항 하나, 해설 한 줄까지 수업에서 그대로 쓸 수 있는지를 기준으로 검수합니다.
          </p>
        </div>
        <div className="mx-auto w-full max-w-[400px] rotate-[2deg] shadow-pop">
          <SheetPage product={an} />
        </div>
      </div>

      <section className="mt-24 grid gap-px overflow-hidden rounded-[18px] border border-line bg-line md:grid-cols-3">
        {[
          ['문항은 진단 도구입니다', '좋은 문항은 학생이 무엇을 이해했고 무엇을 놓쳤는지 알려 줍니다. 정답을 기억한 학생과 이해한 학생이 갈리도록 설계합니다.'],
          ['해설은 수업 대본입니다', '정답 근거 한 문장과 오답이 매력적인 이유를 함께 씁니다. 해설만 읽고도 수업을 진행할 수 있게 합니다.'],
          ['자료는 계속 고쳐집니다', '오류를 발견하면 숨기지 않고 고친 뒤 수정 이력에 남깁니다. 구매하신 분은 언제나 최신본을 받습니다.'],
        ].map(([t, d]) => (
          <div key={t} className="bg-surface p-7">
            <p className="font-display text-[20px] font-semibold tracking-[-0.015em]">{t}</p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{d}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[18px] bg-night p-8 text-on-night md:p-10">
        <div className="max-w-xl">
          <h2 className="font-display text-[24px] font-semibold tracking-[-0.02em]">설계 원칙을 자세히 읽어 보세요</h2>
          <p className="mt-2 opacity-80">변형문제를 만들 때 거치는 네 단계와, 각 단계에서 버리는 문항의 기준을 정리했습니다.</p>
        </div>
        <ButtonLink to="/blog/what-a-good-transform-question-changes" variant="outline">
          글 읽기 <Icon name="arrow" size={16} />
        </ButtonLink>
      </section>
    </div>
  )
}
