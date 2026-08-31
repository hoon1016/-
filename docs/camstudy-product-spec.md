# 캠스터디 소셜 패널티 앱 초기 기획안

작성일: 2026-08-31

## 1. 시장 검증

### 현재 시장에서 확인되는 것

- `구루미 캠스터디`
  - 모바일과 PC 모두에서 웹캠 기반 캠스터디를 지원한다.
  - 스터디 기간, 하루 목표시간, 상벌점 기능을 제공하지만 상벌점은 방장이 수동으로 운영한다.
- `Focusmate`
  - 카메라 온 상태의 1:1 세션, 지각/노쇼 자동 추적, 계정 제재가 핵심이다.
  - 강한 책임감은 주지만 친구끼리 장기 그룹을 운영하는 구조는 약하다.
- `StudyStream / StudyTogether`
  - 24/7 공개 스터디룸, 목표 설정, 타이머, 커뮤니티형 학습에 강하다.
  - 장기 친구 그룹 운영과 금전성 없는 소셜 패널티 자동화는 핵심이 아니다.
- `YPT(열품타)`
  - 공부시간 기록, 그룹, 순위, 앱 차단은 강하지만 캠 기반 실시간 상호 감시는 중심 기능이 아니다.
- `FLOWN / Caveday`
  - 바디더블링과 동시 집중 세션은 잘 제공하지만 친구 그룹 기반의 내기형 패널티 시스템은 전면에 없다.

### 결론

현재 시장에는 아래 조합이 완성형으로 붙어 있는 제품이 드물다.

- 친구끼리 폐쇄형 그룹 생성
- 카메라 기반 참여 확인
- 목표 공부시간과 이탈 규칙 설정
- 세션/주간 성과 비교
- 커피, 간식, 기프티콘 같은 가벼운 소셜 패널티 자동 배정

즉, 시장은 이미 `캠스터디`, `바디더블링`, `공부시간 기록`, `책임감 강화` 수요를 검증했다. 다만 이 제품은 `친구 그룹형 자동 벌칙 운영`이라는 빈틈에 들어갈 수 있다.

## 2. 차별화 포인트

### 핵심 포지셔닝

`Focusmate의 자동 책임감`과 `구루미의 그룹 스터디` 사이에서, `친구끼리 장기적으로 굴리는 소셜 내기형 캠스터디`에 집중한다.

### 제품 차별화

1. 제재가 아니라 `가벼운 사회적 약속`에 집중
   - 계정 정지보다 커피 사기, 간식 사기, 다음 모임 쏘기 같은 부담 낮은 패널티
2. 친구 그룹 중심
   - 낯선 사람 매칭보다 실제 친구/스터디 멤버가 오래 유지되는 구조
3. 자동 정산 경험
   - 목표 미달, 장시간 이탈, 주간 꼴찌를 시스템이 자동 계산
4. 프라이버시 친화적 검증
   - 초기에는 브라우저 내 카메라 상태, 탭 가시성, 오디오/비디오 상태, 셀프 체크인 기반
   - 고도화 시 온디바이스 비전 모델로 이탈 판별
5. 재미 요소
   - 벌점표, 리더보드, 연속 달성, 패널티 카드, 주간 하이라이트

## 3. MVP 정의

### 반드시 있어야 하는 기능

1. 친구 초대형 스터디룸 생성
2. 스터디 기간, 하루 목표시간, 허용 이탈시간 설정
3. 패널티 규칙 설정
   - 목표 미달
   - 장시간 이탈
   - 주간/세션 꼴찌
4. 카메라 참여 시작
5. 실시간 공부시간 및 이탈시간 기록
6. 참가자 리더보드
7. 세션 종료 시 자동 패널티 배정
8. 결과 공유 카드

### MVP에서 제외할 것

- 실제 자동 결제/송금
- 얼굴 인식 기반 본인 인증
- 공개 커뮤니티/매칭
- 고급 관리자 기능
- 정교한 부정행위 탐지

## 4. 사용자 플로우

### 방장 플로우

