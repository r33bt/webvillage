-- ============================================================================
-- Brand Engine — Migration 0002 (M4 launch — content + planning + audit + MVs)
-- Spec: docs/brand-engine-data-model-v1.md (S209, all 8 founder Qs locked)
-- Database: Supabase EVA instance (hzqbsixlintiairmabbg)
-- Combines Migrations 0002 + 0003 + 0004 from spec §8 — single file to keep
-- forward-FK ordering coherent (drafts → clusters/outreach_sequences are
-- inter-dependent so writing them in one file is cleaner than splitting).
--
-- Tables in this migration: 13
--   Content surface:          brand_assets, templates, drafts (partitioned),
--                             scores, publishes
--   Editorial planning:       clusters, cluster_slots
--   Outreach:                 outreach_sequences, outreach_messages
--   Profile management:       profile_audits
--   Audit:                    audit_log
--   Materialized views:       brand_health_monthly, client_metrics
--
-- Plus: 7 monthly partitions for drafts (Apr 2026 through Oct 2026); RLS on
-- every table; member-scoped read policies; admin/editor write policies.
--
-- Reversible: full DROP block at bottom (commented).
-- ============================================================================

-- ─── 11. wv_be_brand_assets ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_brand_assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  asset_type      text NOT NULL CHECK (asset_type IN (
                    'logo_primary','logo_secondary','palette',
                    'font_primary','font_secondary',
                    'photo_headshot','photo_lifestyle',
                    'banner_li','banner_x','banner_fb',
                    'lora_image','style_guide_pdf'
                  )),
  storage_path    text NOT NULL,
  file_size_bytes bigint,
  mime_type       text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  uploaded_by     uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- One active per client per asset_type for "single-slot" types; multiple allowed for headshots/lifestyle/secondary.
CREATE UNIQUE INDEX IF NOT EXISTS uq_wv_be_brand_assets_single_slot
  ON wv_be_brand_assets(client_id, asset_type)
  WHERE deleted_at IS NULL
    AND asset_type IN ('logo_primary','palette','font_primary','banner_li','banner_x','banner_fb','lora_image');

CREATE INDEX IF NOT EXISTS idx_wv_be_brand_assets_client_type
  ON wv_be_brand_assets(client_id, asset_type) WHERE deleted_at IS NULL;

ALTER TABLE wv_be_brand_assets ENABLE ROW LEVEL SECURITY;

-- ─── 12. wv_be_templates ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_templates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid REFERENCES wv_be_clients(id) ON DELETE CASCADE,  -- NULL = WV-default template
  template_type        text NOT NULL CHECK (template_type IN (
                         'post','long_form_article','outreach_opener','outreach_followup',
                         'connection_request','cluster','profile_bio','featured_tile','banner','email'
                       )),
  platform             text CHECK (platform IS NULL OR platform IN (
                         'linkedin','instagram','x','tiktok','facebook','email'
                       )),
  name                 text NOT NULL,
  body_template        text NOT NULL,
  variables            jsonb NOT NULL DEFAULT '{}'::jsonb,
  cluster_definition   jsonb,
  is_default           boolean NOT NULL DEFAULT false,
  source_template_id   uuid REFERENCES wv_be_templates(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);

CREATE INDEX IF NOT EXISTS idx_wv_be_templates_client_type
  ON wv_be_templates(client_id, template_type) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_templates_defaults
  ON wv_be_templates(template_type, platform) WHERE client_id IS NULL AND deleted_at IS NULL;

ALTER TABLE wv_be_templates ENABLE ROW LEVEL SECURITY;

