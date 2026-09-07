# 기능 구현 가이드

기능을 구현할 때마다 이 문서에 섹션을 하나씩 추가합니다. API 명세와 함께
"왜 이렇게 만들었는지" 설계 근거를 남겨서, 코드만 봐서는 드러나지 않는
의도까지 함께 확인할 수 있도록 하는 것이 목적입니다.

---

## 회원가입 (Sign Up)

`POST /auth/signup` — 아이디/비밀번호/닉네임으로 계정을 생성합니다.

### 요청

```json
{
  "username": "antnote_user",
  "password": "antnote1234",
  "nickname": "앤트노트"
}
```

| 필드      | 규칙                                             |
| --------- | ------------------------------------------------- |
| username  | 4~20자, 영문/숫자/밑줄(`_`)만 허용, 중복 불가         |
| password  | 8~64자, 영문+숫자 조합 필수                          |
| nickname  | 2~20자                                             |

### 응답

**201 Created**

```json
{
  "id": "34936705-ee12-4dea-a714-c29c47d769aa",
  "username": "antnote_user",
  "nickname": "앤트노트",
  "createdAt": "2026-09-05T01:05:09.475Z",
  "updatedAt": "2026-09-05T01:05:09.475Z"
}
```

응답에 `password`는 어떤 경우에도 포함되지 않습니다 (아래 "구현 포인트" 참고).

| 상태 코드 | 상황                          |
| --------- | ------------------------------ |
| 201       | 회원가입 성공                   |
| 400       | 입력값 검증 실패 (필드별 메시지 배열로 응답) |
| 409       | 이미 사용 중인 아이디            |

### users 테이블

| 컬럼        | 타입          | 설명                              |
| ----------- | ------------- | ---------------------------------- |
| id          | uuid (PK)     | 추측 불가능한 식별자를 위해 UUID 사용 |
| username    | varchar(30)   | 로그인 아이디, unique 제약           |
| password    | varchar(60)   | bcrypt 해시 값 (평문 저장 안 함)      |
| nickname    | varchar(30)   | 화면에 노출되는 이름                 |
| created_at  | timestamp     | 가입 시각                           |
| updated_at  | timestamp     | 마지막 수정 시각                     |

마이그레이션: [`1788570255740-CreateUsersTable.ts`](../antnote-backend/src/database/migrations/1788570255740-CreateUsersTable.ts)

### 구현 흐름

```
POST /auth/signup
  → ValidationPipe로 SignUpDto 형식 검증 (실패 시 400)
  → AuthService.signUp
      1. UsersService.findByUsername로 중복 아이디 확인 (있으면 409)
      2. bcrypt로 비밀번호 해싱 (평문 비밀번호는 저장하지 않음)
      3. UsersService.create로 users 테이블에 저장
      4. UserResponseDto로 변환해 반환 (password 필드 자체가 없음)
```

### 구현 포인트

| 포인트                                  | 설명 |
| ---------------------------------------- | ---- |
| 비밀번호 해싱 (bcrypt, cost factor 10)     | 평문 비밀번호는 메모리에서도 최소한만 유지되고, DB에는 해시만 저장됩니다. |
| 응답은 화이트리스트 DTO로만 구성            | `UserResponseDto`에 `@Expose()`로 명시한 필드만 응답에 포함됩니다. 나중에 엔티티에 민감한 컬럼(예: 리프레시 토큰)이 추가되어도, DTO에 추가하기 전까지는 절대 응답에 노출되지 않습니다. |
| 아이디 중복은 사전 확인 + DB unique 제약 이중 방어 | 서비스 로직에서 먼저 확인해 사용자에게 명확한 409 에러를 주고, DB의 `UNIQUE` 제약은 최후 방어선으로 남겨둡니다. |
| id는 UUID                                | 순차 증가하는 정수 PK와 달리 다른 사용자의 id를 추측해 순회 조회하는 것을 방지합니다. |
| DTO 유효성 검증은 `class-validator`로 선언적으로 작성 | 아이디 형식, 비밀번호 강도, 닉네임 길이 등 규칙이 DTO 파일 한 곳에 모여 있어 한눈에 파악할 수 있습니다. |

### 관련 파일

```
src/modules/auth/
  auth.module.ts
  auth.controller.ts        # POST /auth/signup
  auth.service.ts            # 중복 체크, 해싱, 저장, 응답 변환
  auth.service.spec.ts        # 유닛 테스트 (성공 / 중복 아이디 거부)
  dto/sign-up.dto.ts

src/modules/users/
  users.module.ts
  users.service.ts            # findByUsername, create
  entities/user.entity.ts
  dto/user-response.dto.ts    # 응답 화이트리스트

src/database/migrations/
  1788570255740-CreateUsersTable.ts
```