1. 회원가입 또는 간편 시작
2. 스터디룸 생성
3. 기간, 목표시간, 이탈 허용 기준, 패널티 규칙 입력
4. 초대 링크 공유
5. 세션 시작
6. 종료 후 자동 정산 확인
7. 주간 결과 카드 공유

### 참가자 플로우

1. 초대 링크 입장
2. 닉네임과 벌칙 수락
3. 카메라 권한 허용
4. 세션 동안 캠 ON 상태 유지
5. 목표시간/이탈 현황 확인
6. 세션 종료 후 내 기록과 배정 패널티 확인

## 5. 화면 목록

1. 랜딩 / 서비스 소개
2. 방 생성 화면
3. 초대 및 규칙 확인 화면
4. 실시간 스터디룸
5. 세션 결과 화면
6. 주간 리더보드 / 패널티 보드
7. 내 기록 화면

## 6. 데이터 모델

### User

- id
- nickname
- avatar_url
- timezone
- created_at

### StudyGroup

- id
- owner_id
- name
- invite_code
- start_date
- end_date
- daily_goal_minutes
- away_threshold_minutes
- penalty_mode
- created_at

### GroupMember

- id
- group_id
- user_id
- role
- joined_at

### PenaltyRule

- id
- group_id
- trigger_type
  - `goal_miss`
  - `away_over_limit`
  - `session_last_place`
  - `weekly_last_place`
- threshold_value
- title
- reward_or_penalty_text
- active

### StudySession

- id
- group_id
- started_at
- ended_at
- created_by
- status

### SessionParticipant

- id
- session_id
- user_id
- camera_on
- joined_at
- left_at
- focused_minutes
- away_minutes
- goal_achieved

### PresenceEvent

- id
- session_id
- user_id
- event_type
  - `camera_on`
  - `camera_off`
  - `tab_hidden`
  - `tab_visible`
  - `manual_away`
  - `manual_back`
- recorded_at
- meta_json

### PenaltyAssignment

- id
- group_id
- session_id
- user_id
- rule_id
- reason
- penalty_text
- status
  - `assigned`
  - `accepted`
  - `completed`
- assigned_at

## 7. 기술 스택 제안

### 초기 프로토타입

- Frontend: HTML / CSS / Vanilla JS
- 저장: LocalStorage
- 미디어: `getUserMedia`
- 배포: 정적 호스팅 또는 간단한 웹 서버

### MVP 운영 버전

- Frontend: Next.js + TypeScript
- Realtime: LiveKit 또는 Daily + WebRTC
- Backend: Supabase 또는 Firebase
- DB: Postgres
- Auth: Google / Apple / Kakao 중 1~2개
- Presence 처리: WebSocket + 서버 이벤트 로그
- 비전 모델: 온디바이스 MediaPipe 또는 TensorFlow.js 기반 간단한 인체/얼굴 존재 감지
- Analytics: PostHog

### 왜 이렇게 가는가

- 실시간 영상 기능은 직접 WebRTC를 처음부터 짜기보다 검증된 SDK 사용이 빠르다.
- 초기 리스크는 영상 인프라보다 `규칙 설계`와 `지속 사용성`이므로, 앱 핵심은 룰 엔진과 결과 경험에 두는 편이 낫다.

## 8. 법적 / 결제 리스크

### 프라이버시

- 카메라 영상은 민감도가 높다.
- 초기 MVP는 영상을 서버 저장하지 않고 `실시간 스트림 + 상태 이벤트 로그` 중심으로 운영하는 편이 안전하다.
- 개인정보처리방침, 녹화 여부, 보관 기간, 신고 절차가 필요하다.

### 청소년 / 유해행위

- 캠 서비스는 부적절 영상, 괴롭힘, 스토킹, 불법 촬영 이슈가 크다.
- 신고, 차단, 강퇴, 커뮤니티 가이드라인, 최소한의 운영 툴이 필요하다.

### 도박 / 사행성 오해

