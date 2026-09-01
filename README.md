# StudyBet

StudyBet is a friend-based study accountability product concept that combines:

- YPT-style study time tracking and ranking
- Selog-style camera presence and daily recording
- Social penalties such as buying coffee or snacks for missing goals

## Included

- `apps/web-prototype`
  - interactive browser prototype
- `apps/native-app`
  - Expo + React Native starter app
- `docs`
  - product spec and native build plan

## Project Structure

```text
studybet-project/
  apps/
    native-app/
    web-prototype/
  docs/
```

## Status

This repository contains:

- product planning artifacts
- a runnable web prototype
- an Expo mobile app with a four-tab study flow
- camera permission, manual video-record entry, session status, and a daily recording calendar UI
- automatic demo settlement for missed daily goals and excessive away time
- backend integration points for Supabase and LiveKit

## Current App Flow

1. Open the dashboard and check today's goal, ranking, and streak.
2. Tap `친구들과 지금 공부 시작하기` to enter the study room.
3. Allow camera and microphone access, start a study session, and optionally record a study clip.
4. End the session to calculate goal-miss or away-time penalties.
5. Review the assigned coffee/snack penalty on the board and the clip date in history.

## Next Steps

1. Install dependencies in `apps/native-app`
2. Configure Supabase in `apps/native-app/src/config/env.ts`
3. Run the SQL in `apps/native-app/supabase/schema.sql`
4. Connect LiveKit token issuance for realtime rooms
