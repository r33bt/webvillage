-- ============================================================================
-- Brand Engine Migration 0009 — Slice 9 editorial calendar materialized view
-- ============================================================================
-- Per slice-9-editorial-calendar-looker-spec-v1.md (LOCKED v1, S218 speedrun: 8 founder Qs)
--
-- 1. wv_be_mv_editorial_calendar — joins drafts + scores + cluster_slots + clusters + publishes
-- 2. wv_be_v_editorial_calendar — wrapper view consulting app.current_client GUC for per-tenant filter (Q9-4)
-- 3. wv_calendar_reader role — SELECT on wrapper view only (Q9-3, principle of least privilege)
-- 4. Indexes for CONCURRENT REFRESH + per-client filter + routing-band
--
-- Deviation from spec §6.1: pg_cron extension is NOT enabled on this Supabase
-- instance. Cron refresh handled via Vercel cron + /api/be/calendar/cron-refresh
-- route instead. Same 15-min cadence; consistent with Slice 6/8 cron pattern.
--
-- Idempotent: IF NOT EXISTS guards. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Materialized view
-- ---------------------------------------------------------------------------

DROP MATERIALIZED VIEW IF EXISTS wv_be_mv_editorial_calendar CASCADE;

CREATE MATERIALIZED VIEW wv_be_mv_editorial_calendar AS
SELECT
  d.id                      AS draft_id,
  d.client_id               AS client_id,
  d.generated_at            AS draft_generated_at,
  d.status                  AS draft_status,
  d.source_type             AS draft_source_type,
  d.template_id             AS draft_template_id,
  d.parent_draft_id         AS draft_parent_id,
  s.scores->>'overall'      AS draft_score_overall,
  CASE WHEN s.scores IS NOT NULL THEN
    ((s.scores->>'provenance')::numeric
      + (s.scores->>'specificity')::numeric
      + (s.scores->>'structure')::numeric
      + (s.scores->>'voice')::numeric
      + (s.scores->>'utility')::numeric) / 5.0
  ELSE NULL END             AS draft_score_avg,
  s.passes_threshold        AS draft_passes_threshold,
  array_length(s.banned_phrase_hits, 1)
                            AS draft_banned_phrase_count,
  cs.cluster_id             AS cluster_id,
  c.name                    AS cluster_name,
  c.arc_type                AS cluster_arc_type,
  cs.slot_index             AS cluster_slot_index,
  cs.slot_arc_role          AS cluster_slot_arc_role,
  cs.scheduled_for          AS cluster_scheduled_for,
  p.id                      AS publish_id,
  p.platform                AS publish_platform,
  p.publish_provider        AS publish_provider,
  p.scheduled_for           AS publish_scheduled_for,
  p.published_at            AS publish_published_at,
  p.status                  AS publish_status,
  p.external_post_id        AS publish_external_post_id,
  COALESCE(
    p.published_at,
    p.scheduled_for,
    cs.scheduled_for,
    d.generated_at
  )                         AS calendar_date,
  CASE
    WHEN s.scores IS NULL THEN 'unscored'
    WHEN ((s.scores->>'provenance')::numeric
          + (s.scores->>'specificity')::numeric
          + (s.scores->>'structure')::numeric
          + (s.scores->>'voice')::numeric
          + (s.scores->>'utility')::numeric) / 5.0 >= 85 THEN 'auto_publishable'
    WHEN ((s.scores->>'provenance')::numeric
          + (s.scores->>'specificity')::numeric
          + (s.scores->>'structure')::numeric
          + (s.scores->>'voice')::numeric
          + (s.scores->>'utility')::numeric) / 5.0 >= 70 THEN 'founder_review'
    WHEN ((s.scores->>'provenance')::numeric
          + (s.scores->>'specificity')::numeric
          + (s.scores->>'structure')::numeric
          + (s.scores->>'voice')::numeric
          + (s.scores->>'utility')::numeric) / 5.0 >= 60 THEN 'reviewer_queue'
    ELSE 'rejected'
  END                       AS routing_band
FROM wv_be_drafts d
LEFT JOIN wv_be_scores s
  ON s.draft_id = d.id AND s.draft_generated_at = d.generated_at
LEFT JOIN wv_be_cluster_slots cs
  ON cs.draft_id = d.id
LEFT JOIN wv_be_clusters c
  ON c.id = cs.cluster_id
