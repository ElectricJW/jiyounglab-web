# JIYOUNGLAB 웹사이트: Phase 2 Technical Architecture

- 상태: **DRAFT, OWNER REVIEW 대기** (Phase 3는 승인 후 착수)
- 작성일: 2026-10-04
- 기준 문서: [`phase1-product-requirements.md`](./phase1-product-requirements.md) (승인된 Phase 1 baseline)
- 이 문서가 다루는 것: 기술 스택, build/managed 결정, 데이터 모델, commerce core, Generator_EngText 연동 경계, 보안, 비용, 구현 계획
- 이 문서가 다루지 않는 것: application 구현 (아직 코드를 작성하지 않음)

> **가격 표기 원칙:** 외부 서비스 가격은 2026-10-04 기준 **2차 출처(검색 결과)** 로 확인한 값이다. 공식 가격 페이지는 이 세션의
> 네트워크 정책 때문에 직접 열 수 없었다. 그래서 모든 가격에 `VERIFY_REQUIRED`를 붙였고, 가입 전에 공식 페이지에서 다시 확인해야 한다.
> 환율은 **1 USD ≈ 1,400 KRW로 가정**했다 (`VERIFY_REQUIRED`).

---

## 0. 요청된 보고 항목 요약

### RECOMMENDED_STACK

| 영역 | 선택 | 형태 |
|---|---|---|
| Frontend/Framework | **Next.js 16 (App Router) + TypeScript + Tailwind CSS** | Build (OSS) |
| Backend/API | **같은 Next.js 앱 안의 Server Actions와 Route Handlers** (별도 API 서버 없음, 단일 앱) | Build |
| Database | **PostgreSQL: Neon** (serverless Postgres), ORM은 **Drizzle** | Managed DB + OSS ORM |
| Auth | **Better Auth** (OSS 라이브러리, 우리 DB에 저장), **Email OTP(6자리 코드)** 기본, Kakao는 E1에서 추가 | Build on OSS |
| File/Object storage | **Cloudflare R2**: 공개 bucket(미리보기/샘플)과 비공개 bucket(판매 파일)을 분리 | Managed |
| Secure download | **우리 앱의 download route**가 세션과 entitlement를 확인하고 DownloadEvent를 기록한 뒤 R2에서 **stream**한다. 공개 URL은 만들지 않는다 | Build |
| Admin | **같은 앱 안의 `/admin`** 자체 구현. Cloudflare Access와 admin TOTP 2FA로 보호 | Build |
| Hosting/Deploy | **Cloudflare Workers** (`@opennextjs/cloudflare` adapter), GitHub Actions CI/CD | Managed |
| Email | **Resend** (transactional). `EmailSender` 인터페이스 뒤에 둔다 | Managed |
| Analytics | **Cloudflare Web Analytics** (무료, cookie 없음) + **우리 DB의 business event**(다운로드, 주문, 문의) | Managed + Build |
| Search | **Postgres `pg_trgm`** (한글 부분일치) + SQL facet filter | Build (DB 내장) |
| Payment | 자체 **`PaymentProvider` 인터페이스**. MVP 구현체는 `ManualBankTransfer`, 향후 PG 1곳을 직접 연동 | Build (adapter) |
| SEO | SSG/ISR, 상품 publish 시 on-demand revalidation, `generateMetadata`, JSON-LD, DB 기반 sitemap, 네이버 서치어드바이저 | Build |
| Bot 방어 | **Cloudflare Turnstile** (가입/OTP/문의) | Managed (무료) |

### ARCHITECTURE_SUMMARY

**"Next.js 앱 하나 + Postgres 하나 + R2 bucket 두 개 + 이메일 API 하나"** 로 구성한다.
공개 사이트, 고객 계정, 관리자, 다운로드, 주문, import가 모두 **하나의 codebase와 하나의 배포 단위**에 들어간다.
외부 vendor는 **Cloudflare, Neon, Resend 3곳**과 코드 저장소인 GitHub뿐이다.
결제수단이 바뀌어도 `Order → Payment → markOrderPaid() → Entitlement` 경로는 바뀌지 않는다 (§5).
Generator_EngText와는 **버전이 붙은 JSON manifest + 파일 bundle** 이라는 데이터 계약으로만 연결한다 (§4).

### ALTERNATIVES_REJECTED (상세 §8)

| 대안 | 기각 이유 |
|---|---|
| B. Vercel Pro + Supabase (Auth/DB/Storage 일체형) | 상업 이용 시 Vercel은 Pro 필수(약 $20/user/월). Supabase Pro를 더하면 **월 고정비 약 6만원 이상으로 D14 초과**. 파일 다운로드에 egress 과금 |
| C. 호스팅형 쇼핑몰 (아임웹, Shopify + 디지털 다운로드 앱) | 시험/단원 허브형 programmatic SEO, 파일 버전 관리, bulk import, entitlement 모델을 구현하기 어렵고 플랫폼 수수료와 lock-in이 크다. "2주 안에 판매 시작"이 목표일 때만 의미가 있다 |
| D. VPS 1대에 직접 운영 (Docker + Postgres + MinIO) | 비용은 가장 싸지만 OS 패치, 백업, TLS, 장애 대응을 owner가 직접 해야 한다. 1인 운영에 부적합 |
| (부품) Payload CMS를 admin으로 사용 | admin 개발량은 줄지만 CMS 스키마와 우리 commerce 스키마가 이중화되고, Workers bundle 크기 제약과 major upgrade 부담이 있다. 대안으로 보존 (§2.3) |
| (부품) Cloudflare D1 (SQLite) | vendor가 하나 줄어들지만 interactive transaction이 없어 주문/권한 원자성 보장이 불편하고 Postgres보다 이식성이 낮다 |
| (부품) PortOne 같은 결제 aggregator를 기본으로 사용 | 우리 `PaymentProvider` 인터페이스가 이미 PG 교체성을 제공하므로 추상화가 중복되고 vendor가 하나 늘어난다. PG 심사 대응이 필요할 때의 대안으로 보존 (§5.4) |

### ESTIMATED_MONTHLY_FIXED_COST (상세 §9)

| 단계 | 월 고정비 (추정) | 비고 |
|---|---|---|
| MVP (개발, 비공개 운영) | **₩0** | 모두 무료 tier |
| 초기 실제 판매 | **약 ₩8,000 ~ ₩9,000** | Workers Paid $5 + 도메인 연간비의 월 환산. 그 외는 무료 tier |
| 성장 단계 | **약 ₩8,000 ~ ₩70,000** | 넘어서는 항목만 유료 전환 (Neon 유료, Resend Pro 등) |

모든 금액은 `VERIFY_REQUIRED`. **D14 목표(월 ₩0 ~ 30,000)를 MVP와 초기 판매 단계에서 충족한다.**

### MAJOR_VENDOR_DEPENDENCIES

| Vendor | 쓰는 기능 | Lock-in | 탈출 경로 |
|---|---|---|---|
| **Cloudflare** | Workers(hosting), R2(파일), DNS, Turnstile, Access, Web Analytics, (선택) Registrar | 중간 | Next.js 표준 코드라 Vercel이나 Node 컨테이너로 이전 가능. R2는 S3 호환 API라 S3/B2로 복사 가능. 플랫폼 의존 코드는 `platform/` adapter 한 곳에 격리 |
| **Neon** | PostgreSQL | 낮음 | 표준 Postgres라 `pg_dump`로 어디든 이전 가능 |
| **Resend** | 트랜잭션 메일 | 낮음 | `EmailSender` 인터페이스. SES, Postmark 등으로 교체가 adapter 한 파일 수준 |
| **GitHub** | 코드, CI | 낮음 | 표준 git |
| (E1) PG사 1곳 | 온라인 결제 | 중간 | `PaymentProvider` adapter. 교체 시 adapter 하나만 새로 작성 |

### SECURITY_MODEL (상세 §7)

1. 판매 파일은 **비공개 bucket**에만 두고, **유일한 출구는 `/download` route**다. 이 route는 `canDownload()` 단일 함수로 권한을 판정한다.
2. 객체 key와 ID는 **추측 불가능한 무작위 값**이다. 공개 URL과 장기 유효 URL은 존재하지 않는다.
3. 다운로드는 모두 **DownloadEvent로 기록**되고, 이상 패턴이 보이면 admin에게 알린다. 구매자 식별 **워터마크는 optional capability**로 둔다 (D5).
4. Admin은 **Cloudflare Access(1차) + 앱 로그인 + TOTP(2차)** 로 보호하고, 모든 admin 행위를 **AuditLog**에 남긴다.
5. 결제 확정은 **admin의 명시적 행위(MVP)** 또는 **서버가 PG에 재조회해서 검증한 결과(E1)** 로만 일어난다. 클라이언트가 보낸 값은 신뢰하지 않는다. 금액과 멱등키를 대조한다.
6. 업로드는 **admin만** 할 수 있고, magic-byte 검증, 허용 형식 whitelist, 크기 제한을 둔다. 고객 업로드는 MVP에 없다.
7. 개인정보는 최소한으로 수집하고, IP는 hash로 저장하며, 보존기간을 정책화하고, 국외이전을 고지한다.

### GENERATOR_ENGTEXT_INTEGRATION_BOUNDARY (상세 §4)

- 계약은 **`jiyounglab-import-manifest` JSON Schema(버전 관리)** 와 **파일 bundle(manifest가 상대경로와 sha256으로 참조)** 이다. 스키마의 소유자는 **웹사이트**이고, 엔진은 export adapter만 만든다.
- 웹사이트 쪽 `import` 모듈은 다음 순서로 동작한다: validate → **dry-run diff** → apply. apply는 `external_ref` 기준 upsert이고, Collection은 `source_key`로 연결하고, 파일은 sha256이 바뀌면 새 FileVersion을 만들며, 상품은 **항상 DRAFT로 생성**한다 (자동 공개는 없음).
- 운반 경로는 MVP에서 **admin UI 업로드 또는 로컬 CLI**이고, 향후 **토큰 인증 import API + presigned upload**를 추가한다.
- 엔진 repository, 엔진 내부 경로, 엔진 내부 ID 형식에 **직접 의존하지 않는다.**

