# 이 저장소에서 작업할 때 지켜야 할 원칙

이 프로젝트는 구직용 포트폴리오입니다. 아래 네 가지는 이력서/면접에서 실제로
설명하는 코드 철학이며, 코드가 이 원칙과 어긋나면 안 됩니다. 이 파일과 짝을
이루는 사람이 읽는 설명은 [`docs/CODE_PHILOSOPHY.md`](./docs/CODE_PHILOSOPHY.md)에
있습니다 — 원칙이 바뀌면 두 문서를 함께 갱신하세요.

## 1. 확장성 높은 모듈화 설계

- 백엔드(NestJS): 기능은 `src/modules/<domain>/`에 독립 모듈로 만든다
  (module/controller/service/entities/dto). 모듈 간 의존은 한 방향으로만
  (예: `auth` → `users`, 반대 방향 금지). 다른 모듈의 내부 구현이 아니라
  `exports`에 명시된 서비스만 참조한다.
- 프론트엔드(Next.js): 컴포넌트에 데이터 패칭/상태 로직을 직접 넣지 않는다.
  TanStack Query 호출은 `src/lib/api/hooks/` 또는 `<feature>/hooks/`의
  커스텀 훅으로 분리하고, 컴포넌트는 훅이 반환한 값을 그리는 역할만 한다.
- 새 기능을 추가할 때 기존 모듈/컴포넌트를 수정해야 한다면, 그 변경이
  최소한인지(신규 모듈 추가로 해결 가능한지) 먼저 확인한다.

## 2. Strict Type, `any` 금지

- 두 프로젝트 모두 `tsconfig.json`의 `strict: true`를 예외 없이 유지한다.
  하위 플래그(`strictPropertyInitialization` 등)를 개별적으로 끄지 않는다
  — TypeORM 엔티티나 DTO처럼 런타임에 값이 채워지는 클래스 필드는 `!`
  (definite assignment assertion)로 표시한다.
- `any`를 사용하지 않는다. 백엔드는 `oxlint.json`에서
  `@typescript-eslint/no-explicit-any: "error"`로 강제한다. 타입을 모르는
  값은 `unknown`으로 받고 좁혀서 사용한다.
- 외부 라이브러리 타입이 불완전해 어쩔 수 없이 단언이 필요하면, 왜
  안전한지 한 줄 주석으로 남긴다.

## 3. 명확한 예외 처리 및 로깅

- 백엔드는 전역 필터(`src/common/filters/http-exception.filter.ts`)를
  거치지 않는 예외 처리를 새로 만들지 않는다. 클라이언트에는 안전한
  메시지/상태 코드만 내려주고, 500번대 에러의 스택 트레이스는
  `Logger`로 서버 측에만 남긴다 — 내부 구현 세부사항을 응답 본문에
  절대 포함하지 않는다.
- 기대되는 실패(중복 아이디, 검증 실패 등)는 적절한 `HttpException`
  서브클래스(`ConflictException`, `BadRequestException` 등)로 던진다.
  일반 `Error`를 던지고 컨트롤러에서 그때그때 처리하지 않는다.
- 사용자에게 보여줄 에러 메시지는 한국어로, 서버 로그/주석은 영어로
  작성한다 (이 저장소의 기존 관례).

## 4. 일관된 컨벤션 자동화

- 커밋 전 `.husky/pre-commit`이 변경된 프로젝트의 `pnpm format`(Prettier)과
  `pnpm lint`를 자동 실행한다. 린트/포맷 문제를 사람이 리뷰에서 지적하게
  만들지 않는다 — 실패하면 코드를 고쳐서 통과시킨다, 훅을 우회
  (`--no-verify`)하지 않는다.
- 새 파일은 기존 프로젝트의 포맷 설정(`.prettierrc`)과 네이밍 컨벤션을
  따른다. 백엔드/프론트엔드 각각의 기존 파일 구조를 먼저 확인하고
  맞춘다.

## 작업 후 항상 확인

새 코드를 작성했으면 커밋 전에 반드시 아래를 직접 실행해 통과를 확인한다
(훅이 있어도, 훅이 걸리기 전에 먼저 확인하는 것이 원칙이다):

```bash
# 변경한 프로젝트에서
pnpm build && pnpm lint && pnpm test
```

기능이 실제로 동작하는지(로컬 DB 연결, API 응답 등)까지 확인한 뒤에만
완료로 보고한다 — 컴파일이 된다고 완료된 것이 아니다.
