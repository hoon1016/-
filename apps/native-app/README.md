# StudyBet Native App

React Native + Expo 기반 초기 앱 뼈대입니다.

## 포함된 것

- 대시보드
- 스터디룸
- 패널티 보드
- 기록 캘린더
- 하단 탭
- 더미 데이터

## 다음 구현 순서

1. `npm install` 또는 `pnpm install`
2. `npm run start`
3. Expo Go 또는 iOS 시뮬레이터에서 확인
4. `src/config/env.ts`에 Supabase 정보 입력
5. `supabase/schema.sql`을 Supabase SQL Editor에 실행
6. `src/services/bootstrapService.ts`로 실제 그룹 데이터 hydrate
7. `src/screens/StudyRoomScreen.tsx`의 카메라/녹화 흐름을 실제 장치에서 확인
8. 서버에서 LiveKit 토큰 발급 후 `src/services/livekitService.ts` 연결

## 현재 한계

- 이 환경에서는 패키지 설치를 하지 않아 바로 실행 검증은 못 했다.
- LiveKit과 Supabase는 서비스 계층과 인터페이스만 준비했다.
- `App.tsx`는 환경값이 비어 있으면 자동으로 데모 데이터 모드로 동작한다.

## 공식 참고

- Supabase React Native 초기화: https://supabase.com/docs/reference/javascript/initializing
- Supabase JS 설치: https://supabase.com/docs/reference/javascript/installing
- Expo Camera: https://docs.expo.dev/versions/v54.0.0/sdk/camera/
- LiveKit React Native: https://docs.livekit.io/transport/sdk-platforms/react-native/
