// Shapes mirror the Phase 2 data model (docs/phase2-technical-architecture.md §3),
// trimmed to what the visual prototype needs. Every seed record carries `demo: true`.

export type Grade = 'm1' | 'm2' | 'm3' | 'h1' | 'h2' | 'h3'

export type MaterialType =
  | 'transform' // 변형문제
  | 'grammar'
  | 'vocab'
  | 'writing' // 서술형
  | 'analysis' // 지문분석 노트
  | 'package'

export type SourceKind = 'mock' | 'kice' | 'textbook' | 'curriculum'

export type FileFormat = 'PDF' | 'HWP' | 'HWPX' | 'DOCX'

export type Access = 'paid' | 'free'

export type SheetTemplate = 'mcq' | 'vocab' | 'grammar' | 'writing' | 'analysis' | 'report'

export interface ProductFile {
  label: string
  format: FileFormat
  pages: number
  editable?: boolean
}

export interface ChangelogEntry {
  version: string
  date: string
  note: string
}

export interface Price {
  license: 'personal' | 'academy'
  amount: number | null // null = 문의 견적
  compareAt?: number
}

export interface Product {
  demo: true
  id: string
  code: string // 상품 코드, e.g. JY-M2609-G2-TA
  slug: string
  title: string
  subtitle: string
  type: MaterialType
  access: Access
  grades: Grade[]
  collections: string[] // Collection.key
  summary: string
  highlights: string[]
  specs: {
    pages: number
    questions?: number
    words?: number
    answerKey: boolean
    explanation: boolean
    coverage?: string // 예: 18–30번
  }
  files: ProductFile[]
  prices: Price[]
  packageItems?: string[] // product ids (kind=package)
  version: string
  updatedAt: string
  changelog: ChangelogEntry[]
  sheet: SheetTemplate
  sampleNote?: string
  isNew?: boolean
  isFeatured?: boolean
  releasedAt: string
}

export interface ExamItem {
  no: string // 문항 번호 (18, 19, … 41–42)
  kind: string // 유형
  products: string[] // product ids covering this item
}

export interface Collection {
  demo: true
  key: string // source_key, e.g. mock:2026-09:h2
  slug: string
  kind: SourceKind
  title: string
  shortTitle: string
  org: string // 시행 기관 / 출판사
  grade: Grade
  year: string
  month?: string
  intro: string
  facts: { label: string; value: string }[]
  items?: ExamItem[]
  isSeasonal?: boolean
}

export interface BlogPost {
  demo: true
  slug: string
  title: string
  excerpt: string
  category: '시험 분석' | '내신 대비' | '수업 노하우' | '문법·어휘' | '지영랩 소식'
  date: string
  readMinutes: number
  featured?: boolean
  relatedProducts: string[]
  relatedFree: string[]
  body?: BlogBlock[]
}

export type BlogBlock =
  | { t: 'p'; text: string }
  | { t: 'h2'; id: string; text: string }
  | { t: 'h3'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'quote'; text: string }
  | { t: 'cta-free'; productId: string }
  | { t: 'cta-product'; productId: string }
  | { t: 'steps'; items: { title: string; text: string }[] }