### OWNER_DECISIONS_REMAINING (상세 §11)

판매 시작 전에 필요한 것: **도메인 구매 시점(이메일 발송에 필수)**, 서비스 계정 소유 주체, 입금 계좌, 사업자 표시 정보, 미입금 주문 만료 기간, 환불정책 문안 검토. 그 외 7건.

### PHASE_3_IMPLEMENTATION_PLAN (상세 §10)

Phase 3 (Design system) 다음에 milestone **M0 ~ M10**을 순서대로 진행한다. 각 milestone은 독립적으로 build, test, deploy할 수 있다.
M0 기반 → M1 UI shell → M2 카탈로그/SEO → M3 인증 → M4 파일·보안 다운로드 → M5 Admin → M6 수동 결제 commerce → M7 블로그 → M8 문의 → M9 Bulk import → M10 출시 준비.

---

## 1. 기술 스택 상세

### 1.1 Frontend / Framework: Next.js 16 (App Router)

| 요구사항 (Phase 1 §12) | Next.js가 충족하는 방식 |
|---|---|
| SEO: 서버 렌더링, 대량 허브 페이지 | Server Components, `generateStaticParams`/ISR, `generateMetadata`, `sitemap.ts` |
| 공개 사이트, 고객 계정, admin을 한 앱에서 | Route group `(public)`, `(account)`, `(admin)`으로 분리하고 layout별로 인증 gate |
| 유지보수 | 가장 큰 생태계라 AI 세션이나 외부 개발자에게 인수인계하기 쉽다 |

**검토 후 제외한 것:**
- Astro: 콘텐츠 사이트에는 최적이지만 계정, admin, 주문 같은 앱 성격 기능에 약하다.
- SvelteKit / React Router: 기술적으로 가능하지만 생태계가 작고 인수인계가 더 어렵다.

**Workers 환경의 주의점 (설계에 반영함):**
- `next/image` 최적화 서버를 쓰지 않는다. 미리보기 이미지는 **업로드 시점에 webp로 크기별 생성**해 R2 공개 bucket에 저장하고, `unoptimized` 또는 custom loader로 쓴다. 유료 이미지 서비스가 필요 없다.
- 파일시스템 접근, 네이티브 모듈(sharp, canvas 등)은 쓸 수 없다. PDF와 이미지 처리는 pure JS(`pdf-lib`)로 하거나 admin 브라우저에서 처리한다 (§4.5).
- OpenNext Cloudflare adapter는 Cloudflare가 유지보수하고 Next.js 16.2부터 공식 Deployment Adapter API를 쓴다(2차 출처). 그래도 호환성 문제가 생길 수 있으므로 **M0에서 실제 배포까지 검증**하고, 문제가 있으면 fallback(Vercel Pro 또는 Node 컨테이너)으로 전환한다. 코드는 플랫폼 중립을 유지한다.

### 1.2 Backend / API: 단일 앱, 계층 분리

별도 API 서버나 microservice는 두지 않는다. 대신 **앱 내부를 계층으로 나눈다:**

```
src/
├─ app/                    # Next.js routes (UI + Route Handlers: /download, /api/webhooks/*, /api/import/*)
├─ server/
│   ├─ domain/             # 순수 비즈니스 로직 (catalog, commerce, entitlement, import). 프레임워크 무관, 단위 테스트 대상
│   ├─ db/                 # Drizzle schema, migrations, repository 함수
│   ├─ auth/               # Better Auth 설정, 권한 helper (requireUser, requireAdmin)
│   └─ services/           # 외부 의존 인터페이스: StorageAdapter, EmailSender, PaymentProvider, Clock
├─ platform/               # Cloudflare 전용 binding 접근을 이 폴더 한 곳에 격리 (이식성 확보)
└─ components/, lib/
```

- 변경 작업은 **Server Actions**(admin form, 주문 신청)로 하고, 외부에서 호출되는 것만 **Route Handlers**로 만든다(다운로드 stream, PG webhook, import API).
- 모든 입력은 **Zod**로 검증한다. domain 함수는 이미 검증된 타입만 받는다.

### 1.3 Database: Neon PostgreSQL + Drizzle

- **Postgres를 고른 이유:** 주문과 권한을 하나의 transaction으로 묶을 수 있고, 관계 무결성(FK, unique), `pg_trgm` 검색, `pg_dump` 이식성을 갖는다.
- **Neon을 고른 이유:** 서버를 관리할 필요가 없고, 무료 tier(0.5GB/project, 100 CU-hours, PITR 6시간: `VERIFY_REQUIRED`)로 MVP와 초기 판매 단계의 카탈로그 규모(수천 상품)를 충분히 감당한다. 일정 시간 요청이 없으면 compute가 멈추는(scale-to-zero) 대신 첫 요청에 cold start가 생긴다. 공개 페이지는 ISR 캐시로 서빙해서 영향을 줄인다.
- **연결:** Workers에서 **Cloudflare Hyperdrive**(connection pooling, Workers Paid에 포함: `VERIFY_REQUIRED`)를 거쳐 표준 `pg` 드라이버로 접속한다. 로컬과 테스트에서는 **PGlite**(WASM Postgres)를 쓴다. Docker 없이 CI와 클라우드 세션에서 테스트할 수 있다.
- **Drizzle을 고른 이유:** SQL에 가까운 가벼운 ORM이고, Workers와 호환되며, 마이그레이션이 SQL 파일로 남아 검토하기 쉽다. Prisma보다 런타임이 가볍다.
- **리전:** Neon 리전은 한국과 가까운 곳(예: Singapore 또는 Tokyo. 서울 리전 제공 여부는 `VERIFY_REQUIRED`)으로 정한다.

### 1.4 Authentication: Better Auth + Email OTP

| 항목 | 결정 |
|---|---|
| 라이브러리 | **Better Auth** (OSS, Drizzle adapter로 우리 DB에 user/session/account 저장, 외부 auth SaaS 없음) |
| 고객 로그인 | **Email OTP (6자리 코드)**. magic link보다 낫다고 본 이유: 한국 사용자는 PC에서 사이트를, 휴대폰에서 메일을 보는 경우가 많아 다른 기기에서도 쓸 수 있는 코드 방식이 편하다. 비밀번호를 저장하지 않으니 유출 위험도 없다 |
| 세션 | DB 세션 + httpOnly secure cookie, 30일 rolling (재로그인 빈도 최소화) |
| Admin | 같은 User 테이블에 `role=ADMIN`. **TOTP 2FA 필수** (Better Auth two-factor plugin), 세션 12시간 |
| Kakao (D7) | **MVP 필수 아님 → E1(결제 오픈)과 함께 추가 권장.** 아래 비교 참조 |

**Kakao 로그인을 MVP에 넣을지 (D7 판단 근거)**

| 기준 | MVP에 포함 | E1로 연기 (권장) |
|---|---|---|
| 전환 효과 | MVP는 "구매 신청 + 계좌이체"라 결제 마찰이 이미 크다. 로그인 간소화의 효과가 상대적으로 작다 | 카드 결제와 함께 들어가면 "간편 로그인 + 간편 결제"로 효과가 최대가 된다 |
| 외부 준비 | Kakao Developers 앱 등록, 이메일 동의항목 사용 신청(비즈 앱 전환과 심사가 필요할 수 있음: `VERIFY_REQUIRED`), 개인정보처리방침 반영 | 동일. 사업자 정보와 도메인이 확정된 뒤라 심사가 수월하다 |
| 데이터 문제 | 이메일 동의를 받지 못한 Kakao 사용자는 영수증, 수정판 알림 메일을 받을 수 없다 → 이메일 추가 입력 흐름이 필요 | 같은 문제를 E1에서 한 번에 설계 |
| 구현 비용 | 1~2일 + 심사 대기 | 동일 |
| 구조 | Better Auth `account` 테이블이 다중 provider를 지원하므로 **지금 구조를 바꾸지 않고 나중에 추가 가능** | ← 그래서 연기해도 손실이 없다 |

Better Auth에 Kakao가 내장 provider로 있는지는 `VERIFY_REQUIRED`다. 없더라도 Kakao는 표준 OAuth 2.0/OIDC이므로 generic OAuth plugin으로 연결할 수 있다.

### 1.5 File / Object Storage: Cloudflare R2

| Bucket | 내용 | 접근 |
|---|---|---|
| `jy-public` | 미리보기 이미지(webp), 샘플 PDF, 블로그 이미지, OG 이미지 | 공개 (custom domain `assets.<domain>`, CDN 캐시) |
| `jy-private` | 판매 파일 (모든 FileVersion), 워터마크 사본 캐시 | **비공개.** 앱의 binding이나 S3 API 자격증명으로만 접근 |
| `jy-backup` | DB 백업(`pg_dump`) | 비공개. 쓰기 전용 토큰으로 CI만 기록 |

- **R2를 고른 이유:** 디지털 상품 판매는 다운로드 트래픽이 비용을 좌우한다. R2는 **egress 무료**이고, 무료 tier는 10GB 저장, Class A 100만, Class B 1000만 회/월이다(`VERIFY_REQUIRED`). 시험 시즌에 다운로드가 몰려도 전송 비용이 0원이다.
- **key 규칙:** `private/files/{fileId}/{versionId}/{random}.{ext}`. 사람이 읽을 수 있는 파일명은 key가 아니라 다운로드 응답의 `Content-Disposition`에 넣는다 (한글 파일명은 RFC 5987 `filename*` 사용).
- **불변성:** FileVersion 객체는 **절대 덮어쓰지 않는다.** 수정판은 새 key가 된다. 그 결과 저장소가 사실상 append-only가 되어, 실수로 덮어써서 생기는 사고와 백업 문제가 사라진다.

### 1.6 Secure Download Mechanism

