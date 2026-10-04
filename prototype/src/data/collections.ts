import type { Collection, ExamItem } from './types'

// DEMO SEED DATA — not real products. Exam passages are never reproduced on public pages (D6);
// hubs show only exam structure and which JIYOUNGLAB materials cover each item.

const SET_A = 'p-2609h2-ta'
const SET_B = 'p-2609h2-tb'
const WR = 'p-2609h2-wr'
const VO = 'p-2609h2-vo'
const AN = 'p-2609h2-an'

const writingItems = new Set(['20', '22', '24', '29', '31', '33', '36', '38', '40', '41–42'])

const kinds: [string, string][] = [
  ['18', '글의 목적'],
  ['19', '심경 변화'],
  ['20', '필자의 주장'],
  ['21', '함축 의미'],
  ['22', '글의 요지'],
  ['23', '글의 주제'],
  ['24', '글의 제목'],
  ['25', '도표'],
  ['26', '내용 일치'],
  ['27', '안내문'],
  ['28', '안내문'],
  ['29', '어법'],
  ['30', '어휘'],
  ['31', '빈칸 추론'],
  ['32', '빈칸 추론'],
  ['33', '빈칸 추론'],
  ['34', '빈칸 추론'],
  ['35', '무관한 문장'],
  ['36', '글의 순서'],
  ['37', '글의 순서'],
  ['38', '문장 삽입'],
  ['39', '문장 삽입'],
  ['40', '요약문 완성'],
  ['41–42', '장문 (제목·어휘)'],
  ['43–45', '장문 (순서·지칭·내용)'],
]

const h2Items: ExamItem[] = kinds.map(([no, kind]) => {
  const first = Number.parseInt(no, 10)
  const products = [first <= 30 ? SET_A : SET_B, VO, AN]
  if (writingItems.has(no)) products.push(WR)
  return { no, kind, products }
})

export const collections: Collection[] = [
  {
    demo: true,
    key: 'mock:2026-09:h2',
    slug: '2026-09-h2',
    kind: 'mock',
    title: '2026 고2 9월 모의고사',
    shortTitle: '고2 9월',
    org: '전국연합학력평가',
    grade: 'h2',
    year: '2026',
    month: '09',
    isSeasonal: true,
    intro:
      '2026년 9월 고2 전국연합학력평가 영어 독해 28문항(18–45번)을 기준으로 만든 지영랩 자료입니다. 문항별로 어떤 자료가 다루는지 아래 표에서 확인하고, 수업 목적에 맞게 단품이나 패키지로 고르세요.',
    facts: [
      { label: '대상', value: '고등학교 2학년' },
      { label: '시행', value: '2026년 9월' },
      { label: '범위', value: '독해 18–45번 (28문항)' },
      { label: '자료', value: '단품 5종 · 패키지 1종' },
    ],
    items: h2Items,
  },
  {
    demo: true,
    key: 'mock:2026-09:h1',
    slug: '2026-09-h1',
    kind: 'mock',
    title: '2026 고1 9월 모의고사',
    shortTitle: '고1 9월',
    org: '전국연합학력평가',
    grade: 'h1',
    year: '2026',
    month: '09',
    isSeasonal: true,
    intro: '2026년 9월 고1 전국연합학력평가 독해 전 지문을 기준으로 만든 변형문제와 어휘 자료입니다.',
    facts: [
      { label: '대상', value: '고등학교 1학년' },
      { label: '시행', value: '2026년 9월' },
      { label: '범위', value: '독해 18–45번 (28문항)' },
      { label: '자료', value: '단품 2종' },
    ],
  },
  {
    demo: true,
    key: 'kice:2027-09',
    slug: '2027-kice-09',
    kind: 'kice',
    title: '2027학년도 9월 모의평가',
    shortTitle: '고3 9월 모평',
    org: '한국교육과정평가원',
    grade: 'h3',
    year: '2027학년도',
    month: '09',
    isSeasonal: true,
    intro: '수능 직전 마지막 평가원 모의평가입니다. 변형문제는 고난도 유형(빈칸·순서·삽입) 비중을 높여 구성했습니다.',
    facts: [
      { label: '대상', value: '고등학교 3학년' },
      { label: '시행', value: '2026년 9월' },
      { label: '범위', value: '독해 18–45번 (28문항)' },
      { label: '자료', value: '단품 2종' },
    ],
  },
  {
    demo: true,
    key: 'mock:2026-06:h2',
    slug: '2026-06-h2',
    kind: 'mock',
    title: '2026 고2 6월 모의고사',
    shortTitle: '고2 6월',
    org: '전국연합학력평가',
    grade: 'h2',
    year: '2026',
    month: '06',
    intro: '2026년 6월 고2 전국연합학력평가 기준 자료입니다.',
    facts: [
      { label: '대상', value: '고등학교 2학년' },
      { label: '시행', value: '2026년 6월' },
      { label: '범위', value: '독해 18–45번 (28문항)' },
      { label: '자료', value: '단품 1종' },
    ],
  },
  {
    demo: true,
    key: 'textbook:donga-yoon:m3',
    slug: 'donga-yoon-m3',
    kind: 'textbook',
    title: '중3 영어 동아(윤정미)',
    shortTitle: '중3 동아(윤)',
    org: '동아출판',
    grade: 'm3',
    year: '2026',
    intro: '단원별 본문·문법 포인트를 학교 시험 형식으로 정리한 내신 대비 자료입니다.',
    facts: [
      { label: '대상', value: '중학교 3학년' },
      { label: '교재', value: '동아출판 (윤정미)' },
      { label: '구성', value: '단원별 워크북' },
      { label: '자료', value: '단품 1종' },
    ],
  },
  {
    demo: true,
    key: 'textbook:ne-common1:h1',
    slug: 'ne-common1-h1',
    kind: 'textbook',
    title: '고1 공통영어1 NE능률',
    shortTitle: '공통영어1 능률',
    org: 'NE능률',
    grade: 'h1',
    year: '2026',
    intro: '공통영어1 교과서 본문을 기준으로 만든 내신 변형문제입니다.',
    facts: [
      { label: '대상', value: '고등학교 1학년' },
      { label: '교재', value: 'NE능률 공통영어1' },
      { label: '구성', value: '단원별 변형문제' },
      { label: '자료', value: '단품 1종' },
    ],
  },
  {
    demo: true,
    key: 'curriculum:grammar-core',
    slug: 'grammar-core-20',
    kind: 'curriculum',
    title: 'Grammar Core 20',
    shortTitle: 'Grammar Core',
    org: '지영랩 자체 커리큘럼',
    grade: 'h1',
    year: '2026',
    intro: '고등 내신과 수능 어법에서 반복해서 나오는 20개 문법 단원을 한 단원씩 끝내는 워크시트 시리즈입니다.',
    facts: [
      { label: '대상', value: '고1–고2' },
      { label: '구성', value: '20단원 · 단원별 12쪽' },
      { label: '형식', value: 'PDF + HWP' },
      { label: '자료', value: '단원 4종 · 세트 1종' },
    ],
  },
]

export const collectionByKey = new Map(collections.map((c) => [c.key, c]))
export const collectionBySlug = new Map(collections.map((c) => [c.slug, c]))
