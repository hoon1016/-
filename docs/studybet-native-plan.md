# StudyBet 모바일 앱 구현 계획

작성일: 2026-08-31

## 1. 앱 개발 순서

1. 제품 구조 확정
   - `열품타`식 공부시간 추적과 랭킹
   - `셀로그`식 카메라 존재감과 하루 기록
   - 친구 그룹형 소셜 패널티
2. 모바일 UI 구현
   - React Native 앱 쉘
   - 대시보드, 스터디룸, 패널티 보드, 기록 화면
3. 실시간 기능 연결
   - 카메라 프리뷰
   - 그룹 세션 입장
   - 세션 상태 동기화
4. 백엔드 연결
   - 로그인
   - 그룹/멤버/세션/패널티/기록 저장
5. 영상 기록 저장
   - 세션 종료 후 하루별 클립 저장
   - 캘린더와 재생 연결
6. 스토어 출시 준비
   - 권한 문구
   - 개인정보/신고/운영 정책
   - TestFlight / 내부 테스트

## 2. 권장 기술 구조

### 앱

- Framework: `Expo + React Native + TypeScript`
- 상태 관리: 초기 `useState`, 이후 `Zustand`
- 디자인 시스템: 토큰 기반 컬러/간격/카드 스타일
- 내비게이션: 초기 커스텀 탭, 이후 `expo-router` 또는 `React Navigation`

### 실시간 영상

- 1차 권장: `LiveKit`
- 대안: `Daily`
- 이유:
  - 다자간 세션 구현이 빠름
  - 모바일 카메라/오디오 제어가 안정적
  - 방 입장/퇴장 이벤트 처리 용이

### 백엔드

- `Supabase`
  - Auth
  - Postgres
  - Realtime
  - Storage

### 영상 기록

- 초기:
  - 모바일 기기 로컬 임시 저장
  - 업로드는 세션 종료 시 비동기 처리
- 운영:
  - Supabase Storage 또는 S3
  - 짧은 세션 요약 클립만 저장
  - 장기 보관 기간 정책 필요

## 3. 화면별 기능 명세

### 대시보드

- 오늘 공부시간 대형 타이머
- 목표 대비 진행률
- 오늘 남은 공부시간
- 그룹 순위
- 연속 달성 일수
- 셀로그식 체크인 카드
- 오늘 규칙 요약
- 오늘 집중 피드

### 스터디룸

- 내 카메라 프리뷰
- 세션 시작 / 종료
- 자리비움 토글
- 집중시간 / 이탈시간
- 그룹 룸 상태
- 향후 추가:
  - 다른 멤버 썸네일
  - 마이크 상태
  - 그룹 채팅

### 패널티 보드

- 실시간 리더보드
- 세션 결과 카드
- 이번 주 패널티 목록
- 이유별 자동 배정 내역
- 향후 추가:
  - 이의제기
  - 완료 체크
  - 기프티콘 인증

### 기록

- 월별 캘린더
- 날짜별 세션 카드
- 날짜별 영상 재생
- 친구별 주간 성과
- 향후 추가:
  - 스트릭 히트맵
  - 주간 리포트

## 4. 데이터 모델

### users

- id
- nickname
- avatar_url
- created_at

### study_groups

- id
- owner_id
- name
- invite_code
- daily_goal_minutes
- away_limit_minutes
- created_at

### group_members

- id
- group_id
- user_id
- role
- joined_at

### study_sessions

- id
- group_id
- started_at
- ended_at
- status

### session_participants

- id
- session_id
- user_id
- focus_seconds
- away_seconds
- camera_on_rate

### penalty_rules

- id
- group_id
- trigger_type
- penalty_text
- threshold_value

### penalty_assignments

- id
- group_id
- session_id
- user_id
- reason
- penalty_text
- assigned_at
- status

### recording_clips

- id
- session_id
- user_id
- recorded_date
- storage_path
- duration_seconds
- created_at

## 5. API / 서비스 경계

### Mobile app responsibilities

- 카메라 권한 요청
- 세션 UI
- 타이머 표시
- 영상 녹화 시작/종료
- 로컬 상태 관리

### Backend responsibilities

- 로그인
- 그룹 초대 코드 검증
- 세션 생성/종료
- 랭킹 집계
- 패널티 룰 엔진
- 클립 메타데이터 저장

### Realtime service responsibilities

- 라이브 비디오 룸
- 참가자 입퇴장
- 연결 상태 이벤트
- 카메라 온오프 상태

## 6. 출시 단계 제안

### Phase 1

- 로그인 없이 내부 테스트
- 가짜 데이터 + 실제 카메라 프리뷰
- 4개 핵심 화면

### Phase 2

- Supabase 로그인
- 그룹 생성 / 초대
- 실제 패널티 저장

### Phase 3

- LiveKit 연결
- 다자간 룸
- 실제 세션 동기화

### Phase 4

- 녹화 업로드
- 캘린더 기록
- 푸시 알림

## 7. 리스크

- 영상 저장 비용
- 카메라 권한 거부율
- 청소년 보호 / 신고 처리
- 부정확한 이탈 판정
- 소셜 패널티에 대한 분쟁

## 8. 이번 턴 산출물

이번 턴에서 아래를 같이 만들었다.

- 모바일 앱 구조 문서
- 화면별 기능 명세
- React Native 초기 프로젝트 뼈대

코드 위치:

- `outputs/studybet-native-app`
