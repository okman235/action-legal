# 앱 애널리틱스 허브

여러 앱의 접속자·퍼널·전환을 한곳에서 보는 **정적 대시보드**입니다. 앱을 하나씩 추가할 수 있도록 설계돼 있습니다.

- 대시보드: `analytics/index.html`
- 배포 URL(예): `https://okman235.github.io/action-legal/analytics/`
- 첫 등록 앱: **SsamCam** (PostHog project 509883)

## 구조

```
analytics/
  index.html        # 대시보드 (설정+데이터를 읽어 렌더)
  apps.config.js    # 앱 레지스트리 — 여기에 앱을 추가
  data/
    ssamcam.json    # 앱별 집계 데이터 (스크립트가 생성)
    README.md       # 데이터 형식 명세
scripts/
  fetch-posthog.mjs # PostHog → data/<app>.json 생성 파이프라인
```

## 데이터 흐름 (왜 이렇게 나눴나)

앱에 심긴 PostHog 키(`phc_...`)는 **전송 전용**이라 데이터를 **읽지 못합니다.** 읽으려면 **Personal API Key**(읽기용)가 필요한데, 이 키를 공개 정적 사이트에 넣으면 노출됩니다. 그래서:

```
PostHog  ──(Personal API Key, 로컬에서만)──▶  fetch-posthog.mjs  ──▶  data/<app>.json  ──▶  대시보드(정적)
```

키는 **로컬 실행 시 환경변수로만** 쓰고 커밋하지 않습니다. 사이트에는 집계된 JSON만 올라갑니다.

## 실데이터로 갱신하기

1. PostHog → **Settings → Personal API keys** 에서 읽기용 키 발급.
2. 실행:
   ```bash
   POSTHOG_PERSONAL_API_KEY=phx_당신의키 \
   POSTHOG_PROJECT_ID=509883 \
   DAYS=90 \
   node scripts/fetch-posthog.mjs ssamcam
   ```
   → `analytics/data/ssamcam.json` 이 실데이터로 갱신되고 "샘플" 배너가 사라집니다.
3. 커밋·푸시 → GitHub Pages에 반영.

> 정기 갱신을 원하면 이 명령을 cron이나 GitHub Actions(시크릿에 키 저장)로 돌리면 됩니다.

## 자동 갱신 (GitHub Actions) — 권장

`.github/workflows/refresh-analytics.yml` 이 이미 들어 있습니다. **시크릿 1개만 넣으면** 매일 자동으로 실데이터를 받아 `analytics/data/ssamcam.json` 을 갱신·커밋합니다. (읽기 키는 코드/사이트에 안 들어가고 GitHub 시크릿에만 저장)

설정 (한 번만):
1. PostHog → **Settings → Personal API keys** 에서 읽기용 키 발급 (스코프: `query:read` + 해당 프로젝트 읽기).
2. GitHub 저장소 → **Settings → Secrets and variables → Actions → New repository secret**
   - 이름: `POSTHOG_PERSONAL_API_KEY`, 값: 발급한 `phx_...` 키
   - (다른 프로젝트면 **Variables** 탭에 `POSTHOG_PROJECT_ID` 도 추가)
3. **Actions 탭 → "Refresh analytics data" → Run workflow** 로 즉시 첫 갱신 실행.

이후 매일 03:17(KST) 자동 실행됩니다. 실행 즉시 `data/ssamcam.json` 이 실데이터로 바뀌고 대시보드의 "샘플" 배너가 사라집니다.

## 새 앱 추가

1. `analytics/apps.config.js` 의 `ANALYTICS_APPS` 에 항목 추가:
   ```js
   {
     id: 'action', name: 'ActIon', subtitle: '연기 연습 · iOS', platform: 'iOS',
     accent: '#2a78d6', accentDark: '#3987e5',
     posthog: { host: 'https://us.posthog.com', projectId: 000000 },
     dataUrl: 'data/action.json',
     funnel: [ { event: 'app_open', label: '앱 실행' }, /* ... */ ],
     labels: { /* event: '한글라벨' */ },
     conversions: [ { key:'purchase', label:'구매 전환율', num:'purchase_success', den:'app_open' } ],
   }
   ```
2. `node scripts/fetch-posthog.mjs action` 로 `data/action.json` 생성.
3. 배포. 상단 탭에 새 앱이 자동으로 등장합니다.

## 로컬 미리보기

`file://` 로 열면 브라우저 보안정책상 데이터 fetch가 막힙니다. 간단한 서버로 여세요:

```bash
cd analytics && python3 -m http.server 8080
# http://localhost:8080/
```

GitHub Pages(또는 임의의 정적 호스팅)에 올리면 그대로 동작합니다.

## 현재 SsamCam 이벤트 (앱 코드 기준)

접속 `app_open` · 온보딩 `onboarding_started/subject_selected/completed` · 녹화 `record_screen_opened/record_start/record_stop/saved_to_photos/camera_permission_denied` · 과금 `paywall_shown/purchase_success/purchase_failed/restore_tapped/free_limit_reached` · 기타 `share_tapped/bug_report_tapped`.
