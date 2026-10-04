import type { BlogPost } from './types'

// DEMO SEED DATA — sample articles that show the content-marketing format.

export const posts: BlogPost[] = [
  {
    demo: true,
    slug: 'what-a-good-transform-question-changes',
    title: '좋은 변형문제는 무엇을 바꾸는가',
    excerpt:
      '선지 순서만 바꾼 문제는 지문을 외운 학생을 걸러내지 못합니다. 지영랩이 변형문제를 설계할 때 거치는 네 단계와, 각 단계에서 버리는 문항의 기준을 정리했습니다.',
    category: '수업 노하우',
    date: '2026.09.22',
    readMinutes: 7,
    featured: true,
    relatedProducts: ['p-2609h2-ta', 'p-2609h2-pkg'],
    relatedFree: ['f-2609h2-vocab120'],
    body: [
      {
        t: 'p',
        text: '모의고사가 끝나면 학원과 학교에는 같은 지문으로 만든 변형문제가 쏟아집니다. 그런데 수업에서 써 보면 금방 차이가 드러납니다. 어떤 문제는 학생이 지문을 이해했는지를 묻고, 어떤 문제는 지문을 기억하는지만 묻습니다.',
      },
      {
        t: 'p',
        text: '선지 순서를 바꾸거나 단어 몇 개를 동의어로 바꾼 문제는 후자에 속합니다. 원 문항의 정답을 기억하는 학생은 지문을 다시 읽지 않고도 답을 고릅니다. 이런 문제로는 수업 후 누가 무엇을 이해했는지 알 수 없습니다.',
      },
      { t: 'h2', id: 'principle', text: '변형의 기준: 묻는 각도를 바꾼다' },
      {
        t: 'p',
        text: '지영랩의 변형 원칙은 하나입니다. 같은 지문을 원 문항과 다른 각도에서 묻습니다. 원 문항이 요지를 물었다면 변형은 빈칸이나 요약문으로, 원 문항이 어법을 물었다면 변형은 흐름이나 순서로 묻습니다.',
      },
      {
        t: 'quote',
        text: '학생이 원 문항의 정답을 기억해도 풀 수 없고, 지문을 이해했다면 반드시 풀 수 있어야 한다.',
      },
      { t: 'h2', id: 'steps', text: '설계 4단계' },
      {
        t: 'steps',
        items: [
          { title: '지문 해부', text: '주제문, 논리 전환 지점, 지시어와 연결어를 표시합니다. 변형할 수 있는 지점이 여기서 정해집니다.' },
          { title: '각도 선택', text: '원 문항과 겹치지 않는 유형을 지문당 2–3개 고릅니다. 주제문이 뚜렷한 지문은 빈칸, 전환이 많은 지문은 순서·삽입이 맞습니다.' },
          { title: '오답 설계', text: '오답 선지마다 "왜 매력적인가"를 한 줄로 적습니다. 이 한 줄을 쓰지 못하는 선지는 버립니다.' },
          { title: '교차 검수', text: '출제자가 아닌 검수자가 시간을 재고 풀어 봅니다. 정답 근거가 지문에서 한 문장으로 짚이지 않으면 다시 씁니다.' },
        ],
      },
      { t: 'cta-product', productId: 'p-2609h2-ta' },
      { t: 'h2', id: 'distractors', text: '오답 선지가 문제의 품질을 결정한다' },
      {
        t: 'p',
        text: '좋은 오답은 지문의 일부 내용과 맞지만 글 전체의 논지와는 어긋납니다. 학생이 이 선지를 고른다면, 그 학생은 문장 단위로는 읽었지만 글 단위로는 읽지 못한 것입니다. 해설에서 이 점을 짚어 주면 오답 하나가 수업 한 장면이 됩니다.',
      },
      {
        t: 'ul',
        items: [
          '지문에 나온 단어를 그대로 쓴 오답: 단어 매칭으로 푸는 습관을 확인합니다.',
          '부분적으로만 맞는 오답: 범위 판단(너무 넓거나 좁음)을 확인합니다.',
          '상식적으로는 맞는 오답: 지문 근거 없이 배경지식으로 푸는 습관을 확인합니다.',
        ],
      },
      { t: 'h2', id: 'in-class', text: '수업에서 쓰는 순서' },
      {
        t: 'p',
        text: '원 문항 → 변형 1 → 변형 2 순서로 쓰는 것을 권합니다. 원 문항을 다시 풀게 한 뒤 바로 변형을 풀게 하면, 원 문항 정답을 기억해서 맞힌 학생과 이해해서 맞힌 학생이 변형 문항에서 갈립니다.',
      },
      { t: 'cta-free', productId: 'f-2609h2-vocab120' },
      {
        t: 'p',
        text: '변형문제는 문제 수가 많다고 좋은 자료가 아닙니다. 한 문항 한 문항이 학생의 이해 상태를 알려 주는 진단 도구일 때 수업 시간을 아껴 줍니다.',
      },
    ],
  },
  {
    demo: true,
    slug: 'two-weeks-after-september-mock',
    title: '9월 모의고사 직후 2주, 수업은 이렇게 설계합니다',
    excerpt: '모의고사 직후 2주는 2학기 중간고사 범위와 겹치는 시기입니다. 변형문제·어휘·서술형을 어떤 순서로 배치하면 수업 4회 안에 끝낼 수 있는지 정리했습니다.',
    category: '시험 분석',
    date: '2026.09.15',
    readMinutes: 5,
    relatedProducts: ['p-2609h2-pkg'],
    relatedFree: ['f-mock-checklist'],
    body: [
      { t: 'p', text: '9월 모의고사는 많은 학교에서 2학기 중간고사 범위에 들어갑니다. 그래서 모의고사 직후 2주는 시험 대비와 실력 점검을 동시에 해야 하는 시기입니다.' },
      { t: 'h2', id: 'plan', text: '수업 4회 구성' },
      {
        t: 'steps',
        items: [
          { title: '1회차: 오답 점검', text: '학생이 직접 유형별 오답 원인을 분류합니다. 이 결과로 2–4회차 비중을 조정합니다.' },
          { title: '2회차: 어휘와 구문', text: 'Daily Test로 시작해 지문분석 노트로 주제문과 어법 포인트를 짚습니다.' },
          { title: '3회차: 변형 SET A', text: '18–30번 지문을 다른 각도에서 다시 풉니다.' },
          { title: '4회차: 변형 SET B + 서술형', text: '고난도 유형과 서술형으로 마무리합니다.' },
        ],
      },
      { t: 'cta-free', productId: 'f-mock-checklist' },
      { t: 'p', text: '네 번의 수업에 필요한 자료는 올인원 패키지에 모두 들어 있습니다. 학생 수준에 따라 SET B를 과제로 돌리면 3회로 줄일 수 있습니다.' },
      { t: 'cta-product', productId: 'p-2609h2-pkg' },
    ],
  },
  {
    demo: true,
    slug: 'what-vs-that-five-confusions',
    title: '관계사 what과 that, 학생들이 헷갈리는 지점 다섯 가지',
    excerpt: '"선행사가 있으면 that, 없으면 what"만으로는 풀리지 않는 문장들이 있습니다. 실제 수업에서 가장 많이 나오는 혼동 사례 다섯 가지를 판단 순서와 함께 정리했습니다.',
    category: '문법·어휘',
    date: '2026.09.05',
    readMinutes: 6,
    relatedProducts: ['p-gc-07'],
    relatedFree: ['f-relative-onepage'],
    body: [
      { t: 'p', text: '관계사 단원에서 학생들이 외우는 규칙은 대개 하나입니다. 선행사가 있으면 that, 없으면 what. 이 규칙은 맞지만, 실제 어법 문제는 이 규칙을 적용하기 전 단계에서 학생을 무너뜨립니다.' },
      { t: 'h2', id: 'order', text: '판단 순서' },
      { t: 'ul', items: ['뒤 문장이 완전한가, 불완전한가', '앞에 명사(선행사)가 있는가', '앞에 전치사가 있는가', '콤마가 있는가'] },
      { t: 'p', text: '이 네 가지를 순서대로 확인하면 대부분의 문장이 풀립니다. 첫 단계에서 문장의 완전성을 판단하지 못하면 나머지 규칙은 소용이 없습니다.' },
      { t: 'cta-free', productId: 'f-relative-onepage' },
      { t: 'cta-product', productId: 'p-gc-07' },
    ],
  },
  {
    demo: true,
    slug: 'write-the-deduction-rules-first',
    title: '서술형 채점 기준표, 감점 기준부터 적으세요',
    excerpt: '서술형 채점이 흔들리는 이유는 모범 답안이 아니라 감점 기준이 비어 있기 때문입니다. 문항을 만들 때 감점 기준을 먼저 적는 방법을 소개합니다.',
    category: '내신 대비',
    date: '2026.08.30',
    readMinutes: 4,
    relatedProducts: ['p-2609h2-wr'],
    relatedFree: ['f-writing-rubric'],
    body: [
      { t: 'p', text: '서술형 채점에서 이의 제기가 나오는 문항은 대개 모범 답안은 분명한데 부분 점수 기준이 없습니다. 학생 답안이 모범 답안과 조금만 달라도 채점자가 그 자리에서 판단해야 합니다.' },
      { t: 'h2', id: 'rubric', text: '감점 기준을 먼저 적는다' },
      { t: 'ul', items: ['조건 위반(단어 수, 어형)', '핵심 어휘 누락', '시제·수 일치 오류', '철자 오류의 허용 범위'] },
      { t: 'cta-free', productId: 'f-writing-rubric' },
    ],
  },
  {
    demo: true,
    slug: 'why-we-include-hwp',
    title: 'HWP 편집본을 함께 드리는 이유',
    excerpt: '지영랩 자료 대부분에는 PDF와 함께 HWP 편집본이 들어 있습니다. 선생님들이 자료를 그대로 쓰기보다 자기 수업에 맞게 고쳐 쓴다는 점을 반영했습니다.',
    category: '지영랩 소식',
    date: '2026.08.18',
    readMinutes: 3,
    relatedProducts: ['p-2609h2-ta'],
    relatedFree: [],
    body: [
      { t: 'p', text: '학원 선생님들은 받은 자료를 그대로 나눠 주지 않습니다. 학원 로고를 넣고, 반 수준에 맞게 문항을 빼거나 더하고, 시험지 양식에 맞게 편집합니다.' },
      { t: 'p', text: 'PDF만 드리면 이 작업이 다시 타이핑하는 일이 됩니다. 그래서 지영랩은 문제지에 HWP 편집본을 함께 드립니다. 상품 상세의 "파일 구성"에서 편집본 포함 여부를 확인할 수 있습니다.' },
      { t: 'cta-product', productId: 'p-2609h2-ta' },
    ],
  },
  {
    demo: true,
    slug: 'daily-test-first-five-minutes',
    title: '어휘 Daily Test를 수업 첫 5분에 쓰는 법',
    excerpt: '어휘 시험을 수업 끝에 보면 시간이 늘 부족합니다. 첫 5분에 30문항을 보고, 틀린 단어를 그날 지문에서 다시 만나게 하는 순서를 제안합니다.',
    category: '문법·어휘',
    date: '2026.08.09',
    readMinutes: 4,
    relatedProducts: ['p-2609h2-vo'],
    relatedFree: ['f-2609h2-vocab120'],
    body: [
      { t: 'p', text: 'Daily Test는 30문항, 4분 안에 풀 수 있는 분량으로 만들었습니다. 수업 시작 직후에 보면 지각생 관리와 수업 집중을 함께 해결할 수 있습니다.' },
      { t: 'p', text: '채점은 학생끼리 바꿔서 1분 안에 끝내고, 틀린 단어는 그날 다룰 지문에서 밑줄로 다시 찾게 합니다. 단어를 지문 속에서 한 번 더 만나는 것이 핵심입니다.' },
      { t: 'cta-free', productId: 'f-2609h2-vocab120' },
      { t: 'cta-product', productId: 'p-2609h2-vo' },
    ],
  },
]

export const postBySlug = new Map(posts.map((p) => [p.slug, p]))