- 현금 상금 또는 강제 벌금 회수 구조는 사행성, 전자금융, 민원 리스크가 커질 수 있다.
- MVP는 `자동 송금`이 아니라 `소셜 약속 배정`과 `외부 결제 링크 연동 없는 결과 안내` 수준으로 제한하는 것이 안전하다.

### 결제

- 앱 내부에서 기프티콘 구매/정산을 직접 처리하면 PG, 환불, 미성년자 결제, 국가별 규제가 붙는다.
- 초기에는 결제 미탑재, 추후 제휴형 쿠폰 또는 외부 링크 방식 검토가 현실적이다.

### 허위 판정

- 장시간 이탈 자동 판정이 부정확하면 분쟁이 생긴다.
- MVP는 자동 기록 + 수동 이의제기 + 그룹 합의 수정 기능이 필요하다.

## 9. 출시 전략 제안

### 가장 먼저 검증할 가설

1. 친구끼리 하는 소셜 패널티가 실제로 재방문율을 올리는가
2. `벌금`보다 `커피/간식 쏘기` 문구가 참여 허들을 낮추는가
3. 카메라 감시 강도를 올릴수록 유지율이 오르는가, 이탈률이 오르는가

### 첫 번째 타깃

- 시험 준비생 소규모 그룹
- 취준생 / 자격증 스터디
- 재택 직장인 바디더블링 그룹

### 첫 번째 성공 지표

- 7일 리텐션
- 그룹당 주간 세션 수
- 세션 완료율
- 패널티 규칙 설정률
- 패널티 배정 후 다음 세션 재참여율

## 10. 프로토타입 범위

이번 초기 프로토타입에는 아래를 포함한다.

- 스터디 그룹 설정
- 카메라 시작
- 세션 타이머
- 자리비움 토글
- 목표시간/이탈시간 기반 자동 패널티 계산
- 샘플 친구 데이터와 리더보드
- 결과 카드

## 참고한 현재 서비스 자료

- Focusmate FAQ: [https://www.focusmate.com/faq/](https://www.focusmate.com/faq/)
- Focusmate no-show 정책: [https://support.focusmate.com/en/articles/4044431-what-if-i-don-t-get-a-match-or-my-partner-doesn-t-show](https://support.focusmate.com/en/articles/4044431-what-if-i-don-t-get-a-match-or-my-partner-doesn-t-show)
- Focusmate 카메라 규칙: [https://support.focusmate.com/en/articles/4354764-do-i-need-to-keep-the-video-and-audio-turned-on-for-the-entire-session](https://support.focusmate.com/en/articles/4354764-do-i-need-to-keep-the-video-and-audio-turned-on-for-the-entire-session)
- 구루미 캠스터디 방 개설 가이드: [https://camsguide.gooroomee.com/b644e6f0-8005-412e-9e40-4bf21bce0029](https://camsguide.gooroomee.com/b644e6f0-8005-412e-9e40-4bf21bce0029)
- 구루미 모바일 가이드: [https://camsguide.gooroomee.com/c8affc29-bb0e-41d4-a304-28b58916ef6d](https://camsguide.gooroomee.com/c8affc29-bb0e-41d4-a304-28b58916ef6d)
- 구루미 공부기록: [https://camsguide.gooroomee.com/920077e9-df8d-4b0a-a1c8-286d07c9c5f5](https://camsguide.gooroomee.com/920077e9-df8d-4b0a-a1c8-286d07c9c5f5)
- YPT Google Play listing: [https://play.google.com/store/apps/details?hl=en-US&id=com.pallo.passiontimerscoped](https://play.google.com/store/apps/details?hl=en-US&id=com.pallo.passiontimerscoped)
- StudyStream focus rooms: [https://www.studystream.live/blog/focus-rooms-get-work-done-together-without-the-pressure/](https://www.studystream.live/blog/focus-rooms-get-work-done-together-without-the-pressure/)
- Study Together: [https://www.studytogether.com/](https://www.studytogether.com/)
- FLOWN: [https://flown.com/](https://flown.com/)
- Caveday: [https://www.caveday.org/](https://www.caveday.org/)
