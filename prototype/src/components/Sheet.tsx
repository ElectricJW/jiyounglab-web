import type { ReactNode } from 'react'
import type { Product } from '../data/types'
import { gradeLabel } from '../lib/format'
import { Bubble } from './ui'

/*
  Printed worksheet pages rendered in HTML. Sizes are in `em` and the root font scales with
  the container width (cqw), so one component serves hero art, card thumbnails and the
  full-size sample viewer. All passages here are original demo text written for the prototype.
*/

const PASSAGE_A =
  'When students reread a chapter the night before a test, the pages begin to feel familiar, and that comfortable sense of recognition is easily mistaken for understanding. Recognition, however, is a much easier task than recall. Seeing an answer and thinking “I knew that” requires only that the information be stored somewhere in memory; producing it on a blank page requires that it be retrieved. Learners who test themselves, even when they fail, discover the gaps that rereading conceals. The struggle to remember is not a sign that learning has gone wrong. It is often the very moment learning takes place.'

const PASSAGE_B_1 =
  'City planners once treated street trees as decoration, something to be added after the roads and buildings were finished. That view is changing as summers grow hotter. A mature tree can lower the temperature of the pavement beneath it considerably, and a street lined with trees can feel noticeably cooler than one a block away. Yet the benefit depends on '
const PASSAGE_B_2 =
  '. A young tree planted in a narrow pit, surrounded by concrete, rarely survives long enough to cast meaningful shade.'

const PASSAGE_C =
  'Experienced musicians often practice difficult passages far more slowly than they will ever perform them. To an observer, this can look like a waste of time. But slow practice allows the player to notice exactly which movement causes an error, and it prevents the hands from rehearsing the mistake.'

function SheetFrame({
  product,
  page,
  total,
  label,
  children,
}: {
  product: Product
  page: number
  total: number
  label: string
  children: ReactNode
}) {
  return (
    <div className="@container w-full">
      <div
        className="relative flex aspect-[1/1.414] w-full flex-col overflow-hidden bg-sheet text-sheet-ink"
        style={{ fontSize: '2.15cqw', padding: '5.2em 4.6em 3.6em' }}
      >
        <header className="flex items-end justify-between border-b-[0.16em] border-sheet-ink pb-[0.6em]">
          <div>
            <p className="font-mono text-[0.72em] tracking-[0.12em] text-sheet-mute">JIYOUNGLAB · {product.grades.map((g) => gradeLabel[g]).join('·')}</p>
            <p className="mt-[0.2em] font-display text-[1.32em] font-semibold leading-tight">{label}</p>
          </div>
          <p className="font-mono text-[0.72em] text-sheet-mute">{product.code}</p>
        </header>
        <div className="min-h-0 flex-1 pt-[1.2em]">{children}</div>
        <footer className="mt-[1em] flex items-center justify-between border-t border-sheet-line pt-[0.6em] font-mono text-[0.68em] text-sheet-mute">
          <span>지영랩 · 무단 복제·배포 금지</span>
          <span className="num">
            {page + 1} / {total}
          </span>
        </footer>
      </div>
    </div>
  )
}

function Choices({ items, marked }: { items: string[]; marked?: number }) {
  return (
    <ol className="mt-[0.7em] space-y-[0.32em]">
      {items.map((c, i) => (
        <li key={i} className="flex gap-[0.5em]">
          <Bubble n={i + 1} filled={marked === i} className={marked === i ? 'anim-mark' : ''} />
          <span className="min-w-0">{c}</span>
        </li>
      ))}
    </ol>
  )
}

function Q({ no, stem, children }: { no: string; stem: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <p className="font-semibold leading-snug">
        <span className="font-mono">{no}.</span> {stem}
      </p>
      {children}
    </section>
  )
}

