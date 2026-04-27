-- ============================================================================
-- Brand Engine — Migration 0008 (BrandHacker Slice 0)
-- Spec: 78-webvillage/docs/brandhacker-product-spec-v1.md §5.1 + §5.2 (LOCKED v1.0 S217)
-- Database: Supabase EVA instance (hzqbsixlintiairmabbg)
-- Lane: orchestrator-chat (cross-lane authorisation S217 user; webvillage-monorepo-chat
--   formally owns supabase/migrations/, but user explicitly fired Slice 0 here).
--
-- This migration does TWO things in one atomic unit:
--
-- (A) Resolves HYG-9 — adds `metadata jsonb` to `wv_be_clients` so the 3 LOCKED
--     specs that depend on `wv_be_clients.metadata.assigned_reviewer_id` for
--     Day 0 reviewer-assignment fallback work correctly:
--       1. docs/editorial-lite-onboarding-workflow-v1.md (S210)
--       2. docs/content-calendar-spec-v1.md (S214)
--       3. docs/editorial-dashboard-spec-v1.md (S214)
--     The `metadata jsonb` column also enables BrandHacker design tokens
--     (per BH spec §5.1 + S216 thesis lock #6).
--
-- (B) Adds AEO substrate — `wv_be_aeo_artefacts` (per-tenant generated files:
--     /llms.txt, /.well-known/brand.json, schema.org JSON-LD) +
--     `wv_be_aeo_crawl_log` (track which AI engines / crawlers fetch the
--     artefacts). Phase 1 wedge differentiator per BH spec §3.4 + S216 lock #8.
--
-- Reversible: full rollback block at bottom (commented).
-- Apply via: direct DDL execution (not `supabase db push` — build-chat lane
--   has untracked 0005-0007 in working tree we don't want to push).
-- ============================================================================

-- ─── (A) wv_be_clients.metadata jsonb ─────────────────────────────────────────

ALTER TABLE wv_be_clients
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Index for the Day 0 reviewer assignment hot path (3 LOCKED specs depend on
-- reading metadata->>'assigned_reviewer_id' frequently).
CREATE INDEX IF NOT EXISTS idx_wv_be_clients_metadata_assigned_reviewer
  ON wv_be_clients ((metadata->>'assigned_reviewer_id'))
  WHERE deleted_at IS NULL;

-- GIN index on the design_tokens subtree for jsonb-path queries during draft
-- generation (BE-DRAFT-API needs to pull tokens into Anthropic system prompt).
CREATE INDEX IF NOT EXISTS idx_wv_be_clients_metadata_design_tokens
  ON wv_be_clients USING gin ((metadata->'design_tokens'))
  WHERE deleted_at IS NULL;

-- Documented metadata jsonb shape (NOT enforced at DB layer per S217 spec
-- lock #4 — TypeScript Zod handles validation in the app layer):
--
--   {
--     "assigned_reviewer_id": "<uuid>",       -- HYG-9 reviewer fallback
--     "design_tokens": {
--       "colors":     { "primary": "#...", "accent": "#...", ... },
--       "typography": { "heading_family": "...", "scale": [...] },
--       "spacing":    [4, 8, 12, ...],
--       "radii":      { "sm": 4, "md": 8, "lg": 16 }
--     },
--     "brand_facts": {
--       "founded":          "YYYY-MM",
--       "founders":         ["..."],
--       "mission":          "...",
--       "primary_products": ["..."],
--       "geographies":      ["..."]
--     }
--   }

-- ─── (B) wv_be_aeo_artefacts (per-tenant AEO outputs) ─────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_aeo_artefacts (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  artefact_type            text NOT NULL CHECK (artefact_type IN (
                             'llms_txt',
                             'brand_json',
                             'schema_jsonld'
                           )),
  content                  text NOT NULL,
  schema_version           text NOT NULL DEFAULT 'v1',
  generated_at             timestamptz NOT NULL DEFAULT now(),
  generated_by             uuid REFERENCES auth.users(id),

  -- Provenance — what voice profile version + metadata snapshot generated this
  source_voice_version     integer,
  source_metadata_hash     text,

  -- Hosting model per S217 spec lock #2 ("both — BH-hosted default + tenant-hosted Pro")
  hosting_mode             text NOT NULL DEFAULT 'bh_hosted' CHECK (hosting_mode IN (
                             'bh_hosted',                -- Starter tier: served from brandhacker.com/[slug]/...
                             'tenant_hosted_pending',    -- Pro tier: tenant downloaded + hasn't confirmed live yet
                             'tenant_hosted_verified'    -- Pro tier: BH verified the artefact exists on tenant domain
                           )),
  tenant_url               text,                         -- when tenant_hosted_*: where it lives on tenant domain
  tenant_verified_at       timestamptz,

  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),

  UNIQUE (client_id, artefact_type)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_aeo_artefacts_client_type
  ON wv_be_aeo_artefacts(client_id, artefact_type);

CREATE INDEX IF NOT EXISTS idx_wv_be_aeo_artefacts_generated
  ON wv_be_aeo_artefacts(generated_at DESC);

ALTER TABLE wv_be_aeo_artefacts ENABLE ROW LEVEL SECURITY;

-- ─── (B.2) wv_be_aeo_crawl_log (which AI engines fetch the artefacts) ─────────

CREATE TABLE IF NOT EXISTS wv_be_aeo_crawl_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  artefact_type   text NOT NULL CHECK (artefact_type IN (
                    'llms_txt',
                    'brand_json',
                    'schema_jsonld'
                  )),
  user_agent      text NOT NULL,
  ip_hash         text,            -- sha256(ip + daily salt) — privacy-preserving
  occurred_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wv_be_aeo_crawl_log_client_time
  ON wv_be_aeo_crawl_log(client_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_aeo_crawl_log_user_agent
  ON wv_be_aeo_crawl_log(user_agent, occurred_at DESC);

ALTER TABLE wv_be_aeo_crawl_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (mirror existing wv_be_* patterns from Migration 0001)
-- ============================================================================

-- wv_be_aeo_artefacts — members can read; admin/editor can write
DROP POLICY IF EXISTS aeo_artefacts_select_member ON wv_be_aeo_artefacts;
CREATE POLICY aeo_artefacts_select_member ON wv_be_aeo_artefacts
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

DROP POLICY IF EXISTS aeo_artefacts_write_editor ON wv_be_aeo_artefacts;
CREATE POLICY aeo_artefacts_write_editor ON wv_be_aeo_artefacts
  FOR ALL TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor')
      AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- wv_be_aeo_crawl_log — members read their own client's log; only service role writes
-- (writes happen from the AEO artefact serving endpoint when a crawler hits)
DROP POLICY IF EXISTS aeo_crawl_log_select_member ON wv_be_aeo_crawl_log;
CREATE POLICY aeo_crawl_log_select_member ON wv_be_aeo_crawl_log
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- ============================================================================
-- ROLLBACK (uncomment to revert this migration)
-- ============================================================================
-- DROP TABLE IF EXISTS wv_be_aeo_crawl_log CASCADE;
-- DROP TABLE IF EXISTS wv_be_aeo_artefacts CASCADE;
-- DROP INDEX IF EXISTS idx_wv_be_clients_metadata_design_tokens;
-- DROP INDEX IF EXISTS idx_wv_be_clients_metadata_assigned_reviewer;
-- ALTER TABLE wv_be_clients DROP COLUMN IF EXISTS metadata;
