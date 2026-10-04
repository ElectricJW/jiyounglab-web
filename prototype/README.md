# 지영랩 웹사이트 프로토타입 (Phase 3)

브라우저에서 바로 확인할 수 있는 지영랩 상업용 웹사이트의 high-fidelity 프로토타입입니다.
**모든 상품·가격·글은 데모 데이터**이며, 결제·주문·회원가입·이메일 발송은 실제로 일어나지 않습니다.

- 디자인 시스템과 화면 설명: [`docs/phase3-design-system.md`](../docs/phase3-design-system.md)
- 향후 상용화 아키텍처: [`docs/phase2-technical-architecture.md`](../docs/phase2-technical-architecture.md)

## 화면 보는 법

| 방법 | 필요한 것 | 명령 |
|---|---|---|
| 1. 파일 하나 열기 | 브라우저만 | 저장소의 `preview/jiyounglab-prototype.html`을 내려받아 더블클릭 |
| 2. 개발 서버 | Node.js 20+ | `cd prototype && npm install && npm run dev` → 터미널에 표시되는 주소 접속 |

## 개발 명령

```bash
npm run dev            # 개발 서버
npm run verify         # typecheck + lint + production build
npm run build:artifact # 단일 HTML 파일 생성 (artifact/)

# 브라우저 검사 (preview 서버가 떠 있어야 함: npx vite preview --port 4173)
npm run smoke          # 주요 클릭 흐름 + 내부 링크 전수 검사
npm run a11y           # axe-core 접근성 검사 (라이트/다크)
npm run screenshots    # 데스크톱/모바일 전 페이지 스크린샷
```

검사 스크립트는 Chromium 경로로 `/opt/pw-browsers/chromium`을 기본 사용합니다. 다른 환경에서는 `CHROMIUM_PATH`를 지정하세요.

## 구조

```
src/
├─ data/          데모 데이터 (모든 레코드에 demo: true) — products, collections, posts
├─ components/    Layout(헤더/푸터) · Cards · Sheet(HTML 시험지) · Overlays(장바구니/샘플/데모 모달) · ui
├─ pages/         Home · Catalog · Collection · ProductDetail · Free · Blog · Checkout · About · Support
├─ lib/           router(해시 라우터) · store(데모 장바구니) · format(가격·패키지 계산)
└─ index.css      디자인 토큰 (라이트/다크)
```
