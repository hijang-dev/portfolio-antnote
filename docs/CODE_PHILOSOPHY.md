# 코드 철학 및 품질 관리

> 확장성 높은 모듈화 설계와 Strict Type을 기본으로 작성하며, 명확한 예외
> 처리와 일관된 코드 컨벤션을 통해 팀 전체의 생산성과 서비스 안정성을
> 최우선으로 확보하고자 노력합니다.

"혼자 잘 만드는 코드가 아니라, 팀 전체가 오랫동안 안전하게 유지보수할 수
있는 구조"를 만드는 것을 목표로 합니다. 아래 네 가지 축으로 실천하고
있으며, 각 항목에는 이 저장소에서 실제로 확인할 수 있는 근거를 함께
남겼습니다. (AI 코딩 어시스턴트로 작업할 때도 이 원칙을 그대로 따르도록
[`CLAUDE.md`](../CLAUDE.md)에 운영 지침으로 등록해 두었습니다.)

## 1. 확장성 높은 모듈화 설계

백엔드(NestJS)에서는 모듈 간 의존성을 최소화하고 도메인 단위로 계층을
명확히 분리하여, 기능 추가나 사양 변경 시 기존 코드에 미치는 영향을
최소화합니다. 프론트엔드에서도 UI 컴포넌트와 비즈니스 로직(Custom Hooks)을
분리해 재사용성을 높입니다.

- 기능마다 독립된 모듈 (`module` / `controller` / `service` / `entities` / `dto`)로
  구성하고, 의존은 한 방향으로만 흐릅니다 — 예: `auth` 모듈이 `users`
  모듈을 참조하지만 그 반대는 없습니다.
  ([`src/modules/auth`](../antnote-backend/src/modules/auth),
  [`src/modules/users`](../antnote-backend/src/modules/users))
- 프론트엔드는 데이터 패칭 로직(TanStack Query 훅)과 화면(컴포넌트)을
  분리합니다. `SetupStatus` 컴포넌트는 렌더링만 담당하고, 실제 쿼리
  로직은 `useHealthQuery` 커스텀 훅에 있습니다.
  ([`useHealthQuery.ts`](../antnote-web/src/lib/api/hooks/useHealthQuery.ts),
  [`SetupStatus.tsx`](../antnote-web/src/components/SetupStatus.tsx))

## 2. Strict Type 기반의 안정성 확보

TypeScript의 `strict: true` 옵션을 기본으로 두고, `any` 타입 사용을
지양합니다. Compile time에 가능한 많은 에러를 잡는 것이 runtime 에러를
줄이는 가장 비용 효율적인 방법이라 생각하기 때문입니다.

- 백엔드/프론트엔드 모두 `tsconfig.json`에 `strict: true`를 예외 없이
  적용합니다. 하위 플래그를 개별적으로 끄지 않고, TypeORM 엔티티처럼
  런타임에 값이 채워지는 필드는 definite assignment assertion(`!`)으로
  명시합니다.
  ([`user.entity.ts`](../antnote-backend/src/modules/users/entities/user.entity.ts))
- `any` 사용은 린트 레벨에서 강제로 차단합니다
  (`@typescript-eslint/no-explicit-any: "error"` in
  [`oxlint.json`](../antnote-backend/oxlint.json)).

## 3. 명확한 예외 처리 및 로깅

단순히 에러를 catch하는 데 그치지 않고, 클라이언트에게 전달할 에러
메시지/상태 코드와 내부 모니터링용 상세 로그를 분리하여 작성합니다. 이를
통해 디버깅 시간을 단축하고 서비스 신뢰도를 제고합니다.

- 전역 예외 필터가 모든 예외를 일관된 JSON 형태(`statusCode`, `path`,
  `timestamp`, `message`)로 변환합니다. 500번대 에러만 스택 트레이스를
  서버 로그에 남기고, 클라이언트에는 내부 구현이 드러나지 않는 메시지만
  내려줍니다.
  ([`http-exception.filter.ts`](../antnote-backend/src/common/filters/http-exception.filter.ts))
- 회원가입처럼 예상 가능한 실패(중복 아이디 등)는 `ConflictException`,
  `BadRequestException` 같은 명확한 예외 타입으로 던져 상태 코드와
  메시지가 항상 일관되게 나갑니다.
  ([`auth.service.ts`](../antnote-backend/src/modules/auth/auth.service.ts))

## 4. 일관된 컨벤션을 통한 팀 생산성 향상

ESLint, Prettier, Git Hooks(Husky) 등을 통해 팀 차원의 스타일을
자동화하고, PR 리뷰에서는 로직의 타당성에 집중할 수 있는 환경을
구축하려 노력합니다.

- 백엔드는 oxlint(ESLint 규칙과 호환되는 Rust 기반 린터) + Prettier,
  프론트엔드는 ESLint + Prettier로 스타일을 통일합니다. 두 프로젝트 모두
  같은 Prettier 규칙(`singleQuote`, `trailingComma`)을 씁니다.
- 커밋 전 Husky pre-commit 훅이 변경된 프로젝트의 포맷/린트를 자동으로
  실행하고 통과하지 못하면 커밋을 막습니다. 스타일 문제는 코드 리뷰
  단계까지 올라오지 않습니다.
  ([`.husky/pre-commit`](../.husky/pre-commit))

## 이 문서를 최신 상태로 유지하는 법

새 기능을 구현할 때 위 네 가지 기준으로 스스로 점검하고, 기준에서 벗어난
부분이 있으면 (a) 코드를 원칙에 맞게 고치거나 (b) 원칙이 더 이상 맞지
않는다면 이 문서와 `CLAUDE.md`를 함께 갱신합니다. 구현 기능별 상세 내용은
[`docs/FEATURES.md`](./FEATURES.md)에서 확인할 수 있습니다.
