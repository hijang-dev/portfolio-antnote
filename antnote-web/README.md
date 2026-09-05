# antnote-web

주식 투자 초보자를 위한 서비스 **antnote**의 웹 클라이언트입니다. Next.js
(App Router), Zustand, TanStack Query로 구성했습니다.

> 아직 초기 세팅 단계입니다 — 이 문서는 프로젝트 뼈대(스켈레톤)를
> 설명합니다. 기능 화면(auth, stocks, watchlist, portfolio 등)은
> `src/features/` 아래에 하나씩 추가될 예정입니다.

## 기술 스택

| 구분              | 선택                              |
| ----------------- | ---------------------------------- |
| 언어              | TypeScript                          |
| 프레임워크         | Next.js (App Router)                 |
| 스타일링           | Tailwind CSS                          |
| 클라이언트/UI 상태  | Zustand                              |
| 서버 데이터/비동기 상태 | TanStack Query (React Query)      |

## 프로젝트 구조

```
src/
  app/
    layout.tsx        # 루트 레이아웃, Providers로 감싸기
    providers.tsx      # QueryClientProvider 설정
    page.tsx            # 홈 페이지
  components/           # 여러 기능에서 공통으로 쓰는 UI 컴포넌트
  features/              # 기능 모듈 (점진적으로 추가 예정)
  lib/
    api/
      client.ts          # fetch 래퍼 (base URL, 에러 형식)
      health.ts           # 예시 쿼리 함수
    query/
      get-query-client.ts # SSR에 안전한 QueryClient 생성 함수
  store/
    useUiStore.ts         # Zustand 스토어 예시
```

## 시작하기

**사전 준비:** Node 22+, pnpm, 그리고 로컬에서 실행 중인 `antnote-backend`

```bash
cp .env.local.example .env.local
pnpm install
pnpm dev
```

`http://localhost:3001`에서 실행됩니다 (3000번 포트는 백엔드용으로
비워둡니다). 홈 화면에서 TanStack Query로 백엔드의 `/health`를 호출하고
Zustand 스토어 값을 토글해 보면서, 전체 세팅이 제대로 연결되어 있는지
확인할 수 있습니다.

## 상태 관리 원칙

- **Zustand** — 클라이언트 전용 UI 상태(모달, 토글, 위저드 단계, 임시
  입력값 등)에 사용합니다. 스토어는 `src/store/`(공통) 또는
  `<feature>/store/`(기능별)에 위치합니다.
- **TanStack Query** — API에서 오는 모든 데이터(종목 정보, 사용자
  포트폴리오, 인증 세션 등)에 사용합니다. 쿼리/뮤테이션 훅은 해당 기능
  폴더 안에 두고, `src/lib/api/`의 함수를 통해 API를 호출합니다.

## 스크립트

| 명령          | 설명                          |
| ------------- | ------------------------------ |
| `pnpm dev`    | 3001번 포트로 개발 서버 실행    |
| `pnpm build`  | 프로덕션 빌드                   |
| `pnpm start`  | 프로덕션 빌드 실행               |
| `pnpm lint`   | ESLint로 린트 검사               |

## 참고 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [TanStack Query — Next.js SSR 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [Zustand 공식 문서](https://zustand.docs.pmnd.rs)
