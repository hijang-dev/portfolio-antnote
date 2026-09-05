# antnote-backend

주식 투자 초보자를 위한 서비스 **antnote**의 API 서버입니다. NestJS, TypeORM,
PostgreSQL, Redis(세션)로 구성했습니다.

> 기본 세팅에 이어 회원가입/로그인 기능까지 구현했습니다. 나머지 기능
> 모듈(stocks, watchlist, portfolio 등)은 `src/modules/` 아래에 하나씩
> 추가될 예정입니다. API 명세와 설계 근거는
> [`../docs/FEATURES.md`](../docs/FEATURES.md)를 참고하세요.

## 기술 스택

| 영역          | 선택                                  |
| ------------- | -------------------------------------- |
| 언어          | TypeScript                             |
| 프레임워크     | NestJS                                 |
| ORM           | TypeORM                                |
| 데이터베이스   | PostgreSQL                             |
| 유효성 검증    | class-validator / class-transformer    |
| 비밀번호 해싱  | bcrypt                                  |
| 인증          | 세션 (`express-session` + Redis, `connect-redis`) |
| API 문서화     | Swagger (OpenAPI) — `@nestjs/swagger`  |
| 테스트         | Vitest                                  |

## 프로젝트 구조

```
src/
  main.ts                 # 부트스트랩: helmet, CORS, 유효성 검증, Swagger
  app.module.ts            # 루트 모듈 연결
  config/                  # 환경변수 로딩 & 검증
  database/
    data-source.ts         # TypeORM CLI가 사용하는 DataSource
    database.module.ts     # TypeOrmModule.forRootAsync 설정
    migrations/            # 생성된 마이그레이션 파일
  health/                  # GET /health — DB 연결 확인용
  common/
    filters/                # 전역 예외 필터
    guards/                  # 세션 인증 가드 (재사용 가능)
    session/                 # Redis 세션 스토어 설정 (express-session)
    types/                   # express-session 타입 확장
  modules/
    auth/                    # 회원가입, 로그인/로그아웃, /auth/me (구현됨)
    users/                   # 사용자 조회/생성 (구현됨)
                              # 나머지 기능 모듈은 점진적으로 추가 예정
```

## 시작하기

**사전 준비:** Node 22+, pnpm, Docker (로컬 PostgreSQL/Redis 실행용)

```bash
cp .env.example .env        # DB/Redis 접속 정보 입력
docker compose up -d         # 로컬 PostgreSQL + Redis 실행
pnpm install
pnpm migration:run            # 스키마 마이그레이션 적용
pnpm start:dev
```

API는 `http://localhost:3000`에서 실행됩니다.

- Swagger 문서: `http://localhost:3000/api/docs`
- 헬스체크: `http://localhost:3000/health`

## 데이터베이스 마이그레이션

스키마 변경은 오직 TypeORM 마이그레이션으로만 관리합니다 — 로컬 개발
환경을 포함한 모든 환경에서 `synchronize`가 비활성화되어 있습니다.

```bash
# 엔티티를 추가/수정한 뒤
pnpm migration:generate src/database/migrations/<변경내용을설명하는이름>

pnpm migration:run
pnpm migration:revert
```

## 스크립트

| 명령                      | 설명                              |
| ------------------------ | ---------------------------------- |
| `pnpm start:dev`         | 핫 리로드로 개발 서버 실행           |
| `pnpm build`              | `dist/`로 컴파일                    |
| `pnpm start:prod`         | 컴파일된 빌드 실행                   |
| `pnpm test` / `test:e2e`  | 유닛 / e2e 테스트 (Vitest)          |
| `pnpm lint`               | oxlint로 린트 검사                  |
| `pnpm migration:*`        | 마이그레이션 생성 / 실행 / 되돌리기   |

## 환경 변수

[`.env.example`](./.env.example) 참고. 필수 환경변수가 누락되면 부팅 시
바로 명확한 에러 메시지와 함께 실패합니다 (`src/config/env.validation.ts`).

## 참고 문서

- [NestJS 공식 문서](https://docs.nestjs.com)
- [TypeORM 공식 문서](https://typeorm.io)
- [NestJS + TypeORM 연동 가이드](https://docs.nestjs.com/recipes/sql-typeorm)
