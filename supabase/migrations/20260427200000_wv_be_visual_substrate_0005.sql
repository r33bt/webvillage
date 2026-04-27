-- ============================================================================
-- Brand Engine Migration 0005 — Slice 5 visual substrate (Ideogram lock)
-- ============================================================================
-- Per Slice 5 spec draft v1 (orchestrator-chat S215 lock):
-- 1. Extend wv_be_brand_assets.asset_type CHECK to include 'mood_board' + 'generated_image'
-- 2. Add generated_for_draft_id pointer (NULL for stand-alone gens + founder uploads)
-- 3. Add daily-cap helper index (generated_image rows per client per 24h, per Q5-5 hard cap of 50)
-- 4. Loosen storage_path NOT NULL to allow palette-only rows (no file)
--
-- Idempotent: IF NOT EXISTS / DROP IF EXISTS guards. Safe to re-run.
-- ============================================================================

-- 1. Extend asset_type CHECK
ALTER TABLE wv_be_brand_assets
  DROP CONSTRAINT IF EXISTS wv_be_brand_assets_asset_type_check;

ALTER TABLE wv_be_brand_assets
  ADD CONSTRAINT wv_be_brand_assets_asset_type_check
  CHECK (asset_type IN (
    'logo_primary', 'logo_secondary',
    'palette',
    'font_primary', 'font_secondary',
    'photo_headshot', 'photo_lifestyle',
    'banner_li', 'banner_x', 'banner_fb',
    'mood_board',           -- NEW (Slice 5) — founder-curated style anchors
    'generated_image',      -- NEW (Slice 5) — outputs of /api/be/visual persist here
    'lora_image',           -- Stage 3
    'style_guide_pdf'
  ));

-- 2. Allow palette-only rows (no file → no storage_path)
ALTER TABLE wv_be_brand_assets
  ALTER COLUMN storage_path DROP NOT NULL;

-- 3. Generated-image → driving draft link
ALTER TABLE wv_be_brand_assets
  ADD COLUMN IF NOT EXISTS generated_for_draft_id UUID;

CREATE INDEX IF NOT EXISTS idx_wv_be_brand_assets_draft_link
  ON wv_be_brand_assets(generated_for_draft_id)
  WHERE generated_for_draft_id IS NOT NULL;

COMMENT ON COLUMN wv_be_brand_assets.generated_for_draft_id IS
  'Slice 5: when an image is generated in service of a specific draft (e.g. hero image for an LI post), this links them. NULL for stand-alone generations and founder uploads. No FK due to wv_be_drafts being partitioned (matches Slice 3 parent_draft_id pattern); integrity at API layer.';

-- 4. Daily-cap helper index for Q5-5 enforcement
CREATE INDEX IF NOT EXISTS idx_wv_be_brand_assets_client_generated_recent
  ON wv_be_brand_assets(client_id, created_at DESC)
  WHERE asset_type = 'generated_image' AND deleted_at IS NULL;

-- 5. Mood-board cap helper index (12 active rows per client, per Q5-3 lock)
CREATE INDEX IF NOT EXISTS idx_wv_be_brand_assets_mood_board_per_client
  ON wv_be_brand_assets(client_id)
  WHERE asset_type = 'mood_board' AND deleted_at IS NULL;

-- Verify
SELECT con.conname, pg_get_constraintdef(con.oid) AS def
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'wv_be_brand_assets' AND contype = 'c'
ORDER BY con.conname;
