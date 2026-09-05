# 기능 모듈 (Feature Modules)

도메인별 기능 모듈은 이 폴더 아래에 하나씩 추가됩니다. 예:

```
modules/
  auth/          # 회원가입, 로그인, JWT 발급
  users/         # 사용자 프로필, 설정
  stocks/        # 종목 마스터 데이터, 시세 조회
  watchlist/     # 사용자별 관심종목
  portfolio/     # 보유 종목, 평단가, 손익
  education/     # 초보자용 용어사전 / 가이드 콘텐츠
```

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

이 디렉터리는 현재 초기 세팅 단계라 의도적으로 비어 있습니다. 실제 기능을
구현할 때마다 모듈을 하나씩 추가할 예정입니다.