### 다음 단계 (미구현)

- ~~로그인 (`POST /auth/login`)~~ → 아래 "로그인 (세션)" 섹션에서 구현

---

## 로그인 (세션 기반 인증)

`POST /auth/login` — 아이디/비밀번호로 인증하고, 인증 상태를 **서버 측
세션**으로 관리합니다. 세션 데이터는 Redis에 저장되고, 브라우저에는
서명된 세션 ID만 `httpOnly` 쿠키로 내려갑니다.

> 처음엔 JWT(access token)로 구현했다가 세션 방식으로 전환했습니다. 이유는
> 아래 "왜 JWT 대신 세션인가" 참고.

### 요청

```json
{
  "username": "antnote_user",
  "password": "antnote1234"
}
```

### 응답

**200 OK** — 응답 본문은 회원가입과 동일한 `UserResponseDto`이고, 토큰은
없습니다. 대신 `Set-Cookie: antnote.sid=...`가 응답 헤더에 실려 옵니다.

```json
{
  "id": "34936705-ee12-4dea-a714-c29c47d769aa",
  "username": "antnote_user",
  "nickname": "앤트노트",
  "createdAt": "2026-09-05T01:05:09.475Z",
  "updatedAt": "2026-09-05T01:05:09.475Z"
}
```

| 상태 코드 | 상황                                   |
| --------- | ---------------------------------------- |
| 200       | 로그인 성공 (세션 생성)                    |
| 400       | 입력값 검증 실패 (아이디/비밀번호 누락)     |
| 401       | 아이디 또는 비밀번호 불일치                |

### 로그아웃 — `POST /auth/logout`

세션을 Redis에서 즉시 삭제하고 쿠키를 지웁니다. 로그인 상태가 아니어도
(세션이 없어도) 그냥 200을 반환합니다 — 이미 로그아웃된 상태를 다시
로그아웃하는 건 에러가 아니라 자연스러운 성공입니다.

```json
{ "message": "로그아웃되었습니다." }
```

### 인증이 필요한 엔드포인트 예시: `GET /auth/me`

로그인 세션 쿠키로 내 정보를 조회하는 엔드포인트입니다. 세션이 실제로
유효한지 확인하는 용도이자, 앞으로 인증이 필요한 다른 기능(관심종목,
포트폴리오 등)이 따라야 할 보호 패턴의 예시입니다.

```bash
# -c/-b로 쿠키를 저장·재사용 (브라우저의 자동 쿠키 전송을 흉내)
curl -c cookies.txt -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"username":"antnote_user","password":"antnote1234"}'
curl -b cookies.txt http://localhost:3000/auth/me
```

| 상태 코드 | 상황                                       |
| --------- | -------------------------------------------- |
| 200       | 세션의 사용자 정보 반환                        |
| 401       | 세션 쿠키 없음 / 세션이 존재하지 않거나 만료됨   |

### 구현 흐름

```
POST /auth/login
  → ValidationPipe로 LoginDto 검증 (실패 시 400)
  → AuthService.login
      1. UsersService.findByUsername로 사용자 조회
      2. bcrypt.compare로 비밀번호 확인
         (아이디 없음 / 비밀번호 불일치 모두 동일한 401 메시지)
      3. 검증된 User 엔티티 반환 (토큰 발급 없음)
  → AuthController.login
      4. session.userId = user.id  (express-session이 Redis에 저장 + Set-Cookie)
      5. UserResponseDto로 변환해 반환

POST /auth/logout
  → session.destroy() → Redis에서 세션 키 삭제, 쿠키도 clearCookie

GET /auth/me  (@UseGuards(AuthGuard) 적용)
  → AuthGuard.canActivate
      1. request.session.userId 존재 확인 (없으면 401)
  → AuthController.me → AuthService.getCurrentUser(session.userId)
      → UsersService.findById → UserResponseDto로 변환해 반환
```

### 왜 JWT 대신 세션인가

