import { useState } from 'react'
import { DemoNote, Field } from '../components/Overlays'
import { Breadcrumbs, Button, Icon } from '../components/ui'
import { useStore } from '../lib/store'

const FAQ = [
  ['구매한 자료는 어디서 받나요?', '입금이 확인되면 내 자료실에 자료가 추가됩니다. 로그인 후 언제든 다시 받을 수 있고, 수정판이 나오면 최신본이 표시됩니다.'],
  ['HWP 파일이 포함되어 있나요?', '상품 상세의 "파일 구성"에서 확인할 수 있습니다. 편집용 파일이 포함된 자료에는 HWP 또는 HWPX 표시가 있습니다.'],
  ['학생에게 나눠 줘도 되나요?', '개인용 라이선스는 선생님 본인 수업의 학생에게 인쇄물로 배포할 수 있습니다. 파일 자체를 전달하거나 온라인에 올리는 것은 허용되지 않습니다.'],
  ['학원 강사 여러 명이 같이 쓰려면요?', '학원용 라이선스로 구매하시면 됩니다. 강사 수에 맞춰 견적을 드리고 세금계산서를 발행합니다.'],
  ['환불은 어떻게 되나요?', '다운로드 전에는 구매 후 7일 이내 전액 환불됩니다. 디지털 자료 특성상 다운로드 후에는 청약철회가 제한됩니다.'],
  ['자료에서 오류를 발견했어요.', '아래 문의 양식에서 "오류 제보"를 선택해 알려 주세요. 확인 후 수정판을 올리고 수정 이력에 기록합니다.'],
]

export function Support() {
  const [open, setOpen] = useState<number | null>(0)
  const [type, setType] = useState('일반 문의')
  const [sent, setSent] = useState(false)
  const { openDialog } = useStore()
  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ label: '홈', to: '/' }, { label: '고객센터' }]} />
      <h1 className="font-display text-[32px] font-semibold tracking-[-0.03em] md:text-[40px]">고객센터</h1>
      <p className="mt-2 text-[15px] text-ink-2">자주 묻는 질문을 먼저 확인하고, 해결되지 않으면 문의를 남겨 주세요. 평일 기준 1일 안에 답변합니다.</p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="mb-4 text-[17px] font-semibold">자주 묻는 질문</h2>
          <ul className="divide-y divide-line border-y border-line">
            {FAQ.map(([q, a], i) => (
              <li key={q}>
                <button
                  type="button"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-semibold"
                >
                  {q}
                  <Icon name="chevron" size={16} className={`shrink-0 text-ink-3 transition ${open === i ? 'rotate-90' : ''}`} />
                </button>
                {open === i && <p className="-mt-1 pb-5 text-[14.5px] leading-relaxed text-ink-2">{a}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-surface p-5">
            <div>
              <p className="font-semibold">학원용 라이선스 · 대량 구매</p>
              <p className="text-[13.5px] text-ink-2">강사 수와 필요한 자료를 알려주시면 견적을 드립니다.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => openDialog({ kind: 'academy' })}>
              견적 문의
            </Button>
          </div>
        </section>

        <section className="rounded-[18px] border border-line bg-surface p-6">
          <h2 className="mb-4 text-[17px] font-semibold">문의 남기기</h2>
          {sent ? (
            <div className="flex flex-col gap-3">
              <p className="font-semibold">문의 내용을 확인했습니다</p>
              <DemoNote>데모: 문의가 실제로 전송되거나 저장되지 않았습니다.</DemoNote>
              <Button variant="outline" onClick={() => setSent(false)}>
                새 문의 작성
              </Button>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="문의 유형">
                {['일반 문의', '오류 제보', '환불 요청', '구매 도움'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={type === t}
                    onClick={() => setType(t)}
                    className={`h-9 rounded-full px-3.5 text-[13px] font-medium ${type === t ? 'bg-ink text-on-ink' : 'border border-line-strong text-ink-2'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Field id="sp-email" label="회신받을 이메일" type="email" placeholder="name@example.com" />
              <label htmlFor="sp-msg" className="flex flex-col gap-1.5 text-[13px] font-medium">
                내용
                <textarea
                  id="sp-msg"
                  rows={5}
                  placeholder={type === '오류 제보' ? '자료 이름, 쪽수, 문항 번호와 함께 알려 주세요.' : '문의 내용을 적어 주세요.'}
                  className="rounded-[10px] border border-line-strong bg-surface p-3 text-[14px] font-normal outline-none placeholder:text-ink-3 focus:border-ink"
                />
              </label>
              <Button type="submit" variant="primary" size="lg">
                문의 보내기
              </Button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {['이용약관', '개인정보처리방침', '환불 정책', '자료 이용 라이선스'].map((t) => (
          <div key={t} className="rounded-[12px] border border-line bg-surface px-4 py-3.5 text-[14px]">
            <p className="font-semibold">{t}</p>
            <p className="text-[12.5px] text-ink-3">출시 전 최종 문안 확정 예정</p>
          </div>
        ))}
      </section>
    </div>
  )
}
