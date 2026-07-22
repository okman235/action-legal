# 데이터 파일 형식 (`data/<app>.json`)

대시보드가 앱마다 이 형식의 JSON 하나를 읽습니다. `scripts/fetch-posthog.mjs` 가 자동 생성하며, 수동으로 만들어도 됩니다.

```jsonc
{
  "app": "ssamcam",
  "sample": false,                       // true면 대시보드에 "샘플" 경고 배너 표시
  "generatedAt": "2026-07-17T00:00:00Z", // 생성 시각(ISO)
  "range": { "from": "2026-04-18", "to": "2026-07-17", "days": 90 },

  "totals": { "users": 1240, "events": 13888 },   // 기간 내 순 사용자 / 총 이벤트

  "events": [                            // 이벤트별 집계 (순 사용자 usersOf 계산에 사용)
    { "event": "app_open",   "count": 3844, "users": 1240 },
    { "event": "record_start", "count": 1317, "users": 693 }
    // ... PostHog의 모든 이벤트
  ],

  "timeseries": [                        // 일별 지표
    { "date": "2026-04-18", "users": 6, "app_open": 9 }
    // ... 하루 한 행
  ]
}
```

## 필드 규칙

- **`events[].users`** = 해당 이벤트를 한 번이라도 발생시킨 **순 사용자(distinct_id)** 수. 퍼널·전환율의 분모/분자가 여기서 나옵니다.
- **`events[].count`** = 이벤트 총 발생 수(중복 포함). 이벤트 표의 "이벤트 수".
- **`timeseries[].users`** = 그날의 순 활성 사용자. `app_open` 은 그날 앱 실행 이벤트 수.
- 퍼널 단계와 KPI 전환지표는 데이터가 아니라 **`apps.config.js`** 에서 앱별로 정의합니다.

## 새 앱 추가 3단계

1. `apps.config.js` 의 `ANALYTICS_APPS` 배열에 항목 추가 (id·name·accent·funnel·labels·conversions).
2. `POSTHOG_PERSONAL_API_KEY=... POSTHOG_PROJECT_ID=<새앱 프로젝트> node scripts/fetch-posthog.mjs <id>` 실행 → `data/<id>.json` 생성.
3. 배포(커밋·푸시). 대시보드 상단 탭에 새 앱이 자동으로 나타납니다.
