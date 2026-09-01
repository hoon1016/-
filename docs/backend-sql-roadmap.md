# StudyBet 백엔드 · SQL 로드맵

이 문서는 StudyBet의 Supabase 데이터베이스를 재현하고 다음 기능을 안전하게 확장하기 위한 안내서입니다.

## 기술 구성

```text
Expo 앱
  ├─ Supabase Auth: 이메일 매직 링크 / Google OAuth
  ├─ Postgres: 그룹, 공부 세션, 패널티, 영상 메타데이터
  ├─ RLS: 로그인 사용자와 그룹 멤버의 접근 제어
  ├─ Storage: 비공개 체크인 영상
  └─ Edge Function: LiveKit 영상방 토큰 발급
```

## 현재 SQL 순서

Supabase SQL Editor에서 반드시 아래 순서로 실행합니다.

1. `apps/native-app/supabase/schema.sql`
2. `apps/native-app/supabase/migrations/20260901120000_harden_studybet_backend.sql`

첫 파일은 테이블과 기본 RLS 정책을 만듭니다. 두 번째 파일은 프로필, 비공개 Storage, 보안 강화 정책과 RPC 함수를 추가합니다. 같은 프로젝트에서 재실행해도 `if not exists`와 `create or replace`를 사용해 대부분 안전하게 적용됩니다.

## 데이터 모델

| 테이블 | 목적 | 주요 관계 |
| --- | --- | --- |
| `profiles` | 로그인 사용자의 닉네임 | `auth.users.id`와 1:1 |
| `study_groups` | 스터디 규칙과 초대 코드 | 그룹 소유자, 목표/이탈/패널티 설정 |
| `group_members` | 그룹 참가자 | 그룹과 사용자 연결 |
| `study_sessions` | 한 번의 공부방 | 그룹에 속함, 시작/종료 상태 |
| `session_participants` | 세션별 개인 집중/이탈 합계 | 세션과 사용자 연결 |
| `penalty_assignments` | 자동 배정된 소셜 패널티 | 그룹, 세션, 대상 사용자 연결 |
| `recording_clips` | 영상 파일의 메타데이터 | 실제 파일 경로는 Storage에 보관 |

## 핵심 DB 함수

| 함수 | 호출 시점 | 하는 일 |
| --- | --- | --- |
| `create_study_group` | 그룹 만들기 | 초대 코드 생성, 방장 멤버 등록, 프로필 생성 |
| `join_study_group` | 초대 코드 입력 | 코드 검증 후 멤버 참가/닉네임 저장 |
| `finish_my_session` | 공부 종료 | 집중·이탈 시간 저장, 규칙에 따른 패널티 생성, 세션 종료 |

앱은 직접 모든 테이블을 수정하지 않고 이 RPC 함수를 우선 사용합니다. 이 방식이 초대 코드 생성과 패널티 정산 같은 중요한 규칙을 한곳에서 관리하기 쉽습니다.

## 권한 원칙

- 로그인하지 않은 사용자는 앱 데이터에 접근할 수 없습니다.
- 그룹 멤버는 자기 그룹의 멤버/세션/패널티를 읽을 수 있습니다.
- 세션을 만든 사람만 해당 세션을 종료할 수 있습니다.
- 개인 공부 합계와 영상 메타데이터는 본인만 수정합니다.
- 영상 Storage는 `study-clips/<내 사용자 ID>/...` 경로만 접근할 수 있습니다.
- Service Role Key와 LiveKit API Secret은 Edge Function 비밀값으로만 보관합니다.

## 적용 후 확인 SQL

SQL Editor에서 아래를 실행해 테이블이 있는지 확인합니다.

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'study_groups', 'group_members', 'study_sessions',
    'session_participants', 'penalty_assignments', 'recording_clips'
  )
order by table_name;
```

로그인 후 앱에서 그룹을 만든 뒤에는 다음 쿼리로 데이터가 들어왔는지 볼 수 있습니다.

```sql
select name, invite_code, daily_goal_minutes, away_limit_minutes
from public.study_groups
order by created_at desc;
```

## 배포 로드맵

### 1. 현재 MVP

- Supabase Auth와 Postgres 연결
- 이메일 로그인
- 그룹 생성/참가
- 세션 종료 시 패널티 자동 생성
- 기본 RLS 적용

### 2. 영상방과 기록

- LiveKit 프로젝트 생성
- `livekit-token` Edge Function 배포
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`을 Supabase Function Secrets에 저장
- 앱에서 1:1 또는 그룹 영상방 입장
- 짧은 체크인 영상을 `study-clips/<user-id>/<clip-id>.mp4`에 업로드

### 3. 신뢰도 보강

- 앱이 30~60초 간격으로 서버에 서명된 출석 하트비트 전송
- 앱 종료/네트워크 끊김을 이탈 후보 이벤트로만 기록
- 자동 패널티 전 사용자 확인 또는 방장 검토 단계 추가
- `finish_my_session`이 사용자가 임의로 넣은 시간 합계를 그대로 신뢰하지 않도록 변경

### 4. 운영 기능

- 주간 리더보드와 스트릭 계산용 집계 작업
- Expo Push Notification으로 목표 마감/패널티 알림
- 영상 보관 기간 만료 시 Storage와 `recording_clips`를 함께 삭제하는 예약 작업
- 신고, 차단, 그룹 탈퇴, 데이터 삭제 요청

### 5. 출시 전 점검

- 개인정보 처리방침과 카메라/마이크 사용 목적 고지
- 영상 보관 기간과 삭제 정책 확정
- RLS 정책 테스트: 다른 계정으로 타인 데이터와 Storage 접근이 차단되는지 확인
- Edge Function 비밀값이 앱 번들, Git 이력, 로그에 없는지 확인
- 실제 결제나 기프티콘을 붙이기 전 전자상거래, 환불, 미성년자 정책 검토

## 하지 말아야 할 것

- `.env` 파일을 Git에 올리지 않습니다.
- `service_role` 키나 LiveKit API Secret을 Expo 환경 변수에 넣지 않습니다.
- RLS를 끄고 테스트한 뒤 그대로 출시하지 않습니다.
- 모든 공부 영상을 기본 저장하지 않습니다. 저장 목적, 기간, 삭제 기준이 먼저 필요합니다.
