# antnote

주식 투자를 처음 시작하는 초보자를 위한 서비스입니다. 사용자가 무엇을 사는지
제대로 이해하고 투자할 수 있도록 돕는 것을 목표로 합니다 (쉬운 설명의 종목
정보, 관심종목, 포트폴리오 추적, 초보자를 위한 투자 교육 콘텐츠 등).

> **진행 상태:** 초기 세팅에 이어 첫 기능(회원가입)까지 구현했습니다.
> 백엔드/프론트엔드 뼈대가 서로 연동되어 동작하며(DB 연결, API, 클라이언트
> 상태 관리, 서버 데이터 패칭까지 확인 완료), 이후 실제 기능 화면을 하나씩
> 추가해 나갈 예정입니다.
>
> **구현된 기능:** 회원가입 — 자세한 내용은 [`docs/FEATURES.md`](./docs/FEATURES.md) 참고

## 프로젝트 소개

풀스택 TypeScript 역량을 보여주기 위한 포트폴리오 프로젝트입니다. 실제
관계형 스키마를 가진 타입 기반 API, 최신 React 데이터 레이어 구성, 그리고
"토이 프로젝트" 수준을 벗어나기 위해 필요한 설계 요소들(자동 스키마 동기화
대신 마이그레이션 사용, 환경변수 검증, CORS/보안 헤더, 헬스체크 등)을
직접 반영했습니다.

## 기술 스택

|            | 선택                                              |
| ---------- | ------------------------------------------------- |
| 언어        | TypeScript                                         |
| 웹          | Next.js (App Router), Tailwind CSS                 |
| 클라이언트 상태 | Zustand                                          |
| 서버 상태     | TanStack Query (React Query)                       |
| 백엔드       | NestJS                                             |
| ORM        | TypeORM                                            |
| 데이터베이스   | PostgreSQL                                         |
| 인프라       | AWS                                                |

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

- [아키텍처](./docs/ARCHITECTURE.md)
- [기능 구현 가이드](./docs/FEATURES.md)