```
고객이 "다운로드" 클릭
 → GET /download/{fileId}            (같은 사이트 경로. 공유해도 로그인과 권한이 없으면 무용)
 → requireUser()                     (세션 없으면 로그인 페이지로)
 → canDownload(user, fileId)         (ACTIVE Entitlement가 있는가, 상품 상태, 파일 role=DELIVERABLE)
 → rateLimit(user)                   (예: 시간당 30회. 값은 설정으로 관리)
 → 현재 FileVersion 선택 (항상 최신본)
 → [optional] 워터마크 사본 사용 (§7.3)
 → DownloadEvent INSERT (GRANTED 또는 DENIED+사유)
 → R2 객체 stream 응답 (Content-Disposition: attachment, Cache-Control: private, no-store)
```

- **presigned URL을 기본으로 쓰지 않는 이유:** Workers는 R2를 binding으로 직접 stream할 수 있다. 그러면 **고객에게 노출되는 URL이 사이트 경로 하나뿐**이라 공유할 수 있는 링크 자체가 생기지 않는다. 대용량(예: 100MB 초과) 파일이 생기면 **TTL 60초 presigned URL로 302 redirect**하는 방식으로 바꿀 수 있게 `StorageAdapter.getDownloadResponse()` 안에 구현 선택지를 둔다.
- **공개 샘플**은 `jy-public`에서 CDN으로 직접 서빙한다. 권한 확인이 없고, 다운로드 횟수만 집계한다.

### 1.7 Admin Interface: 자체 구현 (`/admin`)

- 같은 앱 안의 route group이다. UI는 화려하지 않게 **form + table** 중심으로 만든다 (사용자 1~2명, D13).
- 기능 범위는 §6.2 운영 요구사항과 Phase 1 §9를 따른다.
- 대용량 파일 업로드는 **브라우저 → R2 presigned PUT으로 직접** 올린다(Workers 요청 본문 크기 제한 회피). 그다음 서버가 `finalize`로 검증(크기, magic bytes, sha256)하고 FileVersion 레코드를 만든다.

### 1.8 Deployment / Hosting: Cloudflare Workers

```
GitHub (main 보호) ── PR ──▶ GitHub Actions: typecheck, lint, unit, integration(PGlite), build
                                  │
                                  ├─ PR: preview 배포 (wrangler, preview URL)
                                  └─ main merge: drizzle migrate (prod DB) → wrangler deploy (prod)
```

- **배포 = main에 merge.** owner가 직접 명령을 칠 일이 없다.
- 롤백은 `wrangler rollback`(이전 버전으로 즉시 복귀) 또는 revert PR로 한다. DB 마이그레이션은 **확장 우선(expand → migrate → contract)** 원칙을 지켜 앱 롤백과 충돌하지 않게 한다.
- Secrets(DB URL, Resend key, R2 S3 credentials, auth secret)는 Workers Secrets와 GitHub Actions Secrets에만 저장하고, repo에는 절대 넣지 않는다.

### 1.9 Email: Resend

- 용도: 로그인 OTP, 주문 접수와 입금 안내, 입금 확인과 다운로드 안내, 수정판 알림(E2), 문의 접수 알림(admin 대상).
- 무료 tier는 3,000통/월, **100통/일**, 도메인 1개다(`VERIFY_REQUIRED`). 초기에는 충분하다. **일 100통 제한이 먼저 걸리므로**, 시즌 공지 같은 대량 메일은 E2에서 별도 계획한다.
- ⚠️ **실제 발송에는 인증된 발송 도메인이 필요하다.** 즉 도메인 구매(D8)가 **실사용 고객 로그인의 전제조건**이다. 도메인이 없는 개발 단계에서는 `EmailSender`의 dev 구현(콘솔과 DB outbox 기록)으로 개발하고 테스트한다.

### 1.10 Analytics

| 층 | 도구 | 무엇을 |
|---|---|---|
| 트래픽 | **Cloudflare Web Analytics** (무료, cookie 없음) | 페이지뷰, 유입 경로, 국가/기기 |
| 비즈니스 | **우리 DB** (`DownloadEvent`, `Order`, `Inquiry`, `Entitlement`) | 무료→가입, 샘플→구매, 상품별 매출/다운로드. admin 대시보드의 SQL 집계 |
| 검색 | 네이버 서치어드바이저, Google Search Console (무료) | 검색어, 색인 상태 |

GA4는 넣지 않는다(쿠키 고지 부담과 스크립트 추가 대비 이득이 작음). 필요하면 E6에서 추가한다.

### 1.11 Search

- 상품 수천 개 규모에는 **Postgres `pg_trgm` GIN index**(제목, 요약, 태그 대상 한글 부분일치)와 **facet 필터(SQL WHERE)** 면 충분하다. 별도 검색 SaaS(Algolia, Meilisearch)는 vendor만 늘린다.
- 한국어 형태소 분석은 하지 않는다. 대신 상품마다 **검색용 alias 필드**(예: "윤정미", "동아", "9모", "구월 모의고사")를 admin과 import에서 넣는다.

### 1.12 Payment Abstraction: §5에서 상세

### 1.13 SEO Architecture

| 요소 | 구현 |
|---|---|
| 렌더링 | 공개 페이지(홈, 카탈로그, 허브, 상품, 블로그)는 **SSG/ISR**. admin이 publish하거나 수정하면 `revalidateTag('product:{id}')` 등으로 해당 페이지만 즉시 갱신 |
| URL | Phase 1 §3.1의 slug 규칙. slug가 바뀌면 `Redirect` 테이블로 301 처리 (SEO 자산 보존) |
| 메타 | `generateMetadata`: title, description, canonical, OG/Twitter. 상품 OG 이미지는 대표 미리보기 이미지 |
| 구조화 데이터 | `Product` + `Offer`(가격은 DB에서), `BreadcrumbList`, `Article`, `FAQPage`, `Organization` (JSON-LD) |
| Sitemap | `sitemap.ts`가 DB에서 공개 상품, 허브, 글을 생성. 5만 URL을 넘으면 sitemap index로 분할 |
| robots | `/admin`, `/account`, `/download`, `/api`, `/cart`, `/checkout` 차단 |
| 네이버 | 서치어드바이저 소유확인 meta를 설정값으로 관리, RSS(`/blog/rss.xml`) 제공, sitemap 제출 |
| 저작권 노출 최소화 (D6) | 허브 본문과 상품 설명은 **우리가 작성한 메타 정보**(시험 개요, 문항 수, 유형)만 담는다. 원문 지문은 공개 HTML에 넣지 않는다. 미리보기 이미지에는 `preview_reviewed` 승인 플래그가 있어야 공개된다 (§3.3) |
| Demo 데이터 (D11) | `is_demo=true` 상품과 글은 화면에 "예시" 배지를 붙이고, **`noindex` + sitemap에서 제외**한다 |

---

## 2. Build vs Managed Service 결정

### 2.1 결정표

| 구성요소 | 결정 | 이유 | 비용 | Lock-in | 유지보수 부담 |
|---|---|---|---|---|---|
| 웹 앱 (공개, 계정, admin) | **Build** | 사업의 핵심 차별점(허브 SEO, 버전 관리, import)이 여기에 있다 | 0 | 없음 | 중 (우리 코드) |
| Hosting/CDN | **Managed** (Cloudflare Workers) | 서버 관리 0, 글로벌 CDN, 무료~$5 | ₩0~7,000 | 중 (adapter 격리) | 낮음 |
| DB 서버 | **Managed** (Neon) | 백업, 패치, 가용성을 위임 | ₩0 → 사용량 | 낮음 (표준 PG) | 낮음 |
| 스키마/쿼리 | **Build** (Drizzle) | 도메인 모델은 우리 것 | 0 | 없음 | 낮음 |
| 인증 로직 | **Build on OSS** (Better Auth) | auth SaaS(Clerk, Auth0)는 MAU 과금과 데이터 외부 보관 문제가 있다. 라이브러리는 데이터가 우리 DB에 남는다 | 0 | 낮음 | 낮음~중 (보안 업데이트 추적) |
| 파일 저장 | **Managed** (R2) | 내구성과 egress 0을 직접 만들 수 없다 | ₩0 → 사용량 | 낮음 (S3 API) | 매우 낮음 |
| 다운로드 권한/로깅 | **Build** | 사업 규칙 그 자체 | 0 | 없음 | 낮음 |
| 이메일 발송 | **Managed** (Resend) | 메일 평판(deliverability)을 직접 관리하는 것은 비현실적 | ₩0 → $20 | 낮음 | 매우 낮음 |
| Admin UI | **Build** | 아래 §2.3 | 0 | 없음 | 중 |
| 검색 | **Build** (pg_trgm) | 규모상 SaaS 불필요 | 0 | 없음 | 낮음 |
| 결제 처리 | **Managed** (PG사, E1) + **Build** (adapter, commerce core) | 카드 처리는 PG만 할 수 있다. 주문과 권한은 우리 것 | 수수료 | 중 (adapter) | 낮음 |
| 봇 방어 | **Managed** (Turnstile) | 무료, CAPTCHA 대체 | 0 | 낮음 | 매우 낮음 |
| Admin 경계 보호 | **Managed** (Cloudflare Access) | 무료(50명까지: `VERIFY_REQUIRED`), 코드 없이 2중 잠금 | 0 | 낮음 (빼도 앱 인증은 그대로) | 매우 낮음 |
| 에러 추적 | **Managed** (Workers Logs/Observability 기본 제공) | 별도 vendor(Sentry 등)는 필요할 때만 | 0 | — | 낮음 |
| 백업 | **Build** (GitHub Actions `pg_dump` → R2) + Neon PITR | Neon 무료 PITR 6시간만으로는 부족 | 0 | 없음 | 낮음 |

### 2.2 피하는 것 (과도한 SaaS 조합 방지)

Headless CMS SaaS(Contentful, Sanity), auth SaaS(Clerk, Auth0), 검색 SaaS(Algolia), 별도 API 서버, message queue, Redis, 별도 analytics SaaS, 별도 이미지 CDN. **이 단계에서 모두 불필요하다.** 각각은 "필요가 측정되었을 때" 추가한다.

### 2.3 Admin: 자체 구현 vs Payload CMS