function McqPage({ marked }: { marked?: boolean }) {
  return (
    <div className="grid h-full grid-cols-2 gap-[1.6em] text-[0.86em] leading-[1.5]">
      <Q no="1" stem="다음 글의 요지로 가장 적절한 것은?">
        <p className="mt-[0.6em] border border-sheet-line p-[0.7em] font-sheet text-[0.98em] leading-[1.55]">{PASSAGE_A}</p>
        <Choices
          marked={marked ? 1 : undefined}
          items={[
            '같은 내용을 반복해 읽는 것이 장기 기억에 가장 효과적이다.',
            '스스로 떠올리려는 노력이 실제 학습을 이끈다.',
            '시험 전날의 벼락치기는 학습 동기를 떨어뜨린다.',
            '익숙한 자료일수록 오답 가능성이 줄어든다.',
            '실패 경험은 학습자의 자신감을 약화시킨다.',
          ]}
        />
      </Q>
      <div className="flex flex-col gap-[1.4em] border-l border-sheet-line pl-[1.6em]">
        <Q no="2" stem="다음 빈칸에 들어갈 말로 가장 적절한 것은?">
          <p className="mt-[0.6em] font-sheet text-[0.98em] leading-[1.55]">
            {PASSAGE_B_1}
            <span className="inline-block w-[7em] border-b border-sheet-ink" />
            {PASSAGE_B_2}
          </p>
          <Choices
            marked={marked ? 1 : undefined}
            items={[
              'how quickly the city approves new projects',
              'whether the tree is given room to grow',
              'the color of the surrounding buildings',
              'the number of residents who walk nearby',
              'how often the street is repaved',
            ]}
          />
        </Q>
        <Q no="3" stem="윗글(1번)의 밑줄 친 부분 중, 어법상 틀린 것은?">
          <p className="mt-[0.5em] font-sheet text-[0.98em] leading-[1.55]">
            Recognition is a much <u>①easier</u> task than recall. Producing it <u>②requires</u> that it <u>③be</u> retrieved, and learners <u>④who</u> test themselves discover the gaps rereading <u>⑤conceal</u>.
          </p>
        </Q>
      </div>
    </div>
  )
}

