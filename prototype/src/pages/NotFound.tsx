import { ButtonLink } from '../components/ui'

export function NotFound() {
  return (
    <div className="wrap max-w-xl pt-24 text-center">
      <p className="font-mono text-[13px] tracking-[0.1em] text-ink-3">404</p>
      <h1 className="mt-3 font-display text-[30px] font-semibold tracking-[-0.03em]">찾는 페이지가 없습니다</h1>
      <p className="mt-2 text-ink-2">주소가 바뀌었거나 판매가 끝난 자료일 수 있습니다.</p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink to="/">홈으로</ButtonLink>
        <ButtonLink to="/materials" variant="outline">
          전체 자료
        </ButtonLink>
      </div>
    </div>
  )
}