| 기준 | 자체 구현 (권장) | Payload CMS 3 (Next 내장형 OSS) |
|---|---|---|
| 초기 개발량 | 많음 (CRUD 화면 약 8종) | 적음 (자동 생성 admin) |
| 스키마 단일성 | **하나의 Drizzle 스키마** | Payload 컬렉션 정의와 commerce 스키마가 공존하게 된다 |
| commerce 원자성 | 직접 transaction | hook 안에서 처리해야 해 복잡해진다 |
| Workers 호환 | 문제 없음 | bundle 크기와 호환성 검증 필요 |
| 업그레이드 부담 | 우리 코드뿐 | CMS major upgrade 추적 |
| 운영자 UX | 우리 업무 흐름(회차 단위 등록, 수정판 업로드)에 맞춤 | 범용 CMS UI |

→ **자체 구현.** admin 화면은 단순 form/table로 제한해 개발량을 통제한다. M5 진행 중 개발량이 과도하다고 판단되면 Payload로 전환할 수 있도록, domain 로직은 `server/domain`에 두어 UI와 분리한다.

---

## 3. Data Model

### 3.1 ER 개요

```
User ─1:N─ Session/Account (Better Auth)
User ─1:N─ Order ─1:N─ OrderItem ─N:1─ Product
                 └─1:N─ Payment
User ─1:N─ Entitlement ─N:1─ Product
              └─(source)─ OrderItem | FreeClaim | AdminGrant
Entitlement ─1:N─ DownloadEvent ─N:1─ FileVersion
Product ─1:N─ ProductFile ─1:N─ FileVersion
Product ─1:N─ ProductPrice ─N:1─ LicenseType
Product(kind=PACKAGE) ─1:N─ PackageItem ─N:1─ Product(kind=SINGLE)
Product ─N:M─ Collection   (CollectionProduct)
Collection ─self─ parent   (교과서 → 단원)
BlogPost ─N:M─ Product / Collection   (관련 블록)
Inquiry ─N:1─ User? / Product? / Order?
ImportBatch ─1:N─ ImportItem ─N:1─ Product?
AuditLog (admin 행위 전체)
Redirect, SiteSetting (홈 기획 섹션, 계좌 안내, 표시 정보)
```

### 3.2 엔터티 정의 (핵심 필드)

**User**
`id(uuid)`, `email(unique, citext)`, `email_verified_at`, `name`, `role(CUSTOMER|ADMIN)`, `marketing_consent_at?`, `marketing_consent_revoked_at?`, `created_at`, `deleted_at?`
※ Session, Account(provider: `email-otp`, 향후 `kakao`), Verification, TwoFactor는 Better Auth 표준 테이블을 쓴다.

**LicenseType** (D3)
`id`, `code(unique: PERSONAL, ACADEMY)`, `name`, `terms_md`, `seat_limit?`, `is_purchasable_online(bool)`, `is_active`, `position`
- MVP: PERSONAL은 `is_purchasable_online=true`. ACADEMY는 `false`라 상세 페이지에서 "학원용 문의" CTA로 표시된다.
- 향후 학원용을 온라인 판매하려면 플래그와 가격만 바꾸면 된다. 코드 변경이 없다.

**Product**
`id`, `kind(SINGLE|PACKAGE)`, `slug(unique)`, `title`, `subtitle`, `summary`, `body_md`,
`status(DRAFT|PUBLISHED|ARCHIVED)`, `access(PAID|FREE_LOGIN|FREE_PUBLIC)`,
`grade[]`, `material_type`, `difficulty?`, `search_aliases[]`,
`specs(jsonb: page_count, question_count, has_answer_key, has_explanation, formats[])`,
`source_attribution?`(출처 표기 문구), `is_demo(bool)`,
`external_ref?(unique)`(import upsert 키), `import_locked_fields[]`(admin이 손댄 필드, §4.4),
`published_at?`, `created_at`, `updated_at`
- `specs.formats`는 **ProductFile에서 계산해 캐시**한다(D4: 상품마다 PDF/HWP 구성이 다름).

**ProductPrice** (D12: 가격은 데이터로 관리)
`id`, `product_id`, `license_type_id`, `amount_krw(int)`, `compare_at_krw?`(정가 표시용), `valid_from?`, `valid_to?`, `is_active`
- unique: (product, license_type) 중 활성인 것은 하나.
- UI는 "현재 유효 가격"을 조회만 하고, 할인율과 패키지 절약액은 **표시 시점에 계산**한다(하드코딩 없음).

**PackageItem**
`package_id → Product(kind=PACKAGE)`, `item_id → Product(kind=SINGLE)`, `position`
- 패키지 정가 비교값은 `Σ item 현재 가격(같은 license)`로 계산한다.

**ProductFile**
`id`, `product_id`, `role(DELIVERABLE|SAMPLE|PREVIEW_IMAGE)`, `format(PDF|HWP|HWPX|DOCX|ZIP|PNG|JPG|WEBP)`, `label`(예: "문제지", "정답·해설"), `position`, `current_version_id?`, `watermark_eligible(bool)`
- D4: 한 상품이 `문제지.pdf`, `문제지.hwp`, `정답.pdf`처럼 **형식별로 여러 파일**을 가질 수 있다.
- 상품 하나에 대한 하나의 entitlement가 그 상품의 모든 DELIVERABLE 파일 권한을 준다.

**FileVersion**
`id`, `product_file_id`, `version_label`(v1, v1.1), `storage_bucket`, `storage_key`, `original_filename`, `mime`, `size_bytes`, `sha256`, `page_count?`, `changelog_md?`, `created_by`, `created_at`, `validation_status(PENDING|OK|REJECTED)`
- 불변(immutable)이다. 수정판을 올리면 새 행이 생기고 `ProductFile.current_version_id`만 바뀐다.

**Collection**
`id`, `kind(MOCK_EXAM|SUNEUNG|EBS_BOOK|TEXTBOOK|TEXTBOOK_LESSON|CAMPAIGN)`, `source_key(unique)`, `slug(unique)`, `title`, `intro_md`, `meta(jsonb: year, month, grade, publisher, author, lesson_no …)`, `parent_id?`, `status`, `is_demo`, `seo_title?`, `seo_description?`
- **`source_key`가 시험/교재의 정규 식별자다.** 예: `mock:2026-09:g2`, `suneung:2027`, `ebs:2027-suneung-special:vol1`, `textbook:donga-yoon:m3`, `textbook:donga-yoon:m3:l05`. import는 이 키로 연결한다(§4).

**CollectionProduct**: `collection_id`, `product_id`, `position`, `is_pinned`

**Order**
`id`, `order_no(unique, 예: JY-20261004-0007)`, `user_id`, `status(PENDING_PAYMENT|PAID|CANCELLED|EXPIRED|REFUNDED|PARTIALLY_REFUNDED)`,
`subtotal_krw`, `discount_krw`, `total_krw`, `payment_method(BANK_TRANSFER|PG)`,
`depositor_name?`, `receipt_type(NONE|CASH_RECEIPT|TAX_INVOICE)`, `receipt_info(jsonb, 민감)`, `receipt_status(NOT_REQUESTED|REQUESTED|ISSUED)`,
`refund_policy_agreed_at`, `expires_at?`, `paid_at?`, `created_via(WEB|ADMIN_QUOTE)`, `admin_note?`, `created_at`
- `created_via=ADMIN_QUOTE`: 학원 견적처럼 admin이 직접 만드는 주문. **같은 commerce core**를 탄다.

**OrderItem** (가격 snapshot)
`id`, `order_id`, `product_id`, `license_type_id`, `title_snapshot`, `unit_price_krw`, `quantity(기본 1, 학원 seat 대비)`, `line_total_krw`

**Payment** (결제수단 차이를 흡수하는 층)
`id`, `order_id`, `provider(MANUAL_BANK|<pg_code>)`, `provider_payment_id?(unique per provider)`, `amount_krw`, `status(PENDING|CONFIRMED|FAILED|CANCELLED|REFUNDED)`, `confirmed_by_user_id?`(수동 확인한 admin), `evidence(jsonb: 입금일시/입금자명/메모 또는 PG 응답 원문 요약)`, `created_at`, `confirmed_at?`

**Entitlement**
`id`, `user_id`, `product_id`, `license_type_id`, `source(ORDER|FREE_CLAIM|ADMIN_GRANT)`, `order_item_id?`, `via_package_id?`, `status(ACTIVE|REVOKED)`, `granted_at`, `granted_by?`, `revoked_at?`, `revoke_reason?`
- unique: (user, product, license_type) 중 ACTIVE는 하나. 같은 상품을 다시 사도 중복 권한이 생기지 않는다.
- **패키지는 구매 시점에 펼친다:** 패키지 OrderItem 1개가 포함 단품 N개에 대한 Entitlement N개(`via_package_id` 기록)를 만든다. 패키지 구성이 나중에 바뀌어도 기존 구매자 권한은 예측 가능하게 유지된다. 추가 상품을 줄지는 admin의 "패키지 권한 재동기화" 액션으로 명시적으로 결정한다.

**DownloadEvent**
`id`, `user_id`, `entitlement_id?`, `product_id`, `file_version_id`, `outcome(GRANTED|DENIED)`, `deny_reason?`, `ip_hash`, `ua_hash`, `country?`, `watermarked(bool)`, `created_at`
- IP 원문은 저장하지 않는다(salted hash). 보존기간 정책(§7.4)을 둔다.
- 첫 다운로드 시각은 **청약철회 제한 판단 근거**가 된다(다운로드 전이면 환불 가능).

**FreeResource → 별도 엔터티로 두지 않는다 (재검토 결과)**

| 무료자료 유형 (Phase 1 §6) | 모델링 | Delivery |
|---|---|---|
| F1 상품 샘플 | `ProductFile(role=SAMPLE)` (유료 상품에 붙음) | 공개 bucket, 권한 확인 없음 |
| F2 리드 마그넷 | `Product(access=FREE_LOGIN, 가격 없음)` | "무료로 받기"를 누르면 `Entitlement(source=FREE_CLAIM)`이 생기고, **유료와 동일한 `/download` 경로**를 쓴다 |
| F3 블로그 부록 | F2와 같다 (BlogPost가 해당 Product를 참조) | 동일 |
| 완전 공개 자료 | `Product(access=FREE_PUBLIC)` + SAMPLE 역할 파일 | 공개 bucket |