LEFT JOIN wv_be_publishes p
  ON p.draft_id = d.id AND p.draft_generated_at = d.generated_at
WHERE d.generated_at >= NOW() - INTERVAL '180 days';

-- CONCURRENTLY-eligible unique index (required for non-blocking REFRESH)
CREATE UNIQUE INDEX IF NOT EXISTS idx_wv_be_mv_editorial_calendar_pk
  ON wv_be_mv_editorial_calendar(draft_id, draft_generated_at, COALESCE(publish_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Per-client + date filter
CREATE INDEX IF NOT EXISTS idx_wv_be_mv_editorial_calendar_client_date
  ON wv_be_mv_editorial_calendar(client_id, calendar_date DESC);

-- Routing band filter (auto_publishable + founder_review)
CREATE INDEX IF NOT EXISTS idx_wv_be_mv_editorial_calendar_band
  ON wv_be_mv_editorial_calendar(client_id, routing_band)
  WHERE routing_band IN ('auto_publishable', 'founder_review');

COMMENT ON MATERIALIZED VIEW wv_be_mv_editorial_calendar IS
  'Slice 9: per-client editorial calendar substrate. 180-day window. Refresh: every 15 min via Vercel cron + on-publish via Slice 8 webhook patch + manual via /api/be/calendar/refresh.';

-- ---------------------------------------------------------------------------
-- 2. Wrapper view — per-client filter via app.current_client GUC (Q9-4)
-- ---------------------------------------------------------------------------

DROP VIEW IF EXISTS wv_be_v_editorial_calendar;

CREATE VIEW wv_be_v_editorial_calendar AS
SELECT *
FROM wv_be_mv_editorial_calendar
WHERE client_id = NULLIF(current_setting('app.current_client', true), '')::uuid;

COMMENT ON VIEW wv_be_v_editorial_calendar IS
  'Slice 9: per-client filtered wrapper around wv_be_mv_editorial_calendar. Looker connection sets app.current_client via SET LOCAL before each query. Bypasses MV-RLS-bypass problem.';

-- ---------------------------------------------------------------------------
-- 3. wv_calendar_reader role (Q9-3) — SELECT on wrapper view only
-- ---------------------------------------------------------------------------
-- Role created with NOLOGIN initially; founder sets password via Supabase
-- dashboard (so credentials don't appear in version control).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wv_calendar_reader') THEN
    CREATE ROLE wv_calendar_reader NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO wv_calendar_reader;
GRANT SELECT ON wv_be_v_editorial_calendar TO wv_calendar_reader;
-- Explicitly NO grants on wv_be_drafts/wv_be_scores/wv_be_publishes/wv_be_clients/etc.

-- Postgres ≥15: GRANT SET ON PARAMETER (Supabase is 15+; if this fails on older,
-- app.* params are unrestricted by default and SET LOCAL works without explicit grant)
DO $$
BEGIN
  EXECUTE 'GRANT SET ON PARAMETER app.current_client TO wv_calendar_reader';
EXCEPTION WHEN OTHERS THEN
  -- Older Postgres: no-op (app.* params are session-settable by default)
  NULL;
END $$;

COMMENT ON ROLE wv_calendar_reader IS
  'Slice 9: read-only role for Looker Studio Postgres connector. SELECT on wv_be_v_editorial_calendar only. Password set via Supabase dashboard (founder action). Stored as 1Password "Looker Calendar Reader (EVA Platform)".';

-- ---------------------------------------------------------------------------
-- 4. Initial population
-- ---------------------------------------------------------------------------

-- Note: REFRESH MATERIALIZED VIEW CONCURRENTLY can't run inside a transaction block.
-- The MV is populated on creation by the SELECT in CREATE MATERIALIZED VIEW (above).
-- First Vercel cron tick (or manual refresh) will trigger CONCURRENTLY refresh thereafter.

-- Verify
SELECT
  (SELECT EXISTS(SELECT 1 FROM pg_matviews WHERE matviewname='wv_be_mv_editorial_calendar')) AS mv_exists,
  (SELECT EXISTS(SELECT 1 FROM information_schema.views WHERE table_name='wv_be_v_editorial_calendar')) AS wrapper_view_exists,
  (SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='wv_calendar_reader')) AS reader_role_exists,
  (SELECT COUNT(*) FROM wv_be_mv_editorial_calendar) AS initial_row_count;