| 항목                     | JWT (이전)                                   | 세션 + Redis (현재)                          |
| ------------------------ | ---------------------------------------------- | ----------------------------------------------- |
| 즉시 무효화               | 불가능 (만료 전까진 탈취돼도 계속 유효)          | `session.destroy()` 한 번으로 즉시 무효화 가능 (로그아웃, 강제 로그아웃 모두) |
| 브라우저에 노출되는 정보   | 페이로드(`sub`, `username`)가 base64로 그대로 노출 | 세션 ID만 노출, 실제 데이터는 서버(Redis)에만 존재 |
| XSS 내성                  | 저장 위치에 따라 다름                            | `httpOnly` 쿠키라 JS에서 아예 읽을 수 없음        |
| 인프라                    | 없음 (stateless)                                | Redis 필요 (stateful) — 대신 세션 스토어는 여러 API 인스턴스가 공유해도 되므로 수평 확장에는 지장 없음 |

포트폴리오 범위에서 흔치 않은 트레이드오프까지 이해하고 있다는 걸 보여주기
위해 일부러 세션 방식으로 구현했습니다: JWT는 구현이 더 간단하지만
"로그아웃해도 토큰 자체는 만료 전까지 유효하다"는 점이 보안 요구가 있는
서비스(특히 금융 도메인)에서는 부담이 될 수 있습니다.

### 구현 포인트

| 포인트                                       | 설명 |
| ---------------------------------------------- | ---- |
| 아이디 없음/비밀번호 틀림을 같은 에러로 응답       | 둘을 구분해서 응답하면 공격자가 어떤 아이디가 실제로 존재하는지 순차적으로 알아낼 수 있습니다(사용자 열거 공격). |
| 세션 저장소로 Redis 사용                        | 서버 프로세스가 재시작/스케일 아웃돼도 로그인 상태가 유지됩니다 (in-memory 세션 스토어의 근본적 한계를 피함). `docker-compose.yml`에 `redis` 서비스로 로컬 실행 환경을 함께 제공합니다. |
| 쿠키 옵션: `httpOnly`, `sameSite: 'lax'`, 운영환경에서만 `secure` | XSS로 세션 쿠키를 훔쳐가는 것을 막고(`httpOnly`), 로컬 개발(HTTP)은 그대로 동작하면서 운영(HTTPS)에서는 `secure`가 강제되도록 환경별로 분기합니다. |
| 인증 가드는 전역이 아니라 라우트별 적용            | 현재는 `signup`/`login`/`health`/`/`처럼 공개 라우트가 대부분이라, 전역 가드 + `@Public()` 예외 처리보다 보호가 필요한 라우트에만 `@UseGuards(AuthGuard)`를 붙이는 쪽이 더 명확합니다. 보호 대상이 많아지면 전역 가드 방식으로 전환을 고려합니다. |
| `AuthGuard`는 `src/common/guards/`에 위치        | 인증은 특정 도메인 모듈의 로직이 아니라 앱 전체에서 재사용되는 관심사이므로, 전역 예외 필터와 같은 위치(`common/`)에 둡니다. |
| express-session 타입은 declaration merging으로 확장 | `SessionData`에 `any`를 쓰지 않고 `userId?: string` 필드를 명시적으로 선언해(`src/common/types/express-session.d.ts`) 타입 안정성을 유지합니다. |

### 관련 파일

```
src/modules/auth/
  auth.controller.ts          # POST /auth/login, POST /auth/logout, GET /auth/me
  auth.service.ts               # validateCredentials, login, getCurrentUser
  auth.service.spec.ts           # 유닛 테스트 (로그인 성공/실패, me 성공/실패)
  dto/login.dto.ts

src/modules/users/
  users.service.ts               # findById 추가

src/common/guards/
  auth.guard.ts                   # 세션 검증 가드 (재사용 가능)
  auth.guard.spec.ts               # 유닛 테스트

src/common/session/
  create-session-middleware.ts     # Redis client + connect-redis + express-session 설정

src/common/types/
  express-session.d.ts              # SessionData.userId 타입 확장
```

### 다음 단계 (미구현)

- ~~인증 가드를 사용하는 실제 기능~~ → 아래 "주식 용어 사전" 섹션에서 구현
- 동시 로그인 세션 목록 조회/개별 로그아웃 ("다른 기기에서 로그아웃")

---

## 주식 용어 사전 (Terms)

로그인한 사용자가 낯선 투자 용어를 직접 입력·저장해두고 나중에 다시 찾아볼
수 있는 개인 용어장입니다. 로그인 이후 인증 가드를 실제 기능에 적용한
첫 사례이기도 합니다.

모든 엔드포인트는 로그인이 필요하며(`@UseGuards(AuthGuard)`), 각 사용자는
자기 자신이 등록한 용어만 조회·수정·삭제할 수 있습니다.

### API 요약

