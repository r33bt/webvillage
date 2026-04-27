-- ============================================================================
-- Brand Engine Migration 0008 — Slice 8 Ayrshare publishing augments
-- ============================================================================
-- Per slice-8-ayrshare-publishing-spec-v1.md (LOCKED v1, S218 speedrun: 10 founder Qs accepted)
--
-- 1. wv_be_publishes augments:
--    - platforms[] array (multi-platform fan-out per Q8-10) — replaces single platform col semantically
--    - ayrshare_post_id text UNIQUE WHERE NOT NULL (idempotency Q8-5)
--    - response_payload jsonb (raw Ayrshare response for debugging)
--    - platform_credential_id FK to wv_be_platform_credentials
--    - parent_publish_id self-ref FK (Q8-9 retry chain)
--    - created_at, cancelled_at, retry_count
--    - Status CHECK extended: queued + pending added (existing: scheduled/published/failed/cancelled)
--
-- 2. wv_be_drafts augments:
--    - scheduled_for, published_at, last_publish_id (Slice 8 §2.2)
--
-- Existing platform col kept (deprecated; drop in Slice 9 cleanup).
--
-- Idempotent: IF NOT EXISTS guards. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. wv_be_publishes augments
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_publishes
  ADD COLUMN IF NOT EXISTS platforms TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ayrshare_post_id TEXT,
  ADD COLUMN IF NOT EXISTS response_payload JSONB,
  ADD COLUMN IF NOT EXISTS platform_credential_id UUID REFERENCES wv_be_platform_credentials(id),
  ADD COLUMN IF NOT EXISTS parent_publish_id UUID REFERENCES wv_be_publishes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;

-- Backfill platforms[] from legacy platform col (no-op on alpha but defensive)
UPDATE wv_be_publishes
SET platforms = ARRAY[platform]
WHERE platform IS NOT NULL AND (platforms IS NULL OR array_length(platforms, 1) IS NULL);

COMMENT ON COLUMN wv_be_publishes.platform IS
  'DEPRECATED — use platforms[] array. Kept for transition; drop in Slice 9 cleanup.';

-- Status CHECK extension: add 'queued' + 'pending' to existing 'scheduled'/'published'/'failed'/'cancelled'
ALTER TABLE wv_be_publishes DROP CONSTRAINT IF EXISTS wv_be_publishes_status_check;
ALTER TABLE wv_be_publishes ADD CONSTRAINT wv_be_publishes_status_check
  CHECK (status IN ('queued', 'pending', 'scheduled', 'published', 'failed', 'cancelled'));

-- UNIQUE on ayrshare_post_id (Q8-5 idempotency)
CREATE UNIQUE INDEX IF NOT EXISTS uq_wv_be_publishes_ayrshare_post_id
  ON wv_be_publishes(ayrshare_post_id)
  WHERE ayrshare_post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_publishes_client_status_created
  ON wv_be_publishes(client_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_publishes_pending_webhook
  ON wv_be_publishes(ayrshare_post_id, status)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_wv_be_publishes_parent
  ON wv_be_publishes(parent_publish_id)
  WHERE parent_publish_id IS NOT NULL;

-- RLS policies
ALTER TABLE wv_be_publishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS publishes_service_all ON wv_be_publishes;
CREATE POLICY publishes_service_all ON wv_be_publishes
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS publishes_select_member ON wv_be_publishes;
CREATE POLICY publishes_select_member ON wv_be_publishes
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT cu.client_id FROM wv_be_client_users cu
      WHERE cu.user_id = auth.uid() AND cu.deleted_at IS NULL
    )
  );

-- ---------------------------------------------------------------------------
-- 2. wv_be_drafts augments
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_drafts
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_publish_id UUID;

CREATE INDEX IF NOT EXISTS idx_wv_be_drafts_scheduled
  ON wv_be_drafts(scheduled_for)
  WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_drafts_published_at
  ON wv_be_drafts(client_id, published_at DESC)
  WHERE published_at IS NOT NULL;

COMMENT ON COLUMN wv_be_drafts.last_publish_id IS
  'Slice 8: soft FK to wv_be_publishes.id (latest publish attempt for this draft). No FK constraint due to partitioned table.';

-- Verify
SELECT
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='wv_be_publishes' AND column_name IN ('platforms','ayrshare_post_id','response_payload','platform_credential_id','parent_publish_id','created_at','cancelled_at','retry_count')) AS publishes_new_cols,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='wv_be_drafts' AND column_name IN ('scheduled_for','published_at','last_publish_id')) AS drafts_new_cols,
  (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname='wv_be_publishes_status_check') AS status_check;