**결론:** 별도 delivery system은 **불필요하고 해롭다.** 통합하면 내 자료실, 다운로드 로그, 수정판 배포, "무료자료 수령자" 마케팅 세그먼트를 그대로 재사용한다. 무료자료실(`/free`)은 `access IN (FREE_LOGIN, FREE_PUBLIC)` 상품을 보여주는 **화면**일 뿐이다.

**BlogPost**
`id`, `slug`, `title`, `excerpt`, `body_md`, `cover_image_key?`, `category`, `status(DRAFT|SCHEDULED|PUBLISHED)`, `published_at?`, `author_id`, `seo_title?`, `seo_description?`, `is_demo`
연결 테이블: `BlogPostProduct`, `BlogPostCollection` (글 하단 CTA 블록용)

**Inquiry**
`id`, `type(GENERAL|ACADEMY_QUOTE|ERROR_REPORT|REFUND|PURCHASE_HELP)`, `user_id?`, `name`, `email`, `phone?`, `academy_name?`, `seat_count?`, `product_id?`, `order_id?`, `message`, `status(NEW|IN_PROGRESS|DONE|SPAM)`, `admin_note?`, `created_at`, `handled_at?`
- 학원 견적 문의(ACADEMY_QUOTE)를 처리하면 admin이 `Order(created_via=ADMIN_QUOTE)`를 생성하고, 그 주문이 inquiry와 연결된다.

**ImportBatch / ImportItem** (§4)
`ImportBatch`: `id`, `manifest_schema_version`, `manifest_sha256`, `source_label`, `status(VALIDATED|DRY_RUN|APPLIED|FAILED)`, `report(jsonb)`, `created_by`, `created_at`
`ImportItem`: `batch_id`, `external_ref`, `action(CREATE|UPDATE|NEW_FILE_VERSION|SKIP|ERROR)`, `product_id?`, `messages(jsonb)`

**AuditLog**
`id`, `actor_user_id`, `action`(예: `payment.confirm`, `entitlement.grant`, `entitlement.revoke`, `product.publish`, `file.version.create`, `import.apply`), `target_type`, `target_id`, `before(jsonb)?`, `after(jsonb)?`, `created_at`

**지원 테이블:** `Redirect(from_path, to_path)`, `SiteSetting(key, value jsonb)` (계좌 안내, 사업자 표시 정보, 홈 기획 섹션 구성, 다운로드 제한값 등을 코드 배포 없이 관리)

### 3.3 저작권 노출 최소화를 위한 모델 장치 (D6)
- `ProductFile(role=PREVIEW_IMAGE|SAMPLE)`에 `preview_reviewed_at/by`가 있다. **검토하지 않은 미리보기는 공개되지 않는다.**
- 허브와 상품의 공개 텍스트 필드는 우리가 작성한 메타 설명 용도다. 원문 지문을 담는 필드는 **두지 않는다.**
- `source_attribution`: 출처 표기가 필요할 때 쓰는 표준 필드다. 법률 workstream 결론에 따라 문구를 채운다.

---

## 4. Generator_EngText 연동 경계 (Extension Boundary)

### 4.1 원칙
1. **웹사이트가 계약(스키마)을 소유한다.** 엔진은 그 계약에 맞춰 export하는 adapter만 만든다.
2. **데이터 계약 외에는 결합하지 않는다.** 엔진의 repo 구조, 경로, 내부 ID, 코드를 웹사이트가 import하거나 참조하지 않는다.
3. **import는 항상 DRAFT를 만든다.** 공개는 admin이 검토 후 명시적으로 한다 (미리보기 검토 D6 포함).
4. **멱등성:** 같은 bundle을 두 번 import해도 결과가 같다 (`external_ref` + `sha256` 기준).

### 4.2 Bundle 형식

```
bundle/
├─ manifest.json
└─ files/ ... (manifest가 상대경로로 참조)
```
- zip 하나로 묶거나 폴더로 전달한다. 스키마는 repo의 `docs/integration/import-manifest.schema.json`에 버전별로 둔다(M9에서 생성).

### 4.3 Manifest 스키마 초안 (v1)

```json
{
  "schema": "jiyounglab-import-manifest",
  "schema_version": "1.0",
  "generated_at": "2026-10-04T12:00:00Z",
  "generator": { "name": "Generator_EngText", "version": "x.y.z", "run_id": "opaque-string" },
  "collections": [
    {
      "source_key": "mock:2026-09:g2",
      "kind": "MOCK_EXAM",
      "title": "2026학년도 9월 고2 전국연합학력평가",
      "meta": { "year": 2026, "month": 9, "grade": "g2" }
    }
  ],
  "products": [
    {
      "external_ref": "gen:mock-2026-09-g2:transform:set-a",
      "kind": "SINGLE",
      "title": "2026 9월 고2 모의고사 변형문제 SET A",
      "summary": "...",
      "material_type": "TRANSFORM",
      "grade": ["g2"],
      "collections": ["mock:2026-09:g2"],
      "specs": { "question_count": 60, "page_count": 24, "has_answer_key": true, "has_explanation": true },
      "version": { "label": "v1.1", "changelog": "31번 선지 오류 수정" },
      "files": [
        { "role": "DELIVERABLE", "label": "문제지", "format": "PDF", "path": "files/set-a/problems.pdf", "sha256": "..." },
        { "role": "DELIVERABLE", "label": "문제지(편집용)", "format": "HWP", "path": "files/set-a/problems.hwp", "sha256": "..." },
        { "role": "DELIVERABLE", "label": "정답·해설", "format": "PDF", "path": "files/set-a/answers.pdf", "sha256": "..." },
        { "role": "SAMPLE", "label": "샘플 3쪽", "format": "PDF", "path": "files/set-a/sample.pdf", "sha256": "..." },
        { "role": "PREVIEW_IMAGE", "format": "PNG", "path": "files/set-a/preview-1.png", "sha256": "..." }
      ],
      "pricing_hint": [ { "license": "PERSONAL", "amount_krw": 9900 } ]
    },
    {
      "external_ref": "gen:mock-2026-09-g2:package:all",
      "kind": "PACKAGE",
      "title": "2026 9월 고2 전 지문 변형 패키지",
      "collections": ["mock:2026-09:g2"],
      "package_items": ["gen:mock-2026-09-g2:transform:set-a", "gen:mock-2026-09-g2:transform:set-b"],
      "pricing_hint": [ { "license": "PERSONAL", "amount_krw": 29000 } ]
    }
  ]
}
```

### 4.4 Import 처리 흐름

```
1. UPLOAD    bundle → R2 staging 영역 (presigned PUT, admin 또는 CLI)
2. VALIDATE  Zod/JSON Schema 검증, 모든 path 존재 여부와 sha256 일치, 허용 format, 파일 magic bytes, 크기 제한,
             package_items 참조 무결성, source_key 문법
3. DRY-RUN   현재 DB와 비교한 diff 리포트를 생성해 admin 화면에 표시
              - CREATE: external_ref 신규 → DRAFT 상품 생성 예정
              - NEW_FILE_VERSION: 같은 external_ref, sha256 변경 → 새 FileVersion 예정 (+ changelog)
              - UPDATE: specs 등 엔진 소유 필드 변경
              - SKIP: 변경 없음
              - WARN: 없는 collection(→ DRAFT collection 생성 예정), import_locked_fields 충돌
4. APPLY     admin 확인 후 단일 transaction으로 DB 반영 + staging 파일을 private/public 정위치로 copy
             → ImportBatch/ImportItem 기록, AuditLog(import.apply)
5. REVIEW    admin이 DRAFT 상품의 미리보기 검토(D6), 가격 확정, publish
```

**필드 소유권 규칙 (import가 admin 작업을 덮어쓰지 않게):**

| 필드 | 소유 | import 동작 |
|---|---|---|
| files, specs, version/changelog | 엔진 | 항상 반영 |
| title, summary, slug | 생성 시 엔진 → 이후 admin | **CREATE 시에만** 설정. 이후에는 admin이 수정하면 `import_locked_fields`에 기록되고 import가 건너뛴다 |
| pricing_hint | 참고값 | 가격이 없을 때만 **비활성 ProductPrice 초안**으로 생성. 활성 가격은 절대 바꾸지 않는다 |
| status | admin | import는 절대 PUBLISHED로 만들지 않는다 |
| collections | 엔진 + admin | 연결 추가만 하고 제거하지 않는다 |

**수정판 배포:** 이미 판매된 상품에 NEW_FILE_VERSION이 apply되면 기존 구매자는 다음 다운로드부터 최신본을 받는다. 알림 메일은 E2에서 다룬다.

### 4.5 운반 경로 (Transport)

| 단계 | 방법 |
|---|---|
| MVP (M9) | ① admin UI에서 bundle zip 업로드, ② **로컬 CLI** `pnpm jy-import ./bundle --dry-run`. CLI는 admin API token으로 import API를 호출하고 파일은 presigned URL로 직접 업로드한다 |
| 향후 | 엔진 CI가 같은 import API를 호출. 토큰은 import scope 전용이고 만료와 회수가 가능하다. 엔진 측 코드는 "manifest 생성 + API 호출"만 하면 된다 |

`run_id`, `generator.version`은 **추적용 메타데이터로만 저장**하고, 웹사이트 로직이 해석하지 않는다(결합 방지).

---

## 5. Commerce Transition Architecture

### 5.1 핵심: 결제수단과 무관한 단일 Commerce Core