| 메서드   | 경로           | 설명                     |
| -------- | -------------- | -------------------------- |
| `POST`   | `/terms`         | 용어 등록                        |
| `GET`    | `/terms`         | 내 용어 목록 (최신순)             |
| `GET`    | `/terms/random`  | 랜덤 용어 카드 (대시보드용)         |
| `GET`    | `/terms/:id`     | 용어 상세 조회                    |
| `PATCH`  | `/terms/:id`     | 용어 수정 (부분 업데이트)           |
| `DELETE` | `/terms/:id`     | 용어 삭제                         |

> `random`이 `:id`보다 라우트 등록 순서상 먼저 와야 합니다 — 그렇지 않으면
> `GET /terms/random`이 `GET /terms/:id`에 `id="random"`으로 매칭되어
> 버려집니다. `TermsController`에서 `findRandom` 메서드를 `findOne`보다
> 앞에 선언해 둔 이유입니다.

### 요청/응답 예시

**`POST /terms`**

```json
// 요청
{
  "term": "PER",
  "definition": "주가를 주당순이익으로 나눈 값. 낮을수록 저평가된 것으로 볼 수 있다."
}
```

```json
// 201 응답 — 회원가입/로그인과 같은 방식으로 소유자(userId)는 응답에서 제외
{
  "id": "801b61c7-31fa-49da-a85d-356bd809979c",
  "term": "PER",
  "definition": "주가를 주당순이익으로 나눈 값. 낮을수록 저평가된 것으로 볼 수 있다.",
  "createdAt": "2026-09-07T05:21:01.425Z",
  "updatedAt": "2026-09-07T05:21:01.425Z"
}
```

| 필드         | 규칙                          |
| ------------ | ------------------------------ |
| term         | 1~50자, 같은 사용자 내에서 중복 불가 |
| definition   | 1~1000자                       |

`PATCH /terms/:id`는 `term`, `definition` 둘 다 선택 항목(부분 업데이트)이고,
나머지 응답 형태는 동일합니다.

**`GET /terms/random?limit=10`**

`limit`은 선택값(기본 10, 1~50)이며, 응답은 `TermResponseDto` 배열입니다.
호출할 때마다 무작위로 다시 뽑히고, 등록된 용어가 `limit`보다 적으면 있는
만큼만 반환합니다 (0개면 빈 배열).

### 상태 코드

| 상태 코드 | 상황                                                  |
| --------- | ------------------------------------------------------ |
| 200 / 201 | 성공 (조회/수정 200, 등록 201)                            |
| 204       | 삭제 성공 (본문 없음)                                     |
| 400       | 입력값 검증 실패                                          |
| 401       | 로그인되어 있지 않음                                       |
| 404       | 해당 id의 용어가 없거나, 존재해도 내 용어가 아님              |
| 409       | 이미 등록한 용어 이름과 중복 (등록 시 / 이름 변경 시 모두)    |

### terms 테이블

| 컬럼         | 타입          | 설명                              |
| ------------ | ------------- | ---------------------------------- |
| id           | uuid (PK)     | 용어 식별자                         |
| user_id      | uuid (FK)     | 소유자 (`users.id`, `ON DELETE CASCADE`) |
| term         | varchar(50)   | 용어                                |
| definition   | text          | 정의                                |
| created_at   | timestamp     | 등록 시각                           |
| updated_at   | timestamp     | 마지막 수정 시각                     |

`(user_id, term)` 조합에 유니크 인덱스가 걸려 있어, DB 레벨에서도 같은
사용자가 같은 용어를 두 번 등록할 수 없습니다.

마이그레이션: [`1788758377269-CreateTermsTable.ts`](../antnote-backend/src/database/migrations/1788758377269-CreateTermsTable.ts)

### 구현 흐름

```
POST /terms  (@UseGuards(AuthGuard))
  → ValidationPipe로 CreateTermDto 검증 (실패 시 400)
  → TermsService.create(userId, dto)
      1. 같은 (userId, term) 조합이 이미 있는지 확인 (있으면 409)
      2. 저장 후 TermResponseDto로 변환해 반환 (userId 필드 없음)

GET /terms  (@UseGuards(AuthGuard))
  → TermsService.findAll(userId) → userId로 필터링해 최신순 반환

GET /terms/random  (@UseGuards(AuthGuard))
  → ValidationPipe로 RandomTermsQueryDto 검증 (limit 범위 벗어나면 400)
  → TermsService.findRandom(userId, limit)
      → QueryBuilder로 ORDER BY RANDOM() LIMIT :limit, userId로 필터링

GET|PATCH|DELETE /terms/:id  (@UseGuards(AuthGuard))
  → TermsService.findOwnedOrFail(userId, id)
      - 없거나 다른 사용자 소유면 NotFoundException (403이 아니라 404)
  → (PATCH의 경우) 이름을 바꾸는 것이면 중복 재확인 후 저장
  → (DELETE의 경우) 소유 확인된 엔티티를 그대로 remove
```

