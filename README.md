# StudyBet

> 친구와 함께 카메라를 켜고 공부하고, 약속한 목표를 지키지 못하면 커피나 간식을 사는 캠스터디 앱입니다.

StudyBet은 `열품타`의 목표 시간과 랭킹, `셀로그`의 일상 영상 기록, 친구끼리의 가벼운 내기를 하나로 묶은 iPhone/Android 앱 MVP입니다. 돈을 자동으로 결제하지 않습니다. 스터디 규칙에 따라 **"이번 주 커피 사기"** 같은 소셜 패널티를 자동으로 기록하고 친구들이 확인하는 방식입니다.

## 현재 화면

| 화면 | 할 수 있는 일 |
| --- | --- |
| 로그인 | 이메일 매직 링크 로그인, Google 로그인 연결 준비 |
| 그룹 시작 | 새 스터디 생성 또는 초대 코드로 참가 |
| 홈 | 오늘의 목표, 누적 시간, 순위, 연속 달성일 확인 |
| 스터디룸 | 카메라 권한, 공부 시작/일시 이탈/세션 종료 |
| 패널티 보드 | 목표 미달 및 장시간 이탈에 따른 커피/간식 배정 확인 |
| 기록 캘린더 | 날짜별 공부 세션과 영상 기록 메타데이터 확인 |

## 동작 범위

이미 연결됨:

- Expo React Native 앱과 Supabase 인증/데이터베이스
- 이메일 매직 링크 로그인 처리
- 스터디 그룹 생성, 초대 코드 참가
- 세션 시작과 종료, 목표 시간/이탈 시간 기반 패널티 정산
- Row Level Security(RLS): 그룹 멤버만 그룹 데이터를 읽을 수 있도록 제한
- 비공개 `study-clips` Storage 버킷과 영상 메타데이터 구조

아직 개발 중:

- Google OAuth 콘솔 설정 및 실제 로그인 테스트
- LiveKit 기반 친구 간 실시간 영상 연결
- 기기 영상 파일의 Storage 업로드와 재생
- 서버가 검증한 이탈 감지, 푸시 알림, 실제 기프티콘/결제 연동

## 구조

```text
studybet-project/
├─ apps/
│  ├─ native-app/               # Expo iOS/Android 앱
│  │  ├─ src/screens/           # 앱 화면
│  │  ├─ src/services/          # Supabase 통신
│  │  └─ supabase/              # SQL, RLS, 함수, Edge Function
│  └─ web-prototype/            # 초기 웹 UI 프로토타입
├─ docs/
│  ├─ camstudy-product-spec.md  # 시장 검증, MVP 정의, 리스크
│  ├─ studybet-native-plan.md   # 네이티브 앱 설계
│  └─ backend-sql-roadmap.md    # DB/SQL 적용과 다음 단계
└─ README.md
```

## 빠르게 실행하기

필수: Node.js 20 이상, iPhone의 Expo Go 앱, Supabase 프로젝트.

```powershell
cd apps/native-app
npm install
Copy-Item .env.example .env
npx expo start --tunnel
```

터미널에 나온 QR을 iPhone의 **Expo Go**에서 스캔합니다. 카메라를 쓰려면 iPhone 설정에서 Expo Go의 카메라 권한을 허용해야 합니다.

`.env`에는 공개 가능한 Supabase URL과 Publishable Key만 넣습니다. 데이터베이스 비밀번호, Service Role Key, LiveKit Secret은 절대 앱이나 Git에 넣지 않습니다.

```text
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
EXPO_PUBLIC_LIVEKIT_URL=wss://YOUR_PROJECT.livekit.cloud
```

## Supabase 연결 순서

1. Supabase에서 새 프로젝트를 만든다.
2. 앱의 `.env`에 프로젝트 URL과 Publishable Key를 넣는다.
3. Supabase Dashboard의 **SQL Editor**에서 아래 두 파일을 순서대로 실행한다.
   - `apps/native-app/supabase/schema.sql`
   - `apps/native-app/supabase/migrations/20260901120000_harden_studybet_backend.sql`
4. Authentication에서 이메일 로그인(Magic Link)을 켠다.
5. 개발 중 Expo Go 주소를 Authentication의 Redirect URLs에 추가한다. 설치 앱은 `studybet://auth/callback`을 사용한다.
6. 앱을 다시 실행해 이메일 로그인, 그룹 생성, 세션 종료를 확인한다.

세부 테이블, RLS 정책, SQL 적용 검증과 출시 전 보강 순서는 [백엔드·SQL 로드맵](docs/backend-sql-roadmap.md)을 참고합니다.

## 패널티 규칙

MVP 기본 규칙은 다음과 같습니다. 그룹을 만들 때 목표 시간과 이탈 한도를 정할 수 있습니다.

| 조건 | 기본 결과 |
| --- | --- |
| 오늘 목표 시간 미달 | 아메리카노 사기 |
| 허용 이탈 시간 초과 | 편의점 간식 사기 |
| 주간 최하위 | 다음 모임 간식 사기 (다음 단계) |

`finish_my_session` 데이터베이스 함수가 세션 종료 시 조건을 검사해 패널티를 생성합니다. 현재는 사용자가 전달한 시간 합계를 신뢰하는 MVP이므로, 공개 출시 전에는 서버 서명 하트비트 방식으로 바꿔야 합니다.

## 다음 개발 순서

1. Google OAuth를 Supabase에 연결하고 iPhone에서 로그인 완료 확인
2. LiveKit 토큰 발급 Edge Function 배포 후 그룹 영상방 연결
3. 짧은 체크인 영상만 비공개 Storage에 업로드하고 보관 기간에 따라 삭제
4. 서버 검증 출석/이탈 이벤트와 주간 리더보드 추가
5. 푸시 알림과 패널티 완료 확인 추가
6. 베타 사용자 테스트 후 개인정보 처리방침, 신고/차단, 앱스토어 배포 준비

## 보안과 개인정보

- 영상은 기본 비공개이며, 전체 공부 영상을 저장하지 않고 짧은 체크인 클립만 저장하는 방향입니다.
- RLS가 사용자와 그룹 권한을 데이터베이스 단에서 제한합니다.
- 결제/기프티콘 발송은 현재 구현하지 않았습니다. 실제 금전 기능은 별도 결제 약관, 환불, 미성년자, 개인정보 검토 후 도입합니다.
- 카메라 존재 여부만으로 자동 처벌하지 않습니다. 감지 오류를 고려해 사용자 확인 및 이의 제기 흐름이 필요합니다.

## 문서

- [제품 기획서](docs/camstudy-product-spec.md)
- [네이티브 구현 계획](docs/studybet-native-plan.md)
- [백엔드·SQL 로드맵](docs/backend-sql-roadmap.md)
- [Supabase 배포 안내](apps/native-app/supabase/README.md)

## 라이선스

초기 개인 프로젝트입니다. 외부 공개 또는 상용화 전 라이선스를 확정합니다.
