# 기능 모듈 (Feature Modules)

도메인별 기능 모듈은 이 폴더 아래에 하나씩 추가됩니다. 예:

```
modules/
  auth/          # 회원가입(구현됨), 로그인, JWT 발급
  users/         # 사용자 조회/생성(구현됨), 프로필, 설정
  stocks/        # 종목 마스터 데이터, 시세 조회
  watchlist/     # 사용자별 관심종목
  portfolio/     # 보유 종목, 평단가, 손익
  education/     # 초보자용 용어사전 / 가이드 콘텐츠
```

`auth`, `users`는 회원가입 기능과 함께 구현되었습니다. 자세한 API 명세와
설계 근거는 [`docs/FEATURES.md`](../../../docs/FEATURES.md)를 참고하세요.

각 모듈은 다음과 같은 표준 Nest 구조를 따릅니다.

```
<module>/
  <module>.module.ts
  <module>.controller.ts
  <module>.service.ts
  entities/
    <name>.entity.ts
  dto/
    create-<name>.dto.ts
    update-<name>.dto.ts
```

나머지 모듈은 아직 비어 있으며, 실제 기능을 구현할 때마다 하나씩 추가할
예정입니다.
