#!/usr/bin/env node
/*
 * PostHog → analytics/data/<app>.json 생성기
 * ────────────────────────────────────────────────────────────
 * 대시보드(analytics/index.html)가 읽는 앱별 데이터 파일을 PostHog에서 만들어 줍니다.
 *
 * 필요: PostHog "Personal API Key"(읽기용). 앱에 심긴 phc_ 키는 전송 전용이라 조회 불가.
 *   → PostHog → Settings → Personal API keys 에서 발급 (Scoped: project read).
 *
 * 사용법 (키는 환경변수로만, 절대 커밋 금지):
 *   POSTHOG_PERSONAL_API_KEY=phx_xxx \
 *   POSTHOG_PROJECT_ID=509883 \
 *   node scripts/fetch-posthog.mjs ssamcam
 *
 * 옵션 환경변수:
 *   POSTHOG_HOST   기본 https://us.posthog.com  (EU면 https://eu.posthog.com)
 *   DAYS           기본 90
 *   RANGE_FROM     선택. 지정 시 그 날짜부터(YYYY-MM-DD). 없으면 now()-DAYS.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const HOST = (process.env.POSTHOG_HOST || 'https://us.posthog.com').replace(/\/$/, '');
const PROJECT = process.env.POSTHOG_PROJECT_ID || '509883';
const DAYS = Number(process.env.DAYS || 90);
const appId = process.argv[2] || 'ssamcam';
const OUT = `analytics/data/${appId}.json`;

if (!API_KEY) {
  console.error('✗ POSTHOG_PERSONAL_API_KEY 환경변수가 없습니다. (읽기용 Personal API key 필요)');
  process.exit(1);
}

const since = process.env.RANGE_FROM
  ? `toDateTime('${process.env.RANGE_FROM} 00:00:00')`
  : `now() - INTERVAL ${DAYS} DAY`;

async function hogql(query) {
  const res = await fetch(`${HOST}/api/projects/${PROJECT}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  if (!res.ok) {
    throw new Error(`PostHog ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  return json.results || [];
}

async function main() {
  console.log(`▸ PostHog 조회 중 — project ${PROJECT}, 최근 ${DAYS}일, app "${appId}"`);

  const totalsRows = await hogql(
    `SELECT count() AS events, count(DISTINCT distinct_id) AS users
     FROM events WHERE timestamp > ${since}`
  );
  const [events, users] = totalsRows[0] || [0, 0];

  const evRows = await hogql(
    `SELECT event, count() AS c, count(DISTINCT distinct_id) AS u
     FROM events WHERE timestamp > ${since}
     GROUP BY event ORDER BY c DESC`
  );

  const tsRows = await hogql(
    `SELECT toString(toDate(timestamp)) AS d,
            count(DISTINCT distinct_id) AS u,
            countIf(event = 'app_open') AS ao
     FROM events WHERE timestamp > ${since}
     GROUP BY d ORDER BY d`
  );

  const timeseries = tsRows.map(([date, u, ao]) => ({ date, users: u, app_open: ao }));
  const from = timeseries.length ? timeseries[0].date : null;
  const to = timeseries.length ? timeseries[timeseries.length - 1].date : null;

  const data = {
    app: appId,
    sample: false,
    generatedAt: new Date().toISOString(),
    range: { from, to, days: DAYS },
    totals: { users, events },
    events: evRows.map(([event, c, u]) => ({ event, count: c, users: u })),
    timeseries,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2));
  console.log(`✓ ${OUT} 작성 완료 — 사용자 ${users.toLocaleString()} · 이벤트 ${events.toLocaleString()} · ${timeseries.length}일`);
}

main().catch((e) => { console.error('✗ 실패:', e.message); process.exit(1); });
