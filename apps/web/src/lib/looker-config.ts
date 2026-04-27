// apps/web/src/lib/looker-config.ts
// Slice 9: Looker Studio embed URL builder.
// Per spec §5.3 — embed URL pattern with client_id param.

export function getLookerCalendarConfig() {
  return {
    reportId: process.env.LOOKER_CALENDAR_REPORT_ID ?? '',
    pageId: process.env.LOOKER_CALENDAR_PAGE_ID ?? '',
    isConfigured:
      !!process.env.LOOKER_CALENDAR_REPORT_ID &&
      process.env.LOOKER_CALENDAR_REPORT_ID !== 'TBD_FOUNDER_ACTION',
  }
}

export function buildLookerCalendarEmbedUrl(clientId: string): string | null {
  const cfg = getLookerCalendarConfig()
  if (!cfg.isConfigured) return null

  const params = encodeURIComponent(JSON.stringify({ 'ds0.client_id': clientId }))
  const pageSegment = cfg.pageId ? `/page/${cfg.pageId}` : ''
  return `https://lookerstudio.google.com/embed/reporting/${cfg.reportId}${pageSegment}?params=${params}`
}
