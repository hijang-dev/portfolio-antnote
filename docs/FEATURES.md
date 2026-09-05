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

- 로그인 (`POST /auth/login`) 및 JWT 발급
- 인증 가드 (`@UseGuards`)로 보호되는 엔드포인트
