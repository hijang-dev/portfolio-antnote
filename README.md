# antnote

주식 투자를 처음 시작하는 초보자를 위한 서비스입니다. 사용자가 무엇을 사는지
제대로 이해하고 투자할 수 있도록 돕는 것을 목표로 합니다 (쉬운 설명의 종목
정보, 관심종목, 포트폴리오 추적, 초보자를 위한 투자 교육 콘텐츠 등).

풀스택 개발 역량을 검증하기 위해 처음부터 직접 설계·구현한 개인 포트폴리오
프로젝트입니다. 회원가입부터 핵심 기능까지 프론트엔드/백엔드 전 구간을
혼자 개발했으며, "토이 프로젝트" 수준을 벗어나기 위해 필요한 설계
요소들(자동 스키마 동기화 대신 마이그레이션 사용, 환경변수 검증,
CORS/보안 헤더, 헬스체크 등)을 직접 반영했습니다.

## 기술 스택

|            | 선택                                              |
| ---------- | ------------------------------------------------- |
| 언어        | TypeScript                                         |
| 웹          | Next.js (App Router), Tailwind CSS                 |
| 클라이언트 상태 | Zustand                                          |
| 서버 상태     | TanStack Query (React Query)                       |
| 에디터       | Tiptap                                             |
| 백엔드       | NestJS                                             |
| ORM        | TypeORM                                            |
| 데이터베이스   | PostgreSQL                                         |
| 세션 저장소   | Redis                                              |
| 인프라       | AWS                                                |

## 진행 상황

**완료**
- 회원가입 / 로그인 / 로그아웃 (세션 + Redis)
- 주식 용어 사전 CRUD (개인별)
- 매매일지 CRUD (Tiptap 리치 텍스트 에디터, 서버 측 XSS 방어)
- 메인 대시보드 (랜덤 복습 카드 + 복기 필요 매매일지 위젯)

프론트엔드 화면만으로 회원가입 → 로그인 → 대시보드 → 용어/매매일지
관리까지 전 과정이 이어집니다 (더 이상 Swagger가 없어도 됩니다).

**예정**
- 관심종목, 포트폴리오 트래킹
- AWS 배포

기능별 API 명세와 설계 근거는 [`docs/FEATURES.md`](./docs/FEATURES.md)를
참고하세요.

## 개발 방식

### 프론트엔드

- **상태 관리 이원화**: 클라이언트 UI 상태는 Zustand, 서버 데이터는
  TanStack Query로 명확히 분리해 관리
- **기능 단위(feature-folder) 구조**: `auth`/`dashboard`/`terms`/`journal`
  등 도메인별로 API·훅·컴포넌트를 응집해 배치하고, 재사용 로직(인증 가드
  훅 등)은 2번째 사용처가 생기는 시점에 추출
- **세션 기반 인증 연동**: httpOnly 쿠키 기반 백엔드 세션에 맞춰 fetch
  래퍼에 자격 증명을 포함시키고, 인증 상태는 서버 응답으로만 판단
- **리치 텍스트 에디터 연동**: Tiptap 기반 에디터로 매매일지(매매근거/
  복기) 작성 기능을 구현 — 저장된 콘텐츠는 서버가 sanitize한 결과를
  신뢰해 렌더링
- **실브라우저 검증 필수화**: 빌드/타입체크 통과만으로 완료 처리하지
  않고 Playwright로 실제 로그인 → 기능 동작 → 에러 케이스까지 확인 —
  이 과정에서 정적 검사로는 잡히지 않는 런타임 버그를 다수 발견하고 수정

### 백엔드

- **모듈형 아키텍처**: NestJS 모듈을 도메인별(`auth`/`users`/`terms`/
  `trade-journals`)로 분리하고, 모듈 간 의존은 단방향으로 제한
- **인증 방식 전환 경험**: 초기 JWT로 구현 후, 즉시 무효화 가능성과
  클라이언트 정보 노출 최소화를 위해 세션(Redis) 방식으로 재설계
- **보안 설계**: 응답은 화이트리스트 DTO로만 직렬화(민감 필드 누출 원천
  차단), 비밀번호는 bcrypt 해시, 전역 예외 필터로 클라이언트 노출
  메시지와 서버 로그를 분리
- **입력 데이터 방어**: 리치 텍스트(HTML) 콘텐츠는 클라이언트(에디터)를
  신뢰하지 않고 서버에서 sanitize-html로 허용 태그만 남기고 저장 — API를
  직접 호출해도 안전
- **데이터 정합성**: TypeORM 마이그레이션 기반 스키마 관리(자동 동기화
  미사용), DB 유니크 제약 + 서비스 레벨 중복 검사 이중 방어
- **품질 관리 자동화**: Strict TypeScript(`any` 금지), Vitest 유닛
  테스트, Husky pre-commit으로 포맷/린트 강제, Swagger 자동 문서화

## 저장소 구조

```
antnote-web/       # Next.js 클라이언트      → antnote-web/README.md
antnote-backend/    # NestJS API 서버        → antnote-backend/README.md
docs/                # 아키텍처 문서
```

## 시작하기

각 앱에는 별도의 설치/실행 가이드가 있습니다.

- [`antnote-backend/README.md`](./antnote-backend/README.md) — API 서버, Docker 기반 PostgreSQL, 마이그레이션
- [`antnote-web/README.md`](./antnote-web/README.md) — Next.js 클라이언트

빠른 실행 순서 (백엔드 먼저, 그다음 웹):

```bash
# 1. 백엔드
cd antnote-backend
cp .env.example .env
docker compose up -d
pnpm install && pnpm migration:run && pnpm start:dev   # http://localhost:3000

# 2. 웹 (새 터미널에서)
cd antnote-web
cp .env.local.example .env.local
pnpm install && pnpm dev                                 # http://localhost:3001
```

## 문서

- [코드 철학 및 품질 관리](./docs/CODE_PHILOSOPHY.md)
- [아키텍처](./docs/ARCHITECTURE.md)
- [기능 구현 가이드](./docs/FEATURES.md)