### 구현 포인트

| 포인트                                       | 설명 |
| ---------------------------------------------- | ---- |
| 로그인 세션에서만 소유자를 판단                    | 요청 본문/쿼리에 `userId`를 받지 않습니다 — `@CurrentUserId()`로 세션에서만 꺼내므로, 클라이언트가 다른 사용자의 id를 흉내 내 보낼 방법이 없습니다. |
| 소유자가 아니면 403이 아니라 404                   | 회원가입/로그인 때 확립한 "존재 자체를 흘리지 않는다" 원칙을 그대로 적용했습니다 (`docs/FEATURES.md` 로그인 섹션의 사용자 열거 방지와 같은 이유). |
| 중복 이름은 서비스 확인 + DB unique 인덱스 이중 방어 | username 중복 처리와 동일한 패턴입니다 — 서비스에서 먼저 확인해 명확한 409를 주고, `(user_id, term)` unique 인덱스가 최후 방어선입니다. |
| `Term` 엔티티에 `@ManyToOne` 관계를 두지 않음        | `TermsService`는 사용자 엔티티를 조인하거나 탐색할 필요가 없어, FK 제약은 마이그레이션(스키마)에서만 걸고 애플리케이션 레벨에서는 `users` 모듈에 의존하지 않습니다. |
| `@CurrentUserId()` 커스텀 데코레이터 도입             | `/auth/me`에서 세션을 직접 다루던 코드를 재사용 가능한 데코레이터로 뽑아, `terms`부터는 컨트롤러마다 `session.userId!`를 반복하지 않습니다. |
| `ORDER BY RANDOM()`은 개인 용어장 규모에서만 의도적으로 사용 | 사용자당 데이터가 수십~수백 건 수준일 때만 저렴합니다. 테이블이 커지면 `TABLESAMPLE`이나 애플리케이션 레벨 샘플링으로 바꿔야 한다는 걸 인지하고 쓴 선택입니다. |
| `random` 라우트를 `:id` 라우트보다 먼저 선언              | 위 API 요약의 라우트 순서 설명 참고 — 흔한 실수라 의도적으로 순서를 맞췄습니다. |

### 관련 파일

```
src/modules/terms/
  terms.module.ts
  terms.controller.ts          # POST/GET/PATCH/DELETE /terms, /terms/:id
  terms.service.ts              # 소유권 검증, 중복 검사, CRUD
  terms.service.spec.ts          # 유닛 테스트 (CRUD, 소유권, 중복)
  entities/term.entity.ts
  dto/create-term.dto.ts
  dto/update-term.dto.ts          # PartialType(CreateTermDto)
  dto/term-response.dto.ts        # 응답 화이트리스트 (userId 제외)
  dto/random-terms-query.dto.ts    # ?limit= 검증 (1~50, 기본 10)

src/common/decorators/
  current-user-id.decorator.ts     # 세션에서 로그인 사용자 id 추출 (재사용 가능)

src/database/migrations/
  1788758377269-CreateTermsTable.ts
```

### 다음 단계 (미구현)

- ~~대시보드에서 랜덤 카드로 복습~~ → 아래 "메인 대시보드 (프론트엔드)" 섹션에서 구현
- 용어 검색/페이지네이션 (현재는 전체 목록 반환 — 개인 용어장이라 초기 규모에서는 충분)
- 관심종목, 포트폴리오 등 나머지 기능 모듈

---

## 메인 대시보드 (프론트엔드)

로그인한 사용자가 처음 보는 화면입니다. 저장해둔 용어 중 무작위로 뽑은
카드를 보여줘서 복습을 유도합니다 — `GET /terms/random`을 그대로 소비하는
첫 프론트엔드 기능이자, 세션 인증이 실제 화면 단위에서 어떻게 동작하는지
보여주는 첫 사례이기도 합니다.

### 화면 구성

| 경로          | 설명                                              |
| ------------- | -------------------------------------------------- |
| `/login`      | 아이디/비밀번호 로그인 폼                              |
| `/dashboard`  | 로그인 사용자 전용 — 랜덤 용어 카드 10장, 로그아웃       |

