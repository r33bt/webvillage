-- ============================================================================
-- Brand Engine Migration 0006 — Slice 6 cluster additions + interim job queue
-- ============================================================================
-- Per slice-6-topic-clusters-spec-v1.md §3 (S218 LOCKED)
-- 1. wv_be_clusters: add theme, target_audience, generation timestamps
-- 2. wv_be_cluster_slots: add slot_brief, template_id, last_error, attempt count
-- 3. New wv_be_jobs table (interim Vercel-cron worker queue; Slice 12 graphile-worker replaces)
-- 4. Status CHECK extensions
--
-- Idempotent: IF NOT EXISTS guards. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. wv_be_clusters additions
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_clusters
  ADD COLUMN IF NOT EXISTS theme TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS generation_completed_at TIMESTAMPTZ;

-- New rows after migration must have theme + target_audience
-- Existing rows (if any): backfill with empty string defaults via app-side migration if needed
UPDATE wv_be_clusters SET theme = COALESCE(theme, ''), target_audience = COALESCE(target_audience, '') WHERE theme IS NULL OR target_audience IS NULL;
ALTER TABLE wv_be_clusters
  ALTER COLUMN theme SET NOT NULL,
  ALTER COLUMN target_audience SET NOT NULL;

-- Status CHECK extension (current allowed: planning/active/completed/archived; spec adds generating/paused)
ALTER TABLE wv_be_clusters DROP CONSTRAINT IF EXISTS wv_be_clusters_status_check;
ALTER TABLE wv_be_clusters
  ADD CONSTRAINT wv_be_clusters_status_check
  CHECK (status IN ('planning', 'generating', 'active', 'paused', 'completed', 'archived'));

-- ---------------------------------------------------------------------------
-- 2. wv_be_cluster_slots additions
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_cluster_slots
  ADD COLUMN IF NOT EXISTS slot_brief TEXT,
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES wv_be_templates(id),
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS generation_attempt_count INTEGER NOT NULL DEFAULT 0;

UPDATE wv_be_cluster_slots SET slot_brief = COALESCE(slot_brief, '') WHERE slot_brief IS NULL;
ALTER TABLE wv_be_cluster_slots
  ALTER COLUMN slot_brief SET NOT NULL;

-- Make slot_topic NOT NULL (spec implies it's required)
UPDATE wv_be_cluster_slots SET slot_topic = COALESCE(slot_topic, '(untitled)') WHERE slot_topic IS NULL;
ALTER TABLE wv_be_cluster_slots
  ALTER COLUMN slot_topic SET NOT NULL;

-- Status CHECK extension
ALTER TABLE wv_be_cluster_slots DROP CONSTRAINT IF EXISTS wv_be_cluster_slots_status_check;
ALTER TABLE wv_be_cluster_slots
  ADD CONSTRAINT wv_be_cluster_slots_status_check
  CHECK (status IN ('empty', 'planned', 'generating', 'drafted', 'failed', 'scheduled', 'published'));

-- ---------------------------------------------------------------------------
-- 3. wv_be_jobs (interim worker queue)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wv_be_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress JSONB,
  last_error TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  locked_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_wv_be_jobs_status_created
  ON wv_be_jobs(status, created_at)
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_wv_be_jobs_client
  ON wv_be_jobs(client_id, created_at DESC);

-- RLS: client_id-scoped, mirrors other client-keyed tables
ALTER TABLE wv_be_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wv_be_jobs_service_all ON wv_be_jobs;
CREATE POLICY wv_be_jobs_service_all ON wv_be_jobs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS wv_be_jobs_client_user_read ON wv_be_jobs;
CREATE POLICY wv_be_jobs_client_user_read ON wv_be_jobs
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT cu.client_id FROM wv_be_client_users cu
      WHERE cu.user_id = auth.uid() AND cu.deleted_at IS NULL
    )
  );

COMMENT ON TABLE wv_be_jobs IS
  'Slice 6 interim worker queue. Vercel cron /api/be/jobs/tick processes one job per tick. Slice 12 graphile-worker on Railway replaces this without changing the public API contract.';

-- Verify
SELECT
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='wv_be_clusters' AND column_name IN ('theme','target_audience','generation_started_at','generation_completed_at')) AS clusters_new_cols,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='wv_be_cluster_slots' AND column_name IN ('slot_brief','template_id','last_error','generation_attempt_count')) AS slots_new_cols,
  (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='wv_be_jobs')) AS jobs_table_exists;
