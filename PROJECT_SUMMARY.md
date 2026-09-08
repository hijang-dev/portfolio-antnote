# antnote — 주식 초보자를 위한 학습형 웹 서비스

GitHub: https://github.com/hijang-dev/portfolio-antnote

- 풀스택 개발 역량 검증을 위해 처음부터 설계·구현한 개인 포트폴리오 프로젝트. 회원가입부터 핵심 기능까지 프론트엔드/백엔드 전 구간을 직접 개발.
- 기술 스택: Next.js(App Router) · TypeScript · Tailwind CSS · Zustand · TanStack Query · Tiptap · NestJS · TypeORM · PostgreSQL · Redis

## 프론트엔드 개발 방식

- 상태 관리 이원화: 클라이언트 UI 상태는 Zustand, 서버 데이터는 TanStack Query로 명확히 분리해 관리
- 기능 단위(feature-folder) 구조: auth/dashboard/terms/journal 등 도메인별로 API·훅·컴포넌트를 응집해 배치, 재사용 로직(인증 가드 훅 등)은 2번째 사용처가 생기는 시점에 추출
- 세션 기반 인증 연동: httpOnly 쿠키 기반 백엔드 세션에 맞춰 fetch 래퍼에 자격증명 포함 처리, 인증 상태는 서버 응답으로만 판단
- 리치 텍스트 에디터 연동: Tiptap 기반 에디터로 매매일지(매매근거/복기) 작성 기능 구현 — 저장된 콘텐츠는 서버가 sanitize한 결과를 신뢰해 렌더링
- 실브라우저 검증 필수화: 빌드/타입체크 통과만으로 완료 처리하지 않고 Playwright로 실제 로그인 → 기능 동작 → 에러 케이스까지 확인 — 이 과정에서 정적 검사로는 잡히지 않는 런타임 버그 다수 발견 및 수정

## 백엔드 개발 방식

- 모듈형 아키텍처: NestJS 모듈을 도메인별(auth/users/terms/trade-journals)로 분리, 모듈 간 의존은 단방향으로 제한
- 인증 방식 전환 경험: 초기 JWT로 구현 후, 즉시 무효화 가능성·클라이언트 정보 노출 최소화를 위해 세션(Redis) 방식으로 재설계
- 보안 설계: 응답은 화이트리스트 DTO로만 직렬화(민감 필드 누출 원천 차단), 비밀번호는 bcrypt 해시, 전역 예외 필터로 클라이언트 노출 메시지와 서버 로그를 분리
- 입력 데이터 방어: 리치 텍스트(HTML) 콘텐츠는 클라이언트(에디터)를 신뢰하지 않고 서버에서 sanitize-html로 허용 태그만 남기고 저장 — API를 직접 호출해도 안전
- 데이터 정합성: TypeORM 마이그레이션 기반 스키마 관리(자동 동기화 미사용), DB 유니크 제약 + 서비스 레벨 중복 검사 이중 방어
- 품질 관리 자동화: Strict TypeScript(any 금지), Vitest 유닛 테스트, Husky pre-commit으로 포맷/린트 강제, Swagger 자동 문서화

## 현재 진행 상태

- 완료: 회원가입/로그인/로그아웃, 주식 용어 사전 CRUD, 매매일지 CRUD(리치 텍스트 에디터, 서버 측 XSS 방어), 랜덤 복습·복기 위젯 대시보드 — 프론트엔드 화면까지 전체 흐름 연동
- 예정: 관심종목, 포트폴리오 트래킹, AWS 배포
