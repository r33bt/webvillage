-- ============================================================================
-- Brand Engine Migration 0004 — Slice 3 prep
-- ============================================================================
-- Adds parent_draft_id pointer for regeneration semantics ("New draft row" lock).
-- Each "Regenerate" click in the UI creates a fresh wv_be_drafts row with
-- parent_draft_id pointing to the original. Allows A/B comparison across
-- regen attempts; UI groups via parent_draft_id.
--
-- Idempotent: IF NOT EXISTS guards on column + index.
-- ============================================================================

-- Note: wv_be_drafts is partitioned by month (generated_at). PostgreSQL doesn't allow
-- foreign keys to reference partitioned tables without a unique constraint covering the
-- partition key. Self-referencing FK on (id) alone would fail. We add the UUID column
-- + index for efficient lookups; integrity is enforced at the application layer
-- (drafts API verifies parent_draft_id exists before insert).

ALTER TABLE wv_be_drafts
  ADD COLUMN IF NOT EXISTS parent_draft_id UUID;

CREATE INDEX IF NOT EXISTS idx_wv_be_drafts_parent_draft_id
  ON wv_be_drafts(parent_draft_id)
  WHERE parent_draft_id IS NOT NULL;

COMMENT ON COLUMN wv_be_drafts.parent_draft_id IS
  'Slice 3: regen pointer. NULL for first-generation drafts; UUID for regens (points to the prior attempt the founder asked to regenerate). No FK due to partitioned-table constraint; integrity enforced at API layer.';

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'wv_be_drafts' AND column_name = 'parent_draft_id';
