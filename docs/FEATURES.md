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

- 인증 가드를 사용하는 실제 기능 (관심종목, 포트폴리오 등)
- 동시 로그인 세션 목록 조회/개별 로그아웃 ("다른 기기에서 로그아웃")