```
                 ┌──────────────── 결제수단별 (교체 가능) ───────────────┐
 [MVP]  고객 "구매 신청" ──▶ Order(PENDING_PAYMENT, BANK_TRANSFER)
                           ──▶ 입금 안내 (화면 + 메일: 계좌, 금액, 입금자명, 기한)
        admin "입금 확인"  ──▶ ManualBankProvider.confirm(order, evidence)
                                       │
 [E1]   고객 "결제하기"   ──▶ Order(PENDING_PAYMENT, PG) ──▶ PG 결제창
        PG webhook/redirect ──▶ PgProvider.verify(req)
                                ├ 서명 검증
                                ├ PG API로 결제 재조회 (서버↔PG)
                                └ 금액 == order.total 확인
                                       │
                 └─────────────────────┼──────────────────────────────────┘
                                       ▼
                      ┌──────── Commerce Core (결제수단 무관, 1개) ────────┐
                      │ recordPayment(order, PaymentResult)   (멱등)        │
                      │   → Payment(CONFIRMED) 저장                          │
                      │   → markOrderPaid(order)                             │
                      │       → Order.status = PAID                          │
                      │       → grantEntitlementsForOrder(order)             │
                      │            (패키지 펼침, 중복 방지)                    │
                      │       → AuditLog, 확인 메일 발송(outbox)               │
                      │   모두 하나의 DB transaction                          │
                      └──────────────────────────────────────────────────────┘
```

### 5.2 인터페이스

```ts
interface PaymentProvider {
  code: 'MANUAL_BANK' | string;
  // 결제 시작: 수동은 입금 안내 정보, PG는 결제창 파라미터를 반환
  initiate(order: Order): Promise<PaymentInitiation>;
  // 결제 확인: 수동은 admin 입력, PG는 webhook/redirect 요청을 서버에서 검증한 결과
  verify(input: unknown): Promise<VerifiedPaymentResult>; // { orderId, providerPaymentId, amountKrw, paidAt, raw }
  // 환불: 수동은 admin이 송금 후 기록, PG는 취소 API 호출
  refund(payment: Payment, amountKrw: number, reason: string): Promise<RefundResult>;
}
```

- **Commerce core는 `VerifiedPaymentResult`만 받는다.** 결과가 admin 클릭에서 왔는지 PG webhook에서 왔는지 알 필요가 없다.
- **멱등성:** `(provider, provider_payment_id)` unique 제약이 있다. 수동 결제는 `provider_payment_id = manual:{orderId}`로 둔다. webhook이 재전송되거나 admin이 버튼을 두 번 눌러도 권한은 한 번만 생성된다.
- **환불:** `refundOrder()`가 Payment 상태를 갱신하고 `Entitlement.status=REVOKED`로 바꾸고 AuditLog를 남긴다. 이 core도 하나다.

### 5.3 상태 기계

```
Order:  PENDING_PAYMENT ──(recordPayment)──▶ PAID ──(refund)──▶ REFUNDED / PARTIALLY_REFUNDED
              │
              ├──(고객 취소 or admin 취소)──▶ CANCELLED
              └──(expires_at 경과, 일 1회 cron)──▶ EXPIRED
```
- MVP 미입금 만료 기한은 `SiteSetting`으로 관리한다(기본값 제안 3일, OWNER 결정).
- 일 1회 작업(만료 처리, DownloadEvent 보존기간 정리)은 **Workers Cron Trigger**로 돌린다(추가 vendor 없음).

### 5.4 PG 연동 방식 비교 (D2: 특정 PG에 종속하지 않음)

| 방식 | 예시 | 장점 | 단점 | 적합성 |
|---|---|---|---|---|
| **A. PG 직접 연동 1곳** | 토스페이먼츠, KG이니시스, NHN KCP 등 | vendor 1곳, 간편결제(카카오/네이버/토스페이)를 PG 하나로 제공하는 경우가 많음, 문서 품질 | PG를 바꾸려면 adapter를 새로 작성 | **권장.** 우리 `PaymentProvider`가 이미 교체 지점이다 |
| **B. 결제 aggregator** | 포트원(PortOne) | PG 여러 곳을 한 API로 연결, PG 교체가 설정 수준 | vendor가 하나 더 늘어나고, 추상화가 이중이며, 별도 요금(`VERIFY_REQUIRED`) | PG 심사 거절이나 복수 PG가 필요할 때 대안 |
| **C. 간편결제사 개별 계약** | 카카오페이, 네이버페이 직접 | 해당 결제수단의 수수료와 조건이 유리할 수 있음 | 계약과 adapter가 여러 개로 늘어남 | 매출이 커진 뒤 검토 |
| **D. 외부 마켓 링크아웃** | 스마트스토어 | 즉시 판매 가능 | 권한과 고객 데이터가 우리 시스템 밖에 있고, 수수료가 높음 | 비권장 (D1과 불일치) |

**E1 시점 체크리스트 (PG 선정 시 owner가 확인할 것):**
- **디지털 콘텐츠 업종 가맹 심사** 가능 여부 (일부 PG는 디지털 상품에 추가 심사)
- 카드 수수료, 간편결제 수수료, 가입비와 연관리비. 참고로 토스페이먼츠 기본 요금은 카드 3.4%, 가입비 22만원, 연관리비 11만원, VAT 별도라는 2차 출처가 있다 (`VERIFY_REQUIRED`, 협상 가능 여부 포함)
- **가상계좌**와 webhook 지원. 가상계좌를 쓰면 MVP의 "수동 입금 확인"이 **자동 입금 확인으로 바뀐다. core 변경 없이 provider만 추가**하면 된다
- 현금영수증 자동 발행 지원 (D15의 수동 처리 해소)
- 정산 주기, 보증보험 조건

---

## 6. 운영 단순성 (Operational Simplicity)

### 6.1 평가 기준별 설계

| 기준 | 설계 | owner의 실제 작업 |
|---|---|---|
| **Deploy simplicity** | main merge = 자동 배포. PR마다 preview URL | PR 검토 후 merge 버튼 |
| **Backup/recovery** | ① Neon PITR (무료 6시간, 유료는 더 김: `VERIFY_REQUIRED`), ② **매일 `pg_dump` → R2 `jy-backup`** (GitHub Actions, 일 30개 + 월 12개 보관), ③ 파일은 불변 key라 덮어쓰기 사고가 없음 | 없음. 복구 절차는 `docs/runbooks/restore.md`(M10) |
| **Product upload workload** | 상품 1개 등록 화면을 1페이지로 구성 (메타, 가격, 파일을 drag&drop) | 상품당 약 5분 목표 |
| **Bulk registration** | ① CSV/JSON + 파일 폴더 bundle import(M9, §4와 동일 경로), ② 엔진 manifest | 회차당 약 30분 목표 (Phase 1 §9) |
| **File replacement/versioning** | "수정판 올리기" 버튼으로 새 FileVersion 생성. changelog를 입력하면 구매자는 자동으로 최신본을 받음. 이전 버전 보존과 롤백 가능 | 파일 1개 업로드 + 수정 내용 한 줄 |
| **Security** | §7. Cloudflare Access + TOTP, AuditLog | 최초 1회 2FA 설정 |
| **Observability** | Workers Logs(에러, 요청), admin 대시보드(오늘 주문, 미확인 입금, 신규 문의, 다운로드 이상 징후), **에러와 신규 주문/문의 시 admin 메일 알림** | 메일 확인 |
| **Monthly fixed cost** | §9: 초기 판매 단계 약 ₩8~9천 | — |
| **Vendor count** | Cloudflare, Neon, Resend (+ GitHub). E1에 PG 1곳 추가 | 계정 3개 관리 |
| **Maintenance burden** | 의존성 업데이트는 Renovate/Dependabot PR(월 1회 묶음), CI 통과 시 merge. 서버나 OS 관리 없음 | 월 1회 업데이트 PR merge |

### 6.2 Admin 화면 목록 (M5 범위)
대시보드 · 상품(목록/편집/파일·버전/가격/미리보기 검토) · 패키지 구성 · 컬렉션(허브) · 홈 기획 섹션 · 주문(입금 확인/취소/환불/증빙 처리) · 권한(수동 부여/회수) · 문의 · 블로그 · Import · 설정(계좌, 사업자 정보, 제한값) · Audit log

---

## 7. Security / Digital Product Delivery

### 7.1 위협별 대응

| 위협 | 대응 | 수준 |
|---|---|---|
| **Unauthorized download** | 판매 파일은 비공개 bucket에만 있다. 출구는 `/download` 하나이고, `requireUser` + `canDownload` 순서로 검사한다. **통합 테스트로 "권한 없는 사용자, 회수된 권한, DRAFT 상품, SAMPLE 아닌 파일 → 403"을 고정** | 필수 |
| **Guessable file URL** | 객체 key에 무작위 토큰을 포함하고, 모든 ID는 UUID다(순차 ID 노출 없음). 비공개 bucket에는 공개 접근이나 r2.dev 도메인을 켜지 않는다 | 필수 |
| **Entitlement bypass** | 권한 판정 로직은 `canDownload()` **단일 함수**에만 있다(다른 경로에 복제 금지). IDOR 테스트(다른 사용자의 fileId). 서버에서만 판정한다. 주문 금액은 서버가 DB 가격으로 재계산한다(클라이언트 가격 무시) | 필수 |
| **Download-link sharing** | 공유할 수 있는 URL이 없다(사이트 경로는 로그인과 권한 필요). 계정 공유는 사용자당 rate limit과 이상 탐지(예: 24시간 내 다운로드 N회 초과, 서로 다른 IP hash M개 초과 시 admin 알림)로 다룬다. 억제책으로 **optional 워터마크**를 둔다(§7.3). 공격적 DRM은 쓰지 않는다(D5) | 필수 + 선택 |
| **Admin compromise** | ① `/admin/*`은 Cloudflare Access(owner 이메일만 허용, 무료), ② 앱 로그인 + **TOTP 필수**, ③ admin 세션 12시간, ④ 모든 변경을 AuditLog에 기록, ⑤ 결제 확인, 권한 부여, 환불 시 재인증, ⑥ 최소권한 토큰(R2 백업 토큰은 쓰기만, import 토큰은 import scope만) | 필수 |
| **Payment spoofing** | MVP: 결제 확정은 admin 행위로만 일어나고 고객 쪽에는 경로가 없다. E1: 클라이언트 redirect 파라미터를 신뢰하지 않고, webhook 서명을 검증하고, **PG API로 서버에서 재조회**하고, 금액이 일치하는지 확인하고, provider payment id로 멱등 처리한다 | 필수 |
| **Malicious upload** | 업로드 주체는 admin뿐이다(고객 업로드 없음). format whitelist(PDF, HWP, HWPX, DOCX, ZIP, PNG, JPG, WEBP)와 **magic-byte 검증**, 크기 상한, **SVG/HTML 금지**. 다운로드는 항상 `Content-Disposition: attachment` + `X-Content-Type-Options: nosniff`로 보낸다. 공개 자산은 별도 서브도메인(`assets.`)에서 서빙해 앱 origin과 분리한다. Markdown 렌더링은 sanitize한다(XSS) | 필수 |
| **Personal-data exposure** | 최소 수집(이메일, 이름, 필요 시 증빙정보). `receipt_info`는 admin만 열람하고 발행 완료 후 보존기간이 지나면 파기한다. IP는 salted hash로 저장한다. 로그에 PII를 남기지 않는다. 고객 화면에는 본인 데이터만 보인다(쿼리에 user_id 강제). DB와 R2는 전송 중과 저장 시 암호화(공급자 기본) | 필수 |
| 계정 탈취/스팸 | OTP 시도 제한(5회), OTP 10분 만료, 가입·OTP·문의에 Turnstile, 이메일 열거 방지(동일 응답) | 필수 |
| 일반 웹 | CSRF(Server Actions의 origin 검사와 SameSite cookie), CSP 기본 정책, 보안 헤더, 의존성 취약점 알림 | 필수 |