-- ─── 13. wv_be_clusters ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_clusters (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  cluster_template_id   uuid REFERENCES wv_be_templates(id),
  arc_type              text CHECK (arc_type IS NULL OR arc_type IN ('linear','episodic','evergreen')),
  total_slots           integer NOT NULL CHECK (total_slots > 0),
  start_date            date,
  end_date              date,
  status                text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','active','completed','archived')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);

CREATE INDEX IF NOT EXISTS idx_wv_be_clusters_client_status
  ON wv_be_clusters(client_id, status) WHERE deleted_at IS NULL;

ALTER TABLE wv_be_clusters ENABLE ROW LEVEL SECURITY;

-- ─── 14. wv_be_outreach_sequences ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_outreach_sequences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  name            text NOT NULL,
  channel         text NOT NULL CHECK (channel IN ('linkedin_dm','email','x_dm')),
  cadence_days    integer[] NOT NULL DEFAULT '{}'::integer[],
  template_ids    uuid[] NOT NULL DEFAULT '{}'::uuid[],
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed','archived')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_sequences_client
  ON wv_be_outreach_sequences(client_id, status) WHERE deleted_at IS NULL;

ALTER TABLE wv_be_outreach_sequences ENABLE ROW LEVEL SECURITY;

-- ─── 15. wv_be_drafts (HOT TABLE — partitioned monthly by generated_at) ──────

CREATE TABLE IF NOT EXISTS wv_be_drafts (
  id                       uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id                uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  author_user_id           uuid REFERENCES auth.users(id),
  source_type              text NOT NULL CHECK (source_type IN (
                             'tool_post','tool_article','tool_bio','tool_featured_tile',
                             'outreach_message',
                             'editorial_post','editorial_article','editorial_email'
                           )),
  template_id              uuid REFERENCES wv_be_templates(id),
  voice_profile_version    integer NOT NULL,
  prompt_text              text NOT NULL,
  draft_body               text NOT NULL,
  platform                 text,
  language                 text NOT NULL DEFAULT 'en',
  cluster_id               uuid REFERENCES wv_be_clusters(id),
  cluster_slot             integer,
  outreach_sequence_id     uuid REFERENCES wv_be_outreach_sequences(id),
  outreach_step            integer,
  status                   text NOT NULL DEFAULT 'generated' CHECK (status IN (
                             'generated','edited','approved','rejected','published','archived'
                           )),
  generation_model         text NOT NULL,
  generation_tokens_in     integer,
  generation_tokens_out    integer,
  generation_cost_cents    integer,
  generated_at             timestamptz NOT NULL DEFAULT now(),
  edited_at                timestamptz,
  edited_by                uuid REFERENCES auth.users(id),
  PRIMARY KEY (id, generated_at)
) PARTITION BY RANGE (generated_at);

-- Monthly partitions covering today (2026-04) through Oct 2026.
-- Beyond Oct, automation creates partitions ~30 days ahead (Stage 1 M3 work).
CREATE TABLE IF NOT EXISTS wv_be_drafts_2026_04 PARTITION OF wv_be_drafts FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS wv_be_drafts_2026_05 PARTITION OF wv_be_drafts FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS wv_be_drafts_2026_06 PARTITION OF wv_be_drafts FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS wv_be_drafts_2026_07 PARTITION OF wv_be_drafts FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS wv_be_drafts_2026_08 PARTITION OF wv_be_drafts FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS wv_be_drafts_2026_09 PARTITION OF wv_be_drafts FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS wv_be_drafts_2026_10 PARTITION OF wv_be_drafts FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE INDEX IF NOT EXISTS idx_wv_be_drafts_client_time
  ON wv_be_drafts(client_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_drafts_cluster
  ON wv_be_drafts(cluster_id) WHERE cluster_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_drafts_status
  ON wv_be_drafts(client_id, status) WHERE status IN ('generated','edited');

ALTER TABLE wv_be_drafts ENABLE ROW LEVEL SECURITY;

-- ─── 16. wv_be_scores (5-pillar score per draft, 1:1) ────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_scores (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id             uuid NOT NULL,
  draft_generated_at   timestamptz NOT NULL,
  client_id            uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  scored_at            timestamptz NOT NULL DEFAULT now(),
  scoring_model        text NOT NULL,                   -- 'claude-haiku-4-5' default (Q5 LOCKED S209)
  scores               jsonb NOT NULL,                  -- {provenance,specificity,structure,voice,utility,overall: 0-10}
  flags                jsonb NOT NULL DEFAULT '[]'::jsonb,
  banned_phrase_hits   text[] NOT NULL DEFAULT '{}'::text[],
  passes_threshold     boolean NOT NULL,                -- overall ≥ 7.0 default (Q6 LOCKED S209)
  rubric_version       integer NOT NULL DEFAULT 1,
  FOREIGN KEY (draft_id, draft_generated_at) REFERENCES wv_be_drafts(id, generated_at) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wv_be_scores_client_time
  ON wv_be_scores(client_id, scored_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_scores_failing
  ON wv_be_scores(client_id, scored_at DESC) WHERE passes_threshold = false;

CREATE INDEX IF NOT EXISTS idx_wv_be_scores_banned_hits
  ON wv_be_scores USING gin(banned_phrase_hits) WHERE array_length(banned_phrase_hits, 1) > 0;

ALTER TABLE wv_be_scores ENABLE ROW LEVEL SECURITY;

-- ─── 17. wv_be_publishes ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_publishes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id            uuid NOT NULL,
  draft_generated_at  timestamptz NOT NULL,
  client_id           uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  platform            text NOT NULL CHECK (platform IN ('linkedin','instagram','x','tiktok','facebook','email')),
  external_post_id    text,
  publish_provider    text NOT NULL CHECK (publish_provider IN ('vista_social','ayrshare','manual_paste')),  -- Q7 LOCKED S209
  scheduled_for       timestamptz,
  published_at        timestamptz,
  status              text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','published','failed','cancelled')),
  failure_reason      text,
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (draft_id, draft_generated_at) REFERENCES wv_be_drafts(id, generated_at)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_publishes_client_time
  ON wv_be_publishes(client_id, published_at DESC) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_wv_be_publishes_scheduled
  ON wv_be_publishes(scheduled_for) WHERE status = 'scheduled';

ALTER TABLE wv_be_publishes ENABLE ROW LEVEL SECURITY;

-- ─── 18. wv_be_cluster_slots ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_cluster_slots (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id             uuid NOT NULL REFERENCES wv_be_clusters(id) ON DELETE CASCADE,
  slot_index             integer NOT NULL,
  slot_topic             text,
  slot_arc_role          text CHECK (slot_arc_role IS NULL OR slot_arc_role IN ('setup','development','payoff','evergreen')),
  scheduled_for          timestamptz,
  draft_id               uuid,                                                -- denormalized FK across partitioned drafts
  draft_generated_at     timestamptz,
  publish_id             uuid REFERENCES wv_be_publishes(id),
  status                 text NOT NULL DEFAULT 'empty' CHECK (status IN ('empty','planned','drafted','scheduled','published')),
  UNIQUE (cluster_id, slot_index)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_cluster_slots_cluster
  ON wv_be_cluster_slots(cluster_id, slot_index);

ALTER TABLE wv_be_cluster_slots ENABLE ROW LEVEL SECURITY;

-- ─── 19. wv_be_outreach_messages ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wv_be_outreach_messages (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id             uuid REFERENCES wv_be_outreach_sequences(id),
  client_id               uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  recipient_handle        text NOT NULL,
  recipient_name          text,
  recipient_company       text,
  step_index              integer,
  draft_id                uuid,                                               -- denormalized FK across partitioned drafts
  draft_generated_at      timestamptz,
  scheduled_for           timestamptz,
  sent_at                 timestamptz,
  channel                 text NOT NULL CHECK (channel IN ('linkedin_dm','email','x_dm')),
  external_message_id     text,
  response_status         text CHECK (response_status IS NULL OR response_status IN (
                            'no_response','replied_positive','replied_negative','replied_neutral','bounced','opted_out'
                          )),
  response_received_at    timestamptz,
  response_text           text,
  metadata                jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_messages_client_time
  ON wv_be_outreach_messages(client_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_messages_sequence
  ON wv_be_outreach_messages(sequence_id, step_index);

CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_messages_response
  ON wv_be_outreach_messages(response_status, sent_at) WHERE response_status IS NOT NULL;

ALTER TABLE wv_be_outreach_messages ENABLE ROW LEVEL SECURITY;

-- ─── 20. wv_be_profile_audits (Pr1 — E-E-A-T per platform per client) ───────

CREATE TABLE IF NOT EXISTS wv_be_profile_audits (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                     uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  platform                      text NOT NULL CHECK (platform IN ('linkedin','instagram','x','tiktok')),
  audited_at                    timestamptz NOT NULL DEFAULT now(),
  scrape_provider               text NOT NULL CHECK (scrape_provider IN ('apify','phantombuster','manual','oauth_self')),
  raw_profile_data              jsonb,
  scores                        jsonb NOT NULL,
  flags                         jsonb NOT NULL DEFAULT '[]'::jsonb,
  drift_from_voice_profile      numeric(4,3),
  recommendations               text[]
);

CREATE INDEX IF NOT EXISTS idx_wv_be_profile_audits_client_platform
  ON wv_be_profile_audits(client_id, platform, audited_at DESC);

ALTER TABLE wv_be_profile_audits ENABLE ROW LEVEL SECURITY;

-- ─── 21. wv_be_audit_log (mutation log on sensitive tables) ─────────────────

CREATE TABLE IF NOT EXISTS wv_be_audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid REFERENCES wv_be_clients(id) ON DELETE SET NULL,
  actor_user_id   uuid REFERENCES auth.users(id),
  actor_type      text NOT NULL CHECK (actor_type IN ('user','system','webhook','reconciliation_job')),
  action          text NOT NULL,
  target_table    text,
  target_id       uuid,
  before_state    jsonb,
  after_state     jsonb,
  ip_address      inet,
  user_agent      text,
  occurred_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wv_be_audit_log_client_time
  ON wv_be_audit_log(client_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_audit_log_action
  ON wv_be_audit_log(action, occurred_at DESC);

ALTER TABLE wv_be_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MATERIALIZED VIEWS
-- ============================================================================

-- Brand health monthly — powers B7 dashboard. Refresh nightly via pg_cron.
CREATE MATERIALIZED VIEW IF NOT EXISTS wv_be_brand_health_monthly AS
SELECT
  s.client_id,
  date_trunc('month', s.scored_at) AS month,
  count(*) AS draft_count,
  avg((s.scores->>'provenance')::numeric)  AS avg_provenance,
  avg((s.scores->>'specificity')::numeric) AS avg_specificity,
  avg((s.scores->>'structure')::numeric)   AS avg_structure,
  avg((s.scores->>'voice')::numeric)       AS avg_voice,
  avg((s.scores->>'utility')::numeric)     AS avg_utility,
  avg((s.scores->>'overall')::numeric)     AS avg_overall,
  count(*) FILTER (WHERE NOT s.passes_threshold) AS failing_draft_count,
  count(*) FILTER (WHERE array_length(s.banned_phrase_hits, 1) > 0) AS banned_phrase_hit_count
FROM wv_be_scores s
WHERE s.scored_at >= now() - interval '13 months'
GROUP BY s.client_id, date_trunc('month', s.scored_at)
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wv_be_brand_health_monthly_pk
  ON wv_be_brand_health_monthly(client_id, month);

-- Per-client snapshot for admin dash + churn signals.
CREATE MATERIALIZED VIEW IF NOT EXISTS wv_be_client_metrics AS
SELECT
  c.id AS client_id,
  c.display_name,
  c.current_tier,
  c.lifecycle_stage,
  (
    SELECT count(*) FROM wv_be_client_users u
    WHERE u.client_id = c.id AND u.accepted_at IS NOT NULL AND u.deleted_at IS NULL
  ) AS active_seats,
  (
    SELECT count(*) FROM wv_be_drafts d
    WHERE d.client_id = c.id AND d.generated_at >= now() - interval '30 days'
  ) AS drafts_trailing_30d,
  (
    SELECT avg((s.scores->>'overall')::numeric) FROM wv_be_scores s
    WHERE s.client_id = c.id AND s.scored_at >= now() - interval '30 days'
  ) AS avg_overall_trailing_30d,
  (
    SELECT max(p.published_at) FROM wv_be_publishes p
    WHERE p.client_id = c.id AND p.status = 'published'
  ) AS last_publish_at
FROM wv_be_clients c
WHERE c.deleted_at IS NULL
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wv_be_client_metrics_pk
  ON wv_be_client_metrics(client_id);

-- ============================================================================
-- RLS POLICIES (member SELECT; admin/editor INSERT/UPDATE/DELETE)
-- Service role bypasses RLS for orchestration jobs.
-- ============================================================================

-- Brand assets
DROP POLICY IF EXISTS brand_assets_select_member ON wv_be_brand_assets;
CREATE POLICY brand_assets_select_member ON wv_be_brand_assets FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

DROP POLICY IF EXISTS brand_assets_write_editor ON wv_be_brand_assets;
CREATE POLICY brand_assets_write_editor ON wv_be_brand_assets FOR ALL TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Templates — member reads (own + WV defaults); admin/editor writes own
DROP POLICY IF EXISTS templates_select_member_or_default ON wv_be_templates;
CREATE POLICY templates_select_member_or_default ON wv_be_templates FOR SELECT TO authenticated
  USING (
    client_id IS NULL
    OR client_id IN (SELECT client_id FROM wv_be_client_users
      WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL)
  );

DROP POLICY IF EXISTS templates_write_editor ON wv_be_templates;
CREATE POLICY templates_write_editor ON wv_be_templates FOR ALL TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Clusters
DROP POLICY IF EXISTS clusters_select_member ON wv_be_clusters;
CREATE POLICY clusters_select_member ON wv_be_clusters FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

DROP POLICY IF EXISTS clusters_write_editor ON wv_be_clusters;
CREATE POLICY clusters_write_editor ON wv_be_clusters FOR ALL TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Outreach sequences
DROP POLICY IF EXISTS outreach_sequences_select_member ON wv_be_outreach_sequences;
CREATE POLICY outreach_sequences_select_member ON wv_be_outreach_sequences FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

DROP POLICY IF EXISTS outreach_sequences_write_editor ON wv_be_outreach_sequences;
CREATE POLICY outreach_sequences_write_editor ON wv_be_outreach_sequences FOR ALL TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Drafts (append-only at app layer; RLS reads only)
DROP POLICY IF EXISTS drafts_select_member ON wv_be_drafts;
CREATE POLICY drafts_select_member ON wv_be_drafts FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

DROP POLICY IF EXISTS drafts_insert_editor ON wv_be_drafts;
CREATE POLICY drafts_insert_editor ON wv_be_drafts FOR INSERT TO authenticated
  WITH CHECK (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

DROP POLICY IF EXISTS drafts_update_editor ON wv_be_drafts;
CREATE POLICY drafts_update_editor ON wv_be_drafts FOR UPDATE TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Scores
DROP POLICY IF EXISTS scores_select_member ON wv_be_scores;
CREATE POLICY scores_select_member ON wv_be_scores FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Publishes
DROP POLICY IF EXISTS publishes_select_member ON wv_be_publishes;
CREATE POLICY publishes_select_member ON wv_be_publishes FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

DROP POLICY IF EXISTS publishes_write_editor ON wv_be_publishes;
CREATE POLICY publishes_write_editor ON wv_be_publishes FOR ALL TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Cluster slots
DROP POLICY IF EXISTS cluster_slots_select_member ON wv_be_cluster_slots;
CREATE POLICY cluster_slots_select_member ON wv_be_cluster_slots FOR SELECT TO authenticated
  USING (cluster_id IN (
    SELECT id FROM wv_be_clusters WHERE client_id IN (
      SELECT client_id FROM wv_be_client_users
      WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL
    )
  ));

DROP POLICY IF EXISTS cluster_slots_write_editor ON wv_be_cluster_slots;
CREATE POLICY cluster_slots_write_editor ON wv_be_cluster_slots FOR ALL TO authenticated
  USING (cluster_id IN (
    SELECT id FROM wv_be_clusters WHERE client_id IN (
      SELECT client_id FROM wv_be_client_users
      WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL
    )
  ));

-- Outreach messages
DROP POLICY IF EXISTS outreach_messages_select_member ON wv_be_outreach_messages;
CREATE POLICY outreach_messages_select_member ON wv_be_outreach_messages FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

DROP POLICY IF EXISTS outreach_messages_write_editor ON wv_be_outreach_messages;
CREATE POLICY outreach_messages_write_editor ON wv_be_outreach_messages FOR ALL TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role IN ('admin','editor') AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Profile audits — read by members
DROP POLICY IF EXISTS profile_audits_select_member ON wv_be_profile_audits;
CREATE POLICY profile_audits_select_member ON wv_be_profile_audits FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- Audit log — read by admin only
DROP POLICY IF EXISTS audit_log_select_admin ON wv_be_audit_log;
CREATE POLICY audit_log_select_admin ON wv_be_audit_log FOR SELECT TO authenticated
  USING (client_id IN (SELECT client_id FROM wv_be_client_users
    WHERE user_id = auth.uid() AND role = 'admin' AND deleted_at IS NULL AND accepted_at IS NOT NULL));

-- ============================================================================
-- ROLLBACK (uncomment to revert this migration)
-- ============================================================================
-- DROP MATERIALIZED VIEW IF EXISTS wv_be_client_metrics CASCADE;
-- DROP MATERIALIZED VIEW IF EXISTS wv_be_brand_health_monthly CASCADE;
-- DROP TABLE IF EXISTS wv_be_audit_log CASCADE;
-- DROP TABLE IF EXISTS wv_be_profile_audits CASCADE;
-- DROP TABLE IF EXISTS wv_be_outreach_messages CASCADE;
-- DROP TABLE IF EXISTS wv_be_cluster_slots CASCADE;
-- DROP TABLE IF EXISTS wv_be_publishes CASCADE;
-- DROP TABLE IF EXISTS wv_be_scores CASCADE;
-- DROP TABLE IF EXISTS wv_be_drafts CASCADE;
-- DROP TABLE IF EXISTS wv_be_outreach_sequences CASCADE;
-- DROP TABLE IF EXISTS wv_be_clusters CASCADE;
-- DROP TABLE IF EXISTS wv_be_templates CASCADE;
-- DROP TABLE IF EXISTS wv_be_brand_assets CASCADE;
