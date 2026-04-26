-- ============================================================================
-- Brand Engine — Migration 0001 (M4 launch — tenancy + voice substrate)
-- Spec: docs/brand-engine-data-model-v1.md (S209, all 8 founder Qs locked)
-- Database: Supabase EVA instance (hzqbsixlintiairmabbg)
-- Prefix: wv_be_*
-- Tables in this migration: 9
--   1. wv_be_clients
--   2. wv_be_client_users
--   3. wv_be_subscriptions
--   4. wv_be_subscription_events
--   5. wv_be_voice_profiles
--   6. wv_be_voice_profile_versions
--   7. wv_be_voice_corpus               (pgvector)
--   8. wv_be_banned_phrases_canon       (global, no tenant)
--   9. wv_be_client_banned_phrases
-- Plus: extensions, RLS policies, indexes
-- Reversible: full DROP block at bottom (commented)
-- ============================================================================

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;            -- pgvector for voice corpus embeddings (Q4 LOCKED — OpenAI text-embedding-3-small, 1536-dim)
CREATE EXTENSION IF NOT EXISTS pgcrypto;          -- gen_random_uuid()

-- ─── 1. wv_be_clients ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_clients (
  id                                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name                       text NOT NULL,
  legal_entity_name                  text,
  primary_domain                     text,
  industry                           text,
  vertical_origin                    text,
  current_tier                       text NOT NULL DEFAULT 'free_trial'
                                       CHECK (current_tier IN (
                                         'free_trial',
                                         'tool_starter','tool_pro',
                                         'editorial_lite','editorial_growth','editorial_brand','editorial_enterprise'
                                       )),
  outreach_addon_active              boolean NOT NULL DEFAULT false,
  trial_ends_at                      timestamptz,
  brand_engine_intake_completed_at   timestamptz,

  -- Stage 2/3 columns deployed at table creation per spec §5.1 + §2 principle 9.
  referrer_source                    text,
  lifecycle_stage                    text
                                       CHECK (lifecycle_stage IS NULL OR lifecycle_stage IN (
                                         'onboarding','activated','at_risk','churned'
                                       )),

  created_at                         timestamptz NOT NULL DEFAULT now(),
  updated_at                         timestamptz NOT NULL DEFAULT now(),
  deleted_at                         timestamptz
);

CREATE INDEX IF NOT EXISTS idx_wv_be_clients_tier
  ON wv_be_clients(current_tier) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_clients_trial_ends
  ON wv_be_clients(trial_ends_at) WHERE current_tier = 'free_trial';

CREATE INDEX IF NOT EXISTS idx_wv_be_clients_lifecycle
  ON wv_be_clients(lifecycle_stage) WHERE deleted_at IS NULL AND lifecycle_stage IS NOT NULL;

ALTER TABLE wv_be_clients ENABLE ROW LEVEL SECURITY;

-- ─── 2. wv_be_client_users (M2M users ↔ clients with role) ───────────────────

CREATE TABLE IF NOT EXISTS wv_be_client_users (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('admin','editor','viewer')),
  invited_by   uuid REFERENCES auth.users(id),
  invited_at   timestamptz,
  accepted_at  timestamptz,
  deleted_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, user_id)
);

-- The covering index for the RLS hot path (every authenticated query hits this).
CREATE INDEX IF NOT EXISTS idx_wv_be_client_users_user_lookup
  ON wv_be_client_users(user_id, client_id, role)
  WHERE deleted_at IS NULL AND accepted_at IS NOT NULL;

ALTER TABLE wv_be_client_users ENABLE ROW LEVEL SECURITY;

-- ─── 3. wv_be_subscriptions (Stripe-mirrored) ────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                uuid NOT NULL UNIQUE REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  stripe_customer_id       text NOT NULL,
  stripe_subscription_id   text,
  status                   text NOT NULL CHECK (status IN ('trialing','active','past_due','canceled','paused')),
  base_tier                text NOT NULL,
  outreach_addon           boolean NOT NULL DEFAULT false,
  trial_started_at         timestamptz,
  trial_ends_at            timestamptz,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean NOT NULL DEFAULT false,
  canceled_at              timestamptz,
  pause_collection         jsonb,
  payment_method_last4     text,
  payment_method_brand     text,
  last_synced_at           timestamptz NOT NULL DEFAULT now(),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wv_be_subscriptions_status
  ON wv_be_subscriptions(status, base_tier);

CREATE INDEX IF NOT EXISTS idx_wv_be_subscriptions_period_end
  ON wv_be_subscriptions(current_period_end) WHERE status = 'active';

ALTER TABLE wv_be_subscriptions ENABLE ROW LEVEL SECURITY;

