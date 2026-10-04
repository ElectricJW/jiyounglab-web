import type { Grade, MaterialType, Product, SourceKind } from '../data/types'
import { productById } from '../data/products'

export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

export const gradeLabel: Record<Grade, string> = {
  m1: '중1',
  m2: '중2',
  m3: '중3',
  h1: '고1',
  h2: '고2',
  h3: '고3',
}

export const typeLabel: Record<MaterialType, string> = {
  transform: '변형문제',
  grammar: 'Grammar',
  vocab: 'Vocabulary',
  writing: '서술형·워크북',
  analysis: '지문분석',
  package: '패키지',
}

export const typeVar: Record<MaterialType, string> = {
  transform: 'var(--t-transform)',
  grammar: 'var(--t-grammar)',
  vocab: 'var(--t-vocab)',
  writing: 'var(--t-writing)',
  analysis: 'var(--t-analysis)',
  package: 'var(--t-package)',
}

export const sourceLabel: Record<SourceKind, string> = {
  mock: '모의고사',
  kice: '평가원',
  textbook: '교과서 내신',
  curriculum: '자체 커리큘럼',
}

export function personalPrice(p: Product): number | null {
  return p.prices.find((x) => x.license === 'personal')?.amount ?? null
}

// Package savings are computed from item prices, never hard-coded (D12).
export function packageBreakdown(p: Product) {
  const items = (p.packageItems ?? []).map((id) => productById.get(id)).filter((x): x is Product => !!x)
  const sum = items.reduce((acc, it) => acc + (personalPrice(it) ?? 0), 0)
  const price = personalPrice(p) ?? 0
  const saving = Math.max(0, sum - price)
  const pct = sum > 0 ? Math.round((saving / sum) * 100) : 0
  return { items, sum, price, saving, pct }
}

export function packagesContaining(productId: string): Product[] {
  const out: Product[] = []
  for (const p of productById.values()) if (p.packageItems?.includes(productId)) out.push(p)
  return out
}

export function formatsOf(p: Product): string[] {
  const src = p.packageItems ? packageBreakdown(p).items.flatMap((i) => i.files) : p.files
  return [...new Set(src.map((f) => f.format))]
}