### 인증 상태를 다루는 방식

세션 쿠키(`antnote.sid`)는 `httpOnly`라 JS에서 직접 읽을 수 없고, 세션의
실제 내용은 브라우저가 아니라 서버(Redis)에 있습니다. 그래서 "로그인
되어있는가"는 오직 `GET /auth/me` 요청의 성공/실패로만 판단할 수 있습니다.

```
useCurrentUser()  (TanStack Query, queryKey: ['auth', 'me'])
  → GET /auth/me
      성공 → 로그인 상태, user 반환
      401  → 비로그인 상태

DashboardPage
  → useCurrentUser()가 401이면 useEffect에서 router.replace('/login')
  → 그 사이(로딩 중 / 리다이렉트 대기 중)에는 아무것도 렌더링하지 않음
```

Next.js 미들웨어(Edge)로 라우트를 막는 방법도 있지만, 세션 데이터가
Redis에 있어서 미들웨어에서도 결국 백엔드에 물어봐야 하는 건 동일합니다.
지금 규모에서는 클라이언트 컴포넌트에서 처리하는 쪽이 더 단순합니다.

### 로그인 → 대시보드 흐름

```
LoginForm 제출
  → useLoginMutation → POST /auth/login (성공 시 Set-Cookie로 세션 발급)
  → onSuccess: queryClient.setQueryData(['auth','me'], user)  // 재조회 없이 캐시에 바로 반영
  → router.push('/dashboard')

DashboardPage
  → useCurrentUser()로 인사말에 쓸 닉네임 확보
  → RandomTermCards → useRandomTermsQuery(10) → GET /terms/random?limit=10
  → "다시 섞기" 버튼 → refetch() → 새로운 무작위 세트

TermCard
  → 클릭 전: 용어만 노출 ("눌러서 정의 보기")
  → 클릭 후: 정의 노출 (플래시카드 방식 — 복기 목적에 맞게 바로 다 보여주지 않음)
```

### 구현 포인트

| 포인트                                             | 설명 |
| ----------------------------------------------------- | ---- |
| 카드 클릭으로 정의를 가렸다가 보여주는 방식               | "복기하기 좋게"라는 요구를 그대로 텍스트만 나열하는 대신, 실제로 기억을 테스트하는 플래시카드 UX로 구현했습니다. |
| `staleTime: Infinity`로 자동 재조회 방지                 | 재조회(새 무작위 세트)는 "다시 섞기" 버튼을 눌렀을 때만 일어나야 합니다 — 화면 포커스 전환 등으로 TanStack Query가 자동으로 다시 불러와 카드가 제멋대로 바뀌는 걸 막습니다. |
| 로그아웃 시 캐시는 `null`이 아니라 `removeQueries`로 제거   | `setQueryData(['auth','me'], null)`을 썼다가 로그아웃 직후 리다이렉트 되기 전 짧은 순간 `user.nickname`에서 `TypeError`가 나는 걸 Playwright로 직접 확인하고 고쳤습니다. `null`은 `AuthUser` 타입이 아닌데도 컴파일 에러가 나지 않았던 이유는, 캐시 키가 문자열 배열이라 `useCurrentUser`가 기대하는 타입과 `setQueryData` 호출이 타입 레벨에서 연결되어 있지 않기 때문입니다. `removeQueries`로 캐시를 비우면 다시 `isPending` 상태로 돌아가 기존 로딩 처리 로직을 그대로 탑니다. |
| 그럼에도 `!user` 방어 코드를 남겨둠                        | 위 수정과 별개로, `DashboardPage`는 `isPending`/`isError`뿐 아니라 `!user`까지 확인합니다 — 캐시를 어떻게 다루든 이 화면만은 항상 안전하게 만들기 위한 이중 방어입니다. |

### 관련 파일

```
src/app/
  login/page.tsx
  dashboard/page.tsx

src/features/auth/
  api.ts                          # login, getCurrentUser, logout
  hooks/
    useCurrentUser.ts               # GET /auth/me
    useLoginMutation.ts
    useLogoutMutation.ts
  components/
    LoginForm.tsx

src/features/dashboard/
  api.ts                          # getRandomTerms
  hooks/
    useRandomTermsQuery.ts
  components/
    TermCard.tsx                    # 클릭 시 정의 토글
    RandomTermCards.tsx              # 로딩/에러/빈 상태 + "다시 섞기"
```

### 다음 단계 (미구현)

