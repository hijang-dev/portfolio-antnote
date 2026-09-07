# 기능 모듈 (Feature Modules)

화면/기능은 이 폴더 아래에 도메인별로 하나씩 추가됩니다. 예:

```
features/
  auth/          # 회원가입/로그인/로그아웃/현재 사용자 조회 (구현됨)
  dashboard/     # 메인 대시보드 — 랜덤 용어 카드 (구현됨)
  stocks/        # 종목 검색, 상세, 시세 차트
  watchlist/     # 관심종목 화면
  portfolio/     # 보유 종목, 손익 대시보드
  education/     # 관리자가 작성하는 공용 가이드 콘텐츠
```

`auth`, `dashboard`가 구현되었습니다. 화면별 설계 근거는
[`docs/FEATURES.md`](../../../docs/FEATURES.md)를 참고하세요.

각 기능 폴더는 보통 다음과 같이 구성됩니다.

```
<feature>/
  components/      # 해당 기능 전용 UI 컴포넌트
  hooks/            # TanStack Query 훅 (useXxxQuery / useXxxMutation)
  store/            # 클라이언트 전용 상태가 필요한 경우 Zustand 스토어
  api.ts            # 훅에서 사용하는 API 함수 (src/lib/api/client.ts 호출)
```

여러 기능에서 공통으로 쓰는 요소는 `src/components`, `src/lib`,
`src/store`에 둡니다. 나머지 모듈은 아직 비어 있으며, 실제 기능을 구현할
때마다 하나씩 추가할 예정입니다.