-- ─── 4. wv_be_subscription_events (append-only) ──────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_subscription_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  event_type         text NOT NULL CHECK (event_type IN (
                       'trial_started','trial_converted',
                       'plan_upgraded','plan_downgraded',
                       'addon_added','addon_removed',
                       'paused','resumed','canceled','refunded'
                     )),
  from_tier          text,
  to_tier            text,
  stripe_event_id    text UNIQUE,
  amount_cents       integer,
  currency           text NOT NULL DEFAULT 'usd',
  occurred_at        timestamptz NOT NULL DEFAULT now(),
  metadata           jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_wv_be_subscription_events_client_time
  ON wv_be_subscription_events(client_id, occurred_at DESC);

ALTER TABLE wv_be_subscription_events ENABLE ROW LEVEL SECURITY;

-- ─── 5. wv_be_voice_profiles (active, one row per client) ────────────────────

CREATE TABLE IF NOT EXISTS wv_be_voice_profiles (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid NOT NULL UNIQUE REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  version                 integer NOT NULL DEFAULT 1,
  intake_method           text NOT NULL CHECK (intake_method IN (
                            'url_extraction','sample_posts','questionnaire_only','editor_built'
                          )),
  source_url              text,

  -- Core voice attributes
  audience                text,
  one_word_tone           text,
  never_sound_like        text[],

  -- Extended attributes (Stage 1 manual setup; Stage 2 auto-extracted)
  register                text CHECK (register IS NULL OR register IN (
                            'casual','professional','academic','plainspoken','authoritative','warm'
                          )),
  do_list                 text[],
  dont_list               text[],
  reading_grade_target    numeric(3,1),
  signature_phrases       text[],
  forbidden_register      text[],

  quality_tier            text NOT NULL DEFAULT 'standard'
                            CHECK (quality_tier IN ('standard','editorial')),

  established_at          timestamptz NOT NULL DEFAULT now(),
  last_refined_at         timestamptz,
  refined_by              uuid REFERENCES auth.users(id),

  -- Stage 2 auto-extraction signal column (deployed now, populated later per principle 9)
  auto_extracted_at       timestamptz,

  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wv_be_voice_profiles ENABLE ROW LEVEL SECURITY;

-- ─── 6. wv_be_voice_profile_versions (append-only history) ───────────────────

CREATE TABLE IF NOT EXISTS wv_be_voice_profile_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  version         integer NOT NULL,
  snapshot        jsonb NOT NULL,
  superseded_at   timestamptz NOT NULL DEFAULT now(),
  superseded_by   uuid REFERENCES auth.users(id),
  reason          text CHECK (reason IS NULL OR reason IN (
                    'intake_redo','editor_refinement','drift_correction','tier_upgrade'
                  )),
  UNIQUE (client_id, version)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_voice_profile_versions_client
  ON wv_be_voice_profile_versions(client_id, version DESC);

ALTER TABLE wv_be_voice_profile_versions ENABLE ROW LEVEL SECURITY;

-- ─── 7. wv_be_voice_corpus (pgvector chunks) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_voice_corpus (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  source_type     text NOT NULL CHECK (source_type IN (
                    'url_extracted','sample_post','editor_curated','published_draft'
                  )),
  source_ref      text,
  chunk_text      text NOT NULL,
  chunk_index     integer NOT NULL,
  embedding       vector(1536),       -- OpenAI text-embedding-3-small (Q4 LOCKED S209)
  token_count     integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wv_be_voice_corpus_client
  ON wv_be_voice_corpus(client_id);

CREATE INDEX IF NOT EXISTS idx_wv_be_voice_corpus_embedding
  ON wv_be_voice_corpus USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE wv_be_voice_corpus ENABLE ROW LEVEL SECURITY;

-- ─── 8. wv_be_banned_phrases_canon (global, RLS allows all auth read) ─────────

CREATE TABLE IF NOT EXISTS wv_be_banned_phrases_canon (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase        text NOT NULL UNIQUE,
  category      text CHECK (category IS NULL OR category IN (
                  'AI-tell','managerial-padding','narrative-register','corporate-cliche','self-positioning'
                )),
  severity      text NOT NULL DEFAULT 'flag' CHECK (severity IN ('flag','block')),
  rationale     text,
  source_doc    text,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wv_be_banned_phrases_canon_active
  ON wv_be_banned_phrases_canon(active) WHERE active = true;

ALTER TABLE wv_be_banned_phrases_canon ENABLE ROW LEVEL SECURITY;

-- ─── 9. wv_be_client_banned_phrases (per-client extensions) ──────────────────

CREATE TABLE IF NOT EXISTS wv_be_client_banned_phrases (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  phrase       text NOT NULL,
  severity     text NOT NULL DEFAULT 'flag' CHECK (severity IN ('flag','block')),
  rationale    text,
  added_by     uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz,
  UNIQUE (client_id, phrase)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_client_banned_phrases_client
  ON wv_be_client_banned_phrases(client_id) WHERE deleted_at IS NULL;

ALTER TABLE wv_be_client_banned_phrases ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
--
-- Pattern (per spec §3 — RLS pattern):
--   SELECT: any user who is a member of client_id with accepted_at IS NOT NULL
--   INSERT/UPDATE/DELETE: admin or editor only
--
-- Service role bypasses RLS entirely (orchestration layer use case).
-- ============================================================================

-- wv_be_clients — members can read their own clients
DROP POLICY IF EXISTS clients_select_member ON wv_be_clients;
CREATE POLICY clients_select_member ON wv_be_clients
  FOR SELECT TO authenticated
  USING (id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

DROP POLICY IF EXISTS clients_update_admin ON wv_be_clients;
CREATE POLICY clients_update_admin ON wv_be_clients
  FOR UPDATE TO authenticated
  USING (id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role = 'admin' AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- wv_be_client_users — users see their own membership rows
DROP POLICY IF EXISTS client_users_select_self ON wv_be_client_users;
CREATE POLICY client_users_select_self ON wv_be_client_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role = 'admin' AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

DROP POLICY IF EXISTS client_users_admin_write ON wv_be_client_users;
CREATE POLICY client_users_admin_write ON wv_be_client_users
  FOR ALL TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role = 'admin' AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- wv_be_subscriptions — read-only for members; only service role mutates (from Stripe webhooks)
DROP POLICY IF EXISTS subscriptions_select_member ON wv_be_subscriptions;
CREATE POLICY subscriptions_select_member ON wv_be_subscriptions
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

DROP POLICY IF EXISTS sub_events_select_member ON wv_be_subscription_events;
CREATE POLICY sub_events_select_member ON wv_be_subscription_events
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- wv_be_voice_profiles — members read; admin/editor write
DROP POLICY IF EXISTS voice_profiles_select_member ON wv_be_voice_profiles;
CREATE POLICY voice_profiles_select_member ON wv_be_voice_profiles
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

DROP POLICY IF EXISTS voice_profiles_write_editor ON wv_be_voice_profiles;
CREATE POLICY voice_profiles_write_editor ON wv_be_voice_profiles
  FOR ALL TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- wv_be_voice_profile_versions — members read history; service role writes
DROP POLICY IF EXISTS voice_versions_select_member ON wv_be_voice_profile_versions;
CREATE POLICY voice_versions_select_member ON wv_be_voice_profile_versions
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- wv_be_voice_corpus — members read; service role writes (embedding generation jobs)
DROP POLICY IF EXISTS voice_corpus_select_member ON wv_be_voice_corpus;
CREATE POLICY voice_corpus_select_member ON wv_be_voice_corpus
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- wv_be_banned_phrases_canon — global table; ALL authenticated SELECT
DROP POLICY IF EXISTS banned_canon_select_all ON wv_be_banned_phrases_canon;
CREATE POLICY banned_canon_select_all ON wv_be_banned_phrases_canon
  FOR SELECT TO authenticated
  USING (active = true);

-- wv_be_client_banned_phrases — members read; admin/editor write
DROP POLICY IF EXISTS client_banned_select_member ON wv_be_client_banned_phrases;
CREATE POLICY client_banned_select_member ON wv_be_client_banned_phrases
  FOR SELECT TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

DROP POLICY IF EXISTS client_banned_write_editor ON wv_be_client_banned_phrases;
CREATE POLICY client_banned_write_editor ON wv_be_client_banned_phrases
  FOR ALL TO authenticated
  USING (client_id IN (
    SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL
  ));

-- ============================================================================
-- ROLLBACK (uncomment to revert this migration)
-- ============================================================================
-- DROP TABLE IF EXISTS wv_be_client_banned_phrases CASCADE;
-- DROP TABLE IF EXISTS wv_be_banned_phrases_canon CASCADE;
-- DROP TABLE IF EXISTS wv_be_voice_corpus CASCADE;
-- DROP TABLE IF EXISTS wv_be_voice_profile_versions CASCADE;
-- DROP TABLE IF EXISTS wv_be_voice_profiles CASCADE;
-- DROP TABLE IF EXISTS wv_be_subscription_events CASCADE;
-- DROP TABLE IF EXISTS wv_be_subscriptions CASCADE;
-- DROP TABLE IF EXISTS wv_be_client_users CASCADE;
-- DROP TABLE IF EXISTS wv_be_clients CASCADE;