- ~~용어 등록/수정/삭제 화면~~ → "용어 등록/수정/삭제 화면 (프론트엔드)" 섹션에서 구현
- ~~회원가입 화면~~ → 아래 "회원가입 (프론트엔드)" 섹션에서 구현

---

## 회원가입 (프론트엔드)

`/signup`에서 아이디/비밀번호/닉네임을 입력해 계정을 만듭니다. 지금까지는
Swagger로만 계정을 만들 수 있었는데, 이제 앱 안에서 가입부터 로그인까지
끊기지 않고 이어집니다.

### 화면 구성

| 경로       | 설명                                    |
| ---------- | ----------------------------------------- |
| `/signup`  | 회원가입 폼 — 성공 시 자동 로그인 후 `/dashboard`로 이동 |

### 가입 → 자동 로그인 흐름

```
SignUpForm 제출
  → useSignUpMutation → POST /auth/signup
      (회원가입 자체는 세션을 만들지 않음 — UserResponseDto만 반환)
  → onSuccess: 같은 아이디/비밀번호로 즉시 useLoginMutation 실행
      → POST /auth/login (성공 시 Set-Cookie로 세션 발급)
      → onSuccess: router.push('/dashboard')
      → onError:   router.push('/login')  // 방금 만든 계정으로 로그인 실패 시 방어적 fallback
```

가입 화면에서 아이디/비밀번호를 다시 입력하지 않고 바로 대시보드까지
가도록, 회원가입 성공 직후 같은 자격 증명으로 로그인을 한 번 더 호출하는
방식을 택했습니다. 백엔드가 가입과 로그인을 하나의 트랜잭션으로 묶어주는
게 아니라, 프론트엔드에서 두 API를 순서대로 호출하는 조합입니다.

### 구현 포인트

| 포인트                                       | 설명 |
| ---------------------------------------------- | ---- |
| 검증 실패 메시지가 여러 개일 수 있음을 반영         | 로그인은 실패 메시지가 항상 하나(아이디/비밀번호 불일치)지만, 회원가입은 아이디/비밀번호/닉네임이 동시에 검증 규칙을 어길 수 있어 `message`가 문자열 배열로 옵니다. `apiFetch`가 이걸 하나의 문자열로 합쳐주지 않으면 `Error`의 기본 배열 직렬화(콤마로만 이어붙임)가 그대로 화면에 노출됩니다 — `src/lib/api/client.ts`에서 배열이면 공백으로 join하도록 고쳤습니다. |
| HTML5 속성으로 1차 검증, 최종 판단은 서버 메시지    | `minLength`/`maxLength`/`pattern`으로 브라우저가 흔한 실수를 먼저 막아주지만, 정확한 규칙(예: 비밀번호 영문+숫자 조합)은 백엔드 `SignUpDto`에만 있습니다. 규칙이 두 곳에 흩어져 어긋나는 걸 막기 위해, 프론트엔드는 규칙을 다시 구현하지 않고 서버가 돌려주는 메시지를 그대로 보여줍니다. |
| 가입 실패 시 로그인은 시도하지 않음                  | `signUpMutation`의 `onSuccess` 안에서만 `loginMutation`을 호출합니다 — 가입 자체가 실패(중복 아이디, 검증 실패)했는데 같은 자격 증명으로 로그인을 시도할 이유가 없습니다. |

### 관련 파일

```
src/app/signup/page.tsx

src/features/auth/
  api.ts                          # signUp 추가
  hooks/
    useSignUpMutation.ts

src/features/auth/components/
  SignUpForm.tsx

src/lib/api/client.ts              # 배열 검증 메시지를 하나의 문자열로 정규화
```

---

## 용어 등록/수정/삭제 화면 (프론트엔드)

`/terms`에서 용어를 등록·수정·삭제합니다. 지금까지 프론트엔드에는 대시보드
(조회 전용)만 있었는데, 이제 API로만 가능했던 나머지 CRUD를 화면에서 직접
할 수 있습니다.

### 화면 구성

| 경로       | 설명                                                    |
| ---------- | --------------------------------------------------------- |
| `/terms`   | 등록 폼 + 전체 목록. 목록의 각 항목에서 바로 수정/삭제      |

수정은 별도 페이지 없이, 목록 항목을 인라인으로 폼으로 바꿔서 처리합니다
(클릭 → 그 자리에서 수정 → 저장/취소).

### 데이터 흐름