### 7.2 일부러 하지 않는 것 (overengineering 방지)
DRM 뷰어, 파일 암호화 배포, 기기 바인딩, WAF 유료 규칙, SIEM, 별도 secrets manager, 침투테스트 용역. **현재 위험 규모 대비 과하다.**

### 7.3 Optional: 구매자 식별 워터마크 (D5)
- `ProductFile.watermark_eligible=true`이고 PDF인 파일에 한해, 첫 다운로드 시 `pdf-lib`로 각 페이지 하단에 "구매자 이메일 일부 마스킹 · 주문번호 · 날짜"를 삽입한다. 만든 사본은 `private/wm/{entitlementId}/{versionId}`에 캐시해서 재사용한다.
- **HWP는 워터마크를 넣지 않는다**(형식 특성상 신뢰할 수 있는 삽입이 어렵다). HWP 파일의 유출 억제는 DownloadEvent 추적과 이용약관에 의존한다. 이 trade-off를 owner가 인지해야 한다.
- 전역 설정(`SiteSetting.watermark.enabled`)과 파일별 플래그로 켜고 끈다. 대용량 PDF에서 Workers CPU 한도를 넘으면 해당 파일은 워터마크 없이 제공하고 로그를 남긴다(fail-open 여부도 설정으로 관리).
- 구현 시점: M4의 확장(M4b) 또는 출시 후. MVP 출시를 막지 않는다.

### 7.4 개인정보 관련 운영 요건 (설계 반영, 문안은 OWNER/전문가)
- **국외 이전 고지:** Cloudflare, Neon, Resend는 해외 사업자이고 데이터가 해외 리전에 저장될 수 있다. 개인정보처리방침에 **처리위탁과 국외이전 항목**을 명시해야 한다.
- **보존기간:** 주문과 결제 기록은 전자상거래법상 일정 기간 보존해야 한다(일반적으로 5년으로 알려져 있으나 `VERIFY_REQUIRED`, 법률 검토). DownloadEvent는 예를 들어 1년 후 집계만 남기고 삭제한다(OWNER 결정).
- **회원 탈퇴:** User를 soft-delete하고 PII를 익명화한다. 주문 기록은 법정 보존을 위해 분리 보관한다.

---

## 8. Architecture Alternatives

### A. 권장: "Cloudflare 중심 단일 Next.js 앱"
**Next.js on Cloudflare Workers + Neon Postgres + R2 + Resend**

- ✅ 월 고정비 ₩0 → 약 ₩8~9천 (D14 충족, §9)
- ✅ 다운로드 egress 0원. 디지털 상품 사업의 핵심 변동비를 제거한다
- ✅ vendor 3곳, 앱 1개, 배포 1개
- ✅ 모든 사업 로직과 데이터(Postgres)가 우리 소유이고 이식할 수 있다
- ⚠️ OpenNext/Workers 런타임 호환성 위험: M0에서 실제 배포까지 검증해 조기에 확인하고, fallback을 둔다
- ⚠️ 네이티브 모듈을 쓸 수 없다(이미지는 업로드 시 처리, PDF는 pdf-lib로 대응)

### B. "Vercel + Supabase 일체형"
**Next.js on Vercel Pro + Supabase (Postgres + Auth + Storage)**

- ✅ 개발 경험이 가장 매끄럽다(Next.js의 본가). Auth와 Storage를 Supabase가 제공한다
- ❌ Vercel Hobby는 **비상업 전용**이라 상업 사이트는 Pro($20/user/월)가 필요하다(`VERIFY_REQUIRED`). Supabase 무료 tier는 비활성 시 일시정지 등 운영용으로 제약이 있어 Pro($25/월 수준: `VERIFY_REQUIRED`)가 현실적이다. 합계 **약 ₩63,000/월로 D14 초과**
- ❌ 파일 다운로드가 많으면 egress 과금이 생긴다
- ❌ Supabase Auth/Storage를 깊게 쓰면 lock-in이 커진다

**A로 가다 문제가 생길 때의 fallback:** "Vercel Pro + Neon + R2 + Resend"(약 ₩28,000/월)는 A의 코드를 거의 그대로 옮길 수 있다. 이를 위해 A에서 `platform/` 격리를 지킨다.

### C. "호스팅형 쇼핑몰" (아임웹 / Shopify + 디지털 다운로드 앱)

- ✅ 출시가 가장 빠르고(수일), 결제와 회원이 내장되어 있다
- ❌ 시험/단원 허브 수백 개의 programmatic SEO, 엔진 manifest bulk import, 파일 버전 배포, 학원 라이선스 모델을 구현하기 어렵거나 불가능하다
- ❌ 월 구독료와 앱 비용, 거래 수수료, 높은 lock-in. 고객과 권한 데이터가 플랫폼에 묶인다
- 판단: Phase 1의 핵심 요구(허브 SEO, bulk import)와 충돌하므로 **기각**. 단, 판매를 즉시 시작해야 하는 사업 사정이 생기면 **임시 판매 채널**로만 고려한다.

### D. "VPS 셀프호스팅" (참고로만 평가)
- ✅ 월 수천원대 고정, 완전한 통제권
- ❌ OS와 보안 패치, 백업, TLS, 장애 대응을 owner가 직접 해야 한다. **1인 운영 원칙에 위배되어 기각.**

### 종합 비교

| 기준 | A (권장) | B | C | D |
|---|---|---|---|---|
| 월 고정비 (초기 판매) | ◎ 약 ₩8~9천 | ✕ 약 ₩63,000 | △ 플랜에 따라 다름 (`VERIFY_REQUIRED`) | ◎ |
| 다운로드 변동비 | ◎ 0 | △ | ○ | ○ |
| Phase 1 요구 충족 | ◎ | ◎ | ✕ | ◎ |
| 운영 부담 | ○ | ◎ | ◎ | ✕ |
| Lock-in | ○ | △ | ✕ | ◎ |
| 기술 위험 | △ (OpenNext) | ◎ | ◎ | ○ |
| Vendor 수 | 3 | 3 | 1~3 | 1 |

---

## 9. Cost Model

> 모든 가격은 2026-10-04 기준 2차 출처이며 **`VERIFY_REQUIRED`**. 환율 1 USD ≈ 1,400 KRW 가정.

### 9.1 서비스별 무료 한도와 유료 시작점

| 서비스 | 무료 한도 | 유료 시작 | 출처 상태 |
|---|---|---|---|
| Cloudflare Workers | 무료 플랜 있음 (일 요청 한도, 작은 스크립트 크기 한도: `VERIFY_REQUIRED`) | **Paid $5/월**: 1,000만 요청 + 3,000만 CPU-ms 포함, 초과분 $0.30/백만 요청 | 2차 출처 |
| Cloudflare Hyperdrive | Free: 10만 쿼리/일 | Workers Paid에 포함, 쿼리 무제한 | 2차 출처 |
| Cloudflare R2 | 10GB 저장, Class A 100만, Class B 1000만/월, **egress 무료** | $0.015/GB-월, A $4.50/백만, B $0.36/백만 | 2차 출처 |
| Cloudflare Access | 50명까지 무료 | — | 2차 출처 |
| Cloudflare Web Analytics, Turnstile | 무료 | — | `VERIFY_REQUIRED` |
| Neon | 0.5GB/project, 100 CU-시간/월, PITR 6시간, 5분 무활동 시 scale-to-zero | 유료 플랜 (사용량 기반, 정확한 최소 금액 `VERIFY_REQUIRED`) | 2차 출처 |
| Resend | 3,000통/월, **100통/일**, 도메인 1개 | Pro $20/월 (5만통) | 2차 출처 |
| 도메인 (.com 기준) | — | 연 약 $10~12 (Cloudflare Registrar 원가 판매 기준. `.co.kr`은 별도) | `VERIFY_REQUIRED` |
| GitHub (private repo, Actions) | 무료 플랜에 Actions 분 포함 | — | `VERIFY_REQUIRED` |
| PG (E1) | — | 예: 토스페이먼츠 카드 3.4%, 가입비 22만원, 연관리비 11만원, VAT 별도 (협상 가능 여부 미상) | 2차 출처, `VERIFY_REQUIRED` |

### 9.2 단계별 예상 비용

**① MVP (개발과 비공개 검증, 실고객 없음)**

| 항목 | 월 비용 |
|---|---|
| Workers Free (스크립트 크기 한도 초과 시 Paid 필요, M0에서 확인) | ₩0 (최악 ₩7,000) |
| Neon Free, R2 Free, Resend Free(개발 중엔 dev outbox), GitHub Free | ₩0 |
| **합계** | **₩0 ~ 7,000** |

**② 초기 실제 판매 (예: 월 방문 1만 이하, 상품 수백 개, 저장 10GB 이하, 메일 일 100통 이하)**

