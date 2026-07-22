/*
 * 앱 애널리틱스 허브 — 앱 레지스트리
 * ────────────────────────────────────────────────────────────
 * 새 앱을 추가하려면:
 *   1) 이 배열에 항목 하나를 추가하고
 *   2) analytics/data/<id>.json 데이터 파일을 넣으면 (scripts/fetch-posthog.mjs로 생성)
 *   대시보드에 자동으로 나타납니다. 코드 수정은 필요 없습니다.
 *
 * accent 색상은 검증된 카테고리 팔레트 순서대로 배정하세요:
 *   blue #2a78d6 · orange #eb6834 · aqua #1baf7a · yellow #eda100 · magenta #e87ba4 ...
 */
window.ANALYTICS_APPS = [
  {
    id: 'ssamcam',
    name: 'SsamCam',
    subtitle: '쌤캠 · iOS',
    platform: 'iOS',
    accent: '#1baf7a',       // light 모드 강조색 (aqua)
    accentDark: '#199e70',   // dark 모드 강조색
    posthog: { host: 'https://us.posthog.com', projectId: 509883 },
    dataUrl: 'data/ssamcam.json',

    // 퍼널 정의 — 배열 순서가 곧 퍼널 순서. event 는 PostHog 이벤트명.
    funnel: [
      { event: 'app_open',             label: '앱 실행' },
      { event: 'onboarding_completed', label: '온보딩 완료' },
      { event: 'record_start',         label: '녹화 시작' },
      { event: 'saved_to_photos',      label: '저장 완료' },
      { event: 'paywall_shown',        label: '페이월 노출' },
      { event: 'purchase_success',     label: '구매 완료' },
    ],

    // 이벤트 표에 쓰는 한글 라벨 (없으면 원본 이벤트명 그대로 표시)
    labels: {
      app_open: '앱 실행',
      onboarding_started: '온보딩 시작',
      onboarding_subject_selected: '과목 선택',
      onboarding_completed: '온보딩 완료',
      record_screen_opened: '녹화 화면 진입',
      record_start: '녹화 시작',
      record_stop: '녹화 종료',
      saved_to_photos: '사진 앱 저장',
      camera_permission_denied: '카메라 권한 거부',
      free_limit_reached: '무료 한도 도달',
      paywall_shown: '페이월 노출',
      purchase_success: '구매 성공',
      purchase_failed: '구매 실패',
      restore_tapped: '구매 복원',
      share_tapped: '공유',
      bug_report_tapped: '버그 신고',
    },

    // 대표 전환지표 정의 (KPI 카드). num/den 은 이벤트의 '순 사용자' 기준.
    conversions: [
      { key: 'onboarding', label: '온보딩 완료율', num: 'onboarding_completed', den: 'app_open' },
      { key: 'record',     label: '녹화 전환율',   num: 'record_start',         den: 'app_open' },
      { key: 'purchase',   label: '구매 전환율',   num: 'purchase_success',     den: 'app_open' },
    ],
  },

  /*
   * 예시: 다음 앱을 추가할 때 (주석 해제 후 값 채우기)
   *
   * {
   *   id: 'action',
   *   name: 'ActIon',
   *   subtitle: '연기 연습 · iOS',
   *   platform: 'iOS',
   *   accent: '#2a78d6', accentDark: '#3987e5',
   *   posthog: { host: 'https://us.posthog.com', projectId: 000000 },
   *   dataUrl: 'data/action.json',
   *   funnel: [ ... ],
   *   labels: { ... },
   *   conversions: [ ... ],
   * },
   */
];
