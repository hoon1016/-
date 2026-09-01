# StudyBet Native App

React Native + Expo 기반 초기 앱 뼈대입니다.

## 포함된 것

- 대시보드
- 스터디룸: 카메라 권한, 세션 시작/자리비움/마감, 수동 영상 기록 시작
- 패널티 보드: 목표 미달과 이탈 20분 초과에 따른 커피/간식 룰
- 기록 캘린더: 녹화 날짜 선택과 세션 영상 카드
- 하단 탭
- 더미 데이터 및 세션 종료 시 자동 정산

## 실행 방법

1. `npm install` 또는 `pnpm install`
2. `npm run start`
3. Expo Go 또는 iOS 시뮬레이터에서 확인
4. `.env.example`을 `.env`로 복사하고 Supabase URL/Publishable Key를 입력
5. `supabase/schema.sql`과 `supabase/migrations/20260901120000_harden_studybet_backend.sql`을 Supabase SQL Editor에서 순서대로 실행
6. `npx expo start --tunnel`을 실행하고 Expo Go로 QR을 스캔
7. 이메일 로그인, 그룹 생성, 세션 종료 흐름을 실제 기기에서 확인

## 환경 변수

```text
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
EXPO_PUBLIC_LIVEKIT_URL=wss://YOUR_PROJECT.livekit.cloud
```

`EXPO_PUBLIC_` 값은 앱에 포함됩니다. 따라서 Supabase Service Role Key, 데이터베이스 비밀번호, LiveKit API Secret은 여기에 넣으면 안 됩니다.

## 현재 한계

- Google OAuth는 앱 화면까지 준비됐으며 Google Cloud/Supabase 공급자 설정이 남아 있다.
- LiveKit 토큰 발급과 실제 다자간 영상방은 아직 연결하지 않았다.
- 영상은 현재 기기 카메라 흐름과 메타데이터 UI까지이며 Storage 업로드/재생이 남아 있다.
- `App.tsx`는 환경값이 비어 있으면 데모 데이터 모드로 동작한다.

## 공식 참고

- Supabase React Native 초기화: https://supabase.com/docs/reference/javascript/initializing
- Supabase JS 설치: https://supabase.com/docs/reference/javascript/installing
- Expo Camera: https://docs.expo.dev/versions/v54.0.0/sdk/camera/
- LiveKit React Native: https://docs.livekit.io/transport/sdk-platforms/react-native/