| 항목 | 월 비용 |
|---|---|
| Workers Paid ($5) | 약 ₩7,000 |
| 도메인 (연 약 ₩15,000~20,000 ÷ 12) | 약 ₩1,300~1,700 |
| Neon, R2, Resend, Access, Analytics | ₩0 (무료 한도 내) |
| **고정비 합계** | **약 ₩8,000 ~ 9,000** (D14 충족) |
| 변동비 | 결제 수수료(E1 이후, 매출의 약 3.4%+VAT), PG 가입비와 연관리비(일회성 및 연간) |

**③ 성장 단계 (예: 상품 수천 개, 저장 50GB, 메일 일 100통 초과, DB 상시 활성)**

| 항목 | 월 비용 (추정) |
|---|---|
| Workers Paid | 약 ₩7,000 (+ 요청 1,000만 초과 시 백만당 $0.30) |
| R2 (50GB → 무료 10GB 초과 40GB × $0.015) | 약 ₩840 |
| Neon 유료 플랜 (compute 상시화) | `VERIFY_REQUIRED` (사용량 기반, 대략 월 수만원대로 예상) |
| Resend Pro | 약 ₩28,000 (일 100통 한도를 넘을 때만) |
| 도메인 | 약 ₩1,500 |
| **고정비 합계** | **약 ₩8,000 ~ 70,000** (무엇이 먼저 한도를 넘는지에 따라 다름) |

**비용 증가 트리거와 대응 순서:**
1. 메일 일 100통 초과 → Resend Pro (또는 SES 같은 저가 대안 adapter)
2. Neon compute 100시간 초과 또는 0.5GB 초과 → Neon 유료
3. R2 10GB 초과 → GB당 과금 (매우 저렴)
4. 트래픽은 Workers Paid 포함량이 넉넉해서 가장 늦게 도달한다

---

## 10. Implementation Plan (Phase 3 이후)

> 순서: **Phase 3 (Design system)** → Phase 4 (M0~M10) → Phase 5 (검증) → Phase 6 (문서)
> 각 milestone은 **독립적으로 build, test, deploy 가능**하며 PR 하나 단위다. 종료 조건을 충족해야 다음으로 넘어간다.

| M | 이름 | 범위 | 종료 조건 (테스트 가능) |
|---|---|---|---|
| **M0** | Foundation | Next.js 16 + TS + Tailwind scaffold, ESLint/Prettier, Vitest, Playwright, Drizzle + PGlite 테스트 하네스, GitHub Actions CI, `@opennextjs/cloudflare` 빌드, **Workers preview 배포 1회 성공**, `platform/` adapter 골격, env 스키마 검증 | CI green. preview URL에서 health 페이지 응답. **OpenNext 호환성 판정(Go/No-go → fallback)** |
| **M1** | UI Shell | Phase 3 디자인 토큰과 컴포넌트, Header/Footer/GNB, 반응형 레이아웃, 법적 고지 4종(템플릿 문안 + "검토 필요" 표시), 404/500 | 컴포넌트 단위 테스트, 모바일/PC 스크린샷 테스트, axe 접근성 0 critical |
| **M2** | Catalog & SEO core | 스키마(Product, Price, LicenseType, Package, Collection, ProductFile 메타), **demo seed (is_demo, 예시 배지, noindex)**, 홈/카탈로그(필터·정렬·검색)/상품 상세/패키지 상세/허브 페이지, 메타, JSON-LD, sitemap, robots | 카탈로그 필터 통합 테스트, 가격 계산 단위 테스트(패키지 절약액), sitemap에 demo 제외 검증, Lighthouse SEO ≥ 95 |
| **M3** | Auth & Account | Better Auth(Email OTP), Turnstile, 세션, `/account` 골격, admin role + TOTP, Cloudflare Access 설정 문서 | OTP 로그인 E2E(dev outbox), 시도 제한 테스트, admin 경로 비인가 차단 테스트 |
| **M4** | Files & Secure Delivery | StorageAdapter(R2 + 로컬 dev 구현), presigned 업로드 → finalize(magic bytes, sha256), FileVersion, 공개 미리보기와 샘플, `/download` + `canDownload` + DownloadEvent + rate limit, 무료자료 FREE_CLAIM, 내 자료실 | **권한 매트릭스 통합 테스트**(무권한, 회수, DRAFT, 타인 IDOR → 403), 최신 버전 제공 테스트, 이상 다운로드 알림 테스트 |
| **M4b** (선택) | Watermark | pdf-lib 워터마크, 사본 캐시, 설정 플래그 | 워터마크 텍스트 추출 테스트, 한도 초과 시 fallback 테스트 |
| **M5** | Admin console | 상품, 파일 버전, 가격, 패키지, 컬렉션, 홈 기획, 미리보기 검토, 권한 수동 부여/회수, 설정, AuditLog, 대시보드 | admin E2E: 상품 생성 → 파일 업로드 → publish → 공개 페이지 반영(revalidate). 모든 변경에 AuditLog 기록 |
| **M6** | Commerce core (Manual) | 장바구니, 구매 신청(Order, 가격 서버 재계산, 환불정책 동의, 증빙 요청), 입금 안내, admin 입금 확인 → `recordPayment` → entitlement, 취소/만료(cron)/환불(권한 회수), 주문 메일, `PaymentProvider` 인터페이스 + `ManualBankProvider` + **테스트용 `FakePgProvider`** | **commerce core 단위 테스트**(멱등, 패키지 펼침, 금액 불일치 거부), FakePg로 webhook 경로 E2E. **같은 core가 두 경로에서 동작함을 테스트로 증명** |
| **M7** | Blog | 글 CRUD(markdown, sanitize), 카테고리, 관련 상품/무료자료 CTA, Article JSON-LD, RSS | 렌더링, XSS sanitize 테스트, sitemap 포함 |
| **M8** | Support & Inquiry | FAQ, 문의 폼(유형별, Turnstile), admin 알림 메일, 문의 → 견적 주문 생성 | 폼 E2E, 스팸 차단, 견적 주문이 M6 core를 타는지 테스트 |
| **M9** | Bulk import | manifest JSON Schema v1, validator, dry-run diff UI, apply transaction, 필드 소유권 규칙, CLI(`jy-import`), **demo bundle fixture** | fixture bundle import → 재import 멱등 → 파일 sha 변경 시 새 버전 → locked field 보존 테스트 |
| **M10** | Launch readiness | 보안 점검(§7 체크리스트), 접근성, 성능, broken link 검사, 백업 Action + 복구 리허설, runbook(배포, 복구, 입금 확인, 환불, 수정판), 운영 매뉴얼 | Phase 5 검증 항목 전부 통과 |
| **E1~** | (Phase 1 §10.2) | PG adapter(가상계좌 포함), Kakao 로그인, 수정판 알림, 학원 라이선스 온라인 판매 등 | 각자 별도 계획 |

**의존 관계:** M0 → M1 → M2 → (M3 ∥ M7) → M4 → M5 → M6 → M8 → M9 → M10
(M7 블로그는 M2 이후 언제든 병렬 가능. M9는 M5의 파일 처리 로직을 재사용)

---

## 11. OWNER_DECISIONS_REMAINING

| ID | 결정 | 필요 시점 | 기본값 (답이 없으면) |
|---|---|---|---|
| **O1** | **도메인 구매 시점과 이름.** 실고객 이메일 로그인과 발송에 필수 | M3 실사용 전 (출시 전 필수) | 개발은 dev outbox로 진행, 출시 직전 구매 |
| **O2** | **서비스 계정 소유:** Cloudflare, Neon, Resend, GitHub 계정을 owner 명의로 생성 (Claude는 production credential을 만들거나 쓰지 않음) | M0 preview 배포 전 | preview 배포 없이 로컬과 CI 검증만 |
| **O3** | 아키텍처 A 승인, 또는 처음부터 fallback(Vercel Pro, 약 ₩28,000/월)으로 갈지 | Phase 3 전 | A로 진행, M0에서 Go/No-go |
| **O4** | 입금 계좌 정보, 사업자 표시 정보(상호, 대표, 사업자번호, 통신판매업 번호, 주소, 연락처) | M6 / 출시 전 | "설정 필요" placeholder (SiteSetting) |
| **O5** | 미입금 주문 만료 기간 | M6 | 3일 |
| **O6** | 다운로드 rate limit과 이상 탐지 임계값 | M4 | 시간당 30회, 24시간 내 서로 다른 IP 5개 초과 시 알림 |
| **O7** | 워터마크 도입 시점 (M4b 포함 여부) | M4 | MVP 제외, 출시 후 판단 |
| **O8** | DownloadEvent와 증빙정보 보존기간 (법률 검토 연계) | M10 | DownloadEvent 1년, 증빙정보는 발행 후 법정 기간 |
| **O9** | 이용약관, 개인정보처리방침(국외이전 포함), 환불정책, 라이선스 **최종 문안**: 전문가 검토 | 출시 전 | 템플릿 + "검토 필요" 표시 |
| **O10** | 오프사이트 백업 2차 사본 필요 여부 (R2 외 별도 저장소) | M10 | R2만 사용 |
| **O11** | PG 선정 (E1): §5.4 체크리스트 기반 | E1 | — |
| **O12** | Kakao 로그인 도입 시점 | E1 | E1에 결제와 함께 도입 |
| **O13** | 법률 workstream(D6) 결과를 상품 공개 정책에 반영 | 첫 실상품 publish 전 | 미리보기 검토 플래그로 공개 통제 |

---

## 12. 검증 메모 (이 문서의 한계)

- 외부 가격과 정책은 공식 페이지를 직접 열지 못하고 검색 결과(2차 출처)로 확인했다. 가입 전 공식 페이지에서 재확인해야 한다(`VERIFY_REQUIRED`).
- OpenNext Cloudflare adapter의 호환성은 문서 수준 판단이다. **M0의 실제 배포 테스트가 최종 판정**이다.
- 법률 관련 기술(전자상거래법 청약철회, 보존기간, 국외이전)은 설계 반영용 요약이며 법률 자문이 아니다.