```
useTermsQuery            (queryKey: ['terms', 'list'])       → GET /terms
useCreateTermMutation                                         → POST /terms
useUpdateTermMutation                                          → PATCH /terms/:id
useDeleteTermMutation                                           → DELETE /terms/:id

세 뮤테이션 모두 onSuccess에서
  queryClient.invalidateQueries({ queryKey: ['terms'] })
을 호출합니다. 쿼리 키가 'terms'로 시작하는 모든 쿼리
(['terms','list'], ['terms','random',10] 등)가 한 번에 무효화되어,
용어를 등록/수정/삭제하면 이 화면과 대시보드 카드가 둘 다 다음에 볼 때
최신 상태로 갱신됩니다. (대시보드의 `staleTime: Infinity`는 "화면에 떠
있는 동안 제멋대로 재조회되지 않는다"는 의미일 뿐, invalidate로 인한
갱신 자체를 막지는 않습니다.)
```

### 구현 중 발견하고 고친 버그 두 가지

이번에도 build/lint만으로는 안 잡히는 문제들이라, 실제 브라우저로
확인하다가 발견했습니다.

| 버그 | 원인 | 수정 |
| ---- | ---- | ---- |
| 수정 폼을 열면 라벨이 "용어 용어"처럼 겹쳐 보임 | `TermForm`이 등록 폼 + 수정 중인 항목마다 반복 렌더링되는데, `<label htmlFor="term">`/`<input id="term">`을 문자열로 하드코딩해서 같은 페이지에 `id="term"`이 여러 번 존재 — 브라우저가 라벨을 엉뚱한 입력칸에 연결 | `useId()`로 컴포넌트 인스턴스마다 고유한 id를 생성하도록 변경 |
| 용어 삭제 시 크래시 위험 | `DELETE /terms/:id`는 204(본문 없음)를 반환하는데, `apiFetch`가 무조건 `response.json()`을 호출해 빈 본문에서 `SyntaxError`가 날 수 있었음 (마침 응답이 완전히 비어 있어 이번엔 콘솔에 드러나지 않았지만 재현 가능한 결함이었음) | `response.status === 204`면 `.json()`을 호출하지 않고 바로 반환하도록 `src/lib/api/client.ts`에 분기 추가 |

### 구현 포인트

| 포인트                                       | 설명 |
| ---------------------------------------------- | ---- |
| 등록/수정 폼을 하나의 컴포넌트로 공유              | `TermForm`이 `initialTerm`/`initialDefinition`, `onSubmit`, `onCancel` 등을 props로 받아 등록과 인라인 수정 양쪽에 재사용됩니다. 필드, 검증 힌트, 에러 표시를 두 곳에서 따로 관리하지 않습니다. |
| 등록 폼은 `key`를 바꿔 리마운트해서 초기화          | `TermForm`은 필드 상태를 내부에서 관리하므로, 등록 성공 후 입력값을 지우려면 부모(`CreateTermForm`)가 `key`를 바꿔 리마운트시킵니다 — `useState`를 부모로 끌어올리는 대신 폼의 자기완결성을 유지하는 쪽을 택했습니다. |
| 삭제는 `window.confirm`으로 충분                  | 커스텀 모달을 새로 만들 만큼 중요한 흐름은 아니라고 판단했습니다. 실수로 지우는 것만 막으면 되는 파괴적 액션이라 브라우저 기본 confirm으로 충분합니다. |
| 뮤테이션 성공 시 쿼리 무효화만, 낙관적 업데이트는 안 함 | 개인 용어장 규모(사용자당 데이터가 많지 않음)에서는 재조회 왕복이 체감상 문제되지 않아서, 낙관적 업데이트의 복잡도(롤백 처리 등)를 감수할 이유가 없었습니다. |

### 관련 파일

```
src/app/terms/page.tsx

src/features/terms/
  api.ts                            # Term 타입(대시보드도 여기서 import), CRUD 함수
  hooks/
    useTermsQuery.ts
    useCreateTermMutation.ts
    useUpdateTermMutation.ts
    useDeleteTermMutation.ts
  components/
    TermForm.tsx                     # 등록/수정 공용 폼
    CreateTermForm.tsx                 # 등록 폼 + 성공 시 리마운트로 초기화
    TermListItem.tsx                   # 조회/인라인 수정/삭제 토글
    TermsList.tsx                       # 로딩/에러/빈 상태

src/features/auth/hooks/
  useRequireAuth.ts                  # 대시보드와 공유하는 로그인 가드 훅 (2번째 사용처에서 추출)

src/lib/api/client.ts                # 204 No Content 처리 추가
```

### 다음 단계 (미구현)

- 관심종목, 포트폴리오 등 나머지 기능 모듈