function ExplanationPage() {
  const rows = [
    ['1', '②', '마지막 두 문장이 주제문. "떠올리려는 노력(struggle to remember)이 학습이 일어나는 순간"이라는 진술이 ②와 일치.', '①은 지문이 비판하는 rereading을 지지하므로 반대 진술.'],
    ['2', '②', '빈칸 뒤 문장이 "좁은 구덩이의 어린 나무는 오래 살지 못한다"는 반례 → 자랄 공간의 확보가 조건.', '④는 지문에 근거 없는 상식형 오답.'],
    ['3', '⑤', '관계절 (that) rereading conceals에서 동사의 주어는 the gaps가 아니라 rereading(단수) → conceals.', '③ be는 요구 동사 require 뒤 that절 원형.'],
  ]
  return (
    <div className="text-[0.86em] leading-[1.55]">
      <p className="mb-[0.8em] font-display text-[1.15em] font-semibold">정답 및 해설</p>
      <div className="space-y-[1em]">
        {rows.map(([no, ans, why, trap]) => (
          <div key={no} className="grid grid-cols-[3.2em_1fr] gap-[0.8em] border-t border-sheet-line pt-[0.8em]">
            <div>
              <p className="font-mono font-semibold">{no}번</p>
              <p className="mt-[0.2em] text-[1.3em] font-semibold text-sheet-omr">{ans}</p>
            </div>
            <div>
              <p>
                <span className="font-semibold">정답 근거</span> {why}
              </p>
              <p className="mt-[0.3em] text-sheet-mute">
                <span className="font-semibold text-sheet-ink">오답 함정</span> {trap}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const VOCAB: [string, string, string, string][] = [
  ['recognition', 'n.', '알아봄, 인식', 'awareness'],
  ['mistaken for', 'phr.', '~로 오인되다', 'confused with'],
  ['recall', 'n.', '(기억해 내는) 회상', 'retrieval'],
  ['retrieve', 'v.', '(기억을) 떠올리다', 'recover'],
  ['conceal', 'v.', '감추다, 숨기다', 'hide ↔ reveal'],
  ['decoration', 'n.', '장식(물)', 'ornament'],
  ['mature', 'a.', '다 자란, 성숙한', 'full-grown'],
  ['pavement', 'n.', '포장 도로', 'sidewalk'],
  ['noticeably', 'ad.', '눈에 띄게', 'markedly'],
  ['meaningful', 'a.', '의미 있는, 상당한', 'significant'],
  ['observer', 'n.', '관찰자, 지켜보는 사람', 'onlooker'],
  ['rehearse', 'v.', '반복 연습하다', 'practice'],
]

function VocabPage() {
  return (
    <div className="text-[0.84em]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-[0.12em] border-sheet-ink text-left font-mono text-[0.85em] text-sheet-mute">
            <th className="py-[0.4em] pr-[0.6em] font-medium">#</th>
            <th className="py-[0.4em] pr-[0.6em] font-medium">Word</th>
            <th className="py-[0.4em] pr-[0.6em] font-medium">품사</th>
            <th className="py-[0.4em] pr-[0.6em] font-medium">지문 속 의미</th>
            <th className="py-[0.4em] font-medium">유의·반의</th>
          </tr>
        </thead>
        <tbody>
          {VOCAB.map(([w, pos, m, s], i) => (
            <tr key={w} className="border-b border-sheet-line">
              <td className="num py-[0.48em] pr-[0.6em] font-mono text-sheet-mute">{String(i + 1).padStart(3, '0')}</td>
              <td className="py-[0.48em] pr-[0.6em] font-sheet font-semibold">{w}</td>
              <td className="py-[0.48em] pr-[0.6em] text-sheet-mute">{pos}</td>
              <td className="py-[0.48em] pr-[0.6em]">{m}</td>
              <td className="py-[0.48em] font-sheet text-sheet-mute">{s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DailyTestPage() {
  return (
    <div className="text-[0.86em]">
      <div className="mb-[1em] flex items-center justify-between border border-sheet-ink px-[0.8em] py-[0.5em]">
        <span className="font-display font-semibold">Daily Test 01</span>
        <span className="font-mono text-[0.85em]">이름 ________ 점수 ____ / 30</span>
      </div>
      <div className="grid grid-cols-2 gap-x-[1.6em] gap-y-[0.55em]">
        {VOCAB.slice(0, 12).map(([w], i) => (
          <p key={w} className="flex items-baseline gap-[0.5em] border-b border-sheet-line pb-[0.35em]">
            <span className="num w-[1.6em] font-mono text-sheet-mute">{i + 1}</span>
            <span className="font-sheet font-semibold">{w}</span>
            <span className="ml-auto w-[6em] border-b border-dotted border-sheet-mute" />
          </p>
        ))}
      </div>
    </div>
  )
}

function GrammarPage() {
  return (
    <div className="text-[0.86em] leading-[1.55]">
      <div className="border-[0.12em] border-sheet-ink p-[0.9em]">
        <p className="font-mono text-[0.8em] tracking-[0.1em] text-sheet-mute">UNIT 07 · 판단 순서</p>
        <ol className="mt-[0.5em] grid grid-cols-2 gap-[0.5em]">
          {['뒤 문장이 완전한가?', '앞에 선행사가 있는가?', '앞에 전치사가 있는가?', '콤마(,)가 있는가?'].map((s, i) => (
            <li key={s} className="flex items-center gap-[0.5em]">
              <span className="grid size-[1.6em] place-items-center rounded-full bg-sheet-ink font-mono text-[0.8em] text-sheet">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <p className="mt-[0.7em] text-sheet-mute">
          불완전 + 선행사 없음 → <b className="text-sheet-ink">what</b> · 불완전 + 선행사 있음 → <b className="text-sheet-ink">that / which</b> · 완전 → <b className="text-sheet-ink">관계부사 / 전치사+which</b>
        </p>
      </div>
      <p className="mt-[1.1em] font-semibold">A. 괄호 안에서 어법상 알맞은 것을 고르시오.</p>
      <ol className="mt-[0.5em] space-y-[0.55em] font-sheet">
        {[
          ['This is exactly (what / that) I wanted to say.', 0],
          ['The town (which / where) I grew up has changed a lot.', 1],
          ['She kept every letter (that / what) he had sent her.', 0],
          ['He finally told us the reason (why / which) he had left.', 0],
          ['The book, (that / which) was published in 1998, is still popular.', 1],
        ].map(([s, a], i) => (
          <li key={i} className="flex gap-[0.6em]">
            <span className="num font-mono text-sheet-mute">{i + 1}.</span>
            <span>{s as string}</span>
            {i === 0 && <span className="ml-auto font-sans text-[0.9em] text-sheet-omr">✓ {a === 0 ? 'what' : ''}</span>}
          </li>
        ))}
      </ol>
      <p className="mt-[1.1em] font-semibold">B. 다음 문장에서 틀린 곳을 찾아 바르게 고치시오.</p>
      <p className="mt-[0.4em] font-sheet">1. The museum that we visited it last summer was closed for repairs.</p>
      <p className="mt-[0.3em] border-b border-sheet-line pb-[0.3em] font-mono text-[0.85em] text-sheet-mute">→ ________________________</p>
    </div>
  )
}

function WritingPage() {
  return (
    <div className="text-[0.86em] leading-[1.55]">
      <p className="font-semibold">
        <span className="font-mono">1.</span> 다음 글의 내용을 한 문장으로 요약하고자 한다. &lt;조건&gt;에 맞게 빈칸 (A), (B)를 완성하시오. <span className="text-sheet-mute">[6점]</span>
      </p>
      <p className="mt-[0.7em] border border-sheet-line p-[0.8em] font-sheet leading-[1.6]">{PASSAGE_C}</p>
      <div className="mt-[0.9em] border-[0.12em] border-sheet-ink p-[0.8em]">
        <p className="font-semibold">&lt;조건&gt;</p>
        <ul className="mt-[0.3em] space-y-[0.2em]">
          <li>· (A)는 3단어, (B)는 2단어로 쓸 것</li>
          <li>· 본문에 있는 단어를 활용하되, 필요시 어형을 바꿀 것</li>
        </ul>
      </div>
      <p className="mt-[1em] font-sheet leading-[2]">
        Slow practice helps musicians identify <span className="inline-block w-[9em] border-b border-sheet-ink text-center font-sans text-[0.8em] text-sheet-mute">(A)</span> and
        keeps them from <span className="inline-block w-[7em] border-b border-sheet-ink text-center font-sans text-[0.8em] text-sheet-mute">(B)</span>.
      </p>
      <div className="mt-[1.1em] grid grid-cols-[auto_1fr] gap-x-[0.8em] gap-y-[0.3em] border-t border-sheet-line pt-[0.7em] text-[0.92em]">
        <span className="font-semibold">채점</span>
        <span>(A) 3점 · (B) 3점 · 어형 오류 1점 감점 · 단어 수 위반 시 해당 빈칸 0점</span>
        <span className="font-semibold">허용</span>
        <span className="text-sheet-mute">(A) the error’s cause / what causes errors … 허용 답안 목록 참조</span>
      </div>
    </div>
  )
}

function AnalysisPage() {
  const chunks = [
    { t: 'Recognition,', n: 'S' },
    { t: 'however,', n: '역접' },
    { t: 'is a much easier task', n: 'V·C  much=비교급 강조' },
    { t: 'than recall.', n: '' },
  ]
  return (
    <div className="text-[0.86em] leading-[1.6]">
      <p className="font-mono text-[0.8em] tracking-[0.1em] text-sheet-mute">PASSAGE 22 · 주제문 ★ · 어법 포인트 ◆</p>
      <div className="mt-[0.8em] space-y-[1.2em] font-sheet">
        <p>
          When students reread a chapter <span className="text-sheet-mute">/</span> the night before a test, <span className="text-sheet-mute">/</span> the pages begin to feel familiar,
          <span className="text-sheet-mute"> /</span> and that comfortable sense of recognition <span className="text-sheet-mute">/</span>{' '}
          <span className="underline decoration-sheet-omr decoration-[0.12em] underline-offset-[0.2em]">is easily mistaken for</span> understanding.
          <span className="ml-[0.4em] font-sans text-[0.82em] text-sheet-omr">◆ 수동태 + for</span>
        </p>
        <div>
          <p className="flex flex-wrap gap-x-[0.6em]">
            {chunks.map((c) => (
              <span key={c.t} className="inline-flex flex-col">
                <span className="border-b border-sheet-ink">{c.t}</span>
                <span className="font-sans text-[0.72em] text-sheet-omr">{c.n}</span>
              </span>
            ))}
          </p>
        </div>
        <p>
          <span className="font-sans text-sheet-omr">★ </span>
          <span className="bg-[color-mix(in_srgb,var(--sheet-omr)_14%,transparent)]">
            The struggle to remember is not a sign that learning has gone wrong. It is often the very moment learning takes place.
          </span>
        </p>
        <p>
          producing it on a blank page <span className="underline decoration-sheet-omr decoration-[0.12em] underline-offset-[0.2em]">requires that it be retrieved</span>
          <span className="ml-[0.4em] font-sans text-[0.82em] text-sheet-omr">◆ 요구 동사 + that + (should) 원형</span>
        </p>
      </div>
      <div className="mt-[1.2em] grid grid-cols-3 gap-[0.6em] border-t border-sheet-line pt-[0.7em] font-sans text-[0.88em]">
        <p>
          <b>주제</b> 인출 노력의 학습 효과
        </p>
        <p>
          <b>전개</b> 통념 → 반박 → 결론
        </p>
        <p>
          <b>내신 예상</b> 어법 2 · 요약 1
        </p>
      </div>
    </div>
  )
}

function ReportPage() {
  const rows = ['글의 목적 · 심경', '주장 · 요지 · 주제', '함축 의미', '도표 · 내용 일치', '어법 · 어휘', '빈칸 추론', '순서 · 삽입', '요약 · 장문']
  return (
    <div className="text-[0.86em]">
      <p className="mb-[0.8em] font-semibold">틀린 문항의 원인에 표시하세요.</p>
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="border-b-[0.12em] border-sheet-ink font-mono text-[0.82em] text-sheet-mute">
            <th className="py-[0.4em] text-left font-medium">유형</th>
            <th className="font-medium">어휘</th>
            <th className="font-medium">구문</th>
            <th className="font-medium">논리</th>
            <th className="font-medium">시간</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r} className="border-b border-sheet-line">
              <td className="py-[0.62em] text-left">{r}</td>
              {[0, 1, 2, 3].map((c) => (
                <td key={c}>
                  <span
                    className={`inline-block size-[0.95em] rounded-[0.15em] border ${
                      (i + c) % 5 === 1 ? 'border-sheet-ink bg-sheet-ink' : 'border-sheet-mute'
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-[1em] text-sheet-mute">시간 배분: 듣기 ___분 · 18–30번 ___분 · 31–45번 ___분</p>
    </div>
  )
}

const sheetLabel: Record<Product['sheet'], string> = {
  mcq: '변형문제',
  vocab: 'Vocabulary',
  grammar: 'Grammar Core',
  writing: '서술형',
  analysis: '지문분석 노트',
  report: '오답 점검표',
}

export function sheetPageCount(p: Product): number {
  return Math.max(p.specs.pages, 3)
}

export function SheetPage({ product, page = 0, marked }: { product: Product; page?: number; marked?: boolean }) {
  const total = sheetPageCount(product)
  let body: ReactNode
  let label = sheetLabel[product.sheet]
  const second = page % 2 === 1
  switch (product.sheet) {
    case 'mcq':
      body = second ? <ExplanationPage /> : <McqPage marked={marked} />
      if (second) label = '정답 및 해설'
      break
    case 'vocab':
      body = second ? <DailyTestPage /> : <VocabPage />
      if (second) label = 'Daily Test'
      break
    case 'grammar':
      body = <GrammarPage />
      break
    case 'writing':
      body = <WritingPage />
      break
    case 'analysis':
      body = <AnalysisPage />
      break
    case 'report':
      body = <ReportPage />
      break
  }
  return (
    <SheetFrame product={product} page={page} total={total} label={label}>
      {body}
    </SheetFrame>
  )
}
