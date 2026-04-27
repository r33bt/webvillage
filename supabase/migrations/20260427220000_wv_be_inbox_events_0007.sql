-- ============================================================================
-- Brand Engine Migration 0007 — Slice 7 Vista Social inbox + per-platform OAuth
-- ============================================================================
-- Per slice-7-vista-inbox-spec-v1.md (LOCKED v1, S218 speedrun: 12 founder Qs accepted)
--
-- 1. wv_be_platform_credentials — per-brand OAuth state (reused by Slice 8 Ayrshare)
-- 2. wv_be_inbox_events — webhook-fed inbox event stream
-- 3. Extend wv_be_templates.template_type CHECK to allow 'reply'
-- 4. Extend wv_be_drafts.source_type CHECK to allow 'reply' + add inbox_event_id col
-- 5. Seed canon LinkedIn reply template
--
-- Token encryption deviation from spec §2.2: storing tokens as text (Node-side
-- AES-256-GCM encryption via be-token-encryption.ts), not pgcrypto.
-- Trade: simpler ops (single env key, no SET app.token_key per session), same security.
-- pgcrypto is available if we revisit.
--
-- Idempotent: IF NOT EXISTS guards. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. wv_be_platform_credentials
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wv_be_platform_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  oauth_access_token_encrypted TEXT NOT NULL,
  oauth_refresh_token_encrypted TEXT,
  oauth_expires_at TIMESTAMPTZ,
  scope TEXT,
  external_workspace_id TEXT,
  last_refreshed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_wv_be_platform_credentials_client_platform
  ON wv_be_platform_credentials(client_id, platform)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_platform_credentials_workspace
  ON wv_be_platform_credentials(external_workspace_id, platform)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_platform_credentials_expiring
  ON wv_be_platform_credentials(oauth_expires_at)
  WHERE deleted_at IS NULL AND oauth_expires_at IS NOT NULL;

ALTER TABLE wv_be_platform_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_credentials_service_all ON wv_be_platform_credentials;
CREATE POLICY platform_credentials_service_all ON wv_be_platform_credentials
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS platform_credentials_select_member ON wv_be_platform_credentials;
CREATE POLICY platform_credentials_select_member ON wv_be_platform_credentials
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT cu.client_id FROM wv_be_client_users cu
      WHERE cu.user_id = auth.uid() AND cu.deleted_at IS NULL
    )
  );

COMMENT ON TABLE wv_be_platform_credentials IS
  'Slice 7+8: per-brand per-platform OAuth credentials. Tokens stored as Node-side AES-256-GCM ciphertext (be-token-encryption.ts). Reused by Slice 8 Ayrshare with platform=ayrshare_*.';

-- ---------------------------------------------------------------------------
-- 2. wv_be_inbox_events
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wv_be_inbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  vista_event_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('mention', 'dm', 'comment', 'reaction')),
  source_handle TEXT,
  source_display_name TEXT,
  source_external_id TEXT,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_excerpt TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  occurred_at TIMESTAMPTZ,

  -- Reply state
  reply_draft_id UUID,
  reply_draft_generated_at TIMESTAMPTZ,
  reply_body_final TEXT,
  reply_sent_at TIMESTAMPTZ,
  vista_reply_id TEXT,
  send_failure_reason TEXT,

  -- Dismiss state
  dismissed_at TIMESTAMPTZ,
  dismissed_by UUID,
  dismiss_reason TEXT,

  CONSTRAINT uq_wv_be_inbox_events_vista_event_id UNIQUE (vista_event_id)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_inbox_events_client_unread
  ON wv_be_inbox_events(client_id, received_at DESC)
  WHERE reply_sent_at IS NULL AND dismissed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_inbox_events_client_all
  ON wv_be_inbox_events(client_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_inbox_events_event_type
  ON wv_be_inbox_events(client_id, event_type, received_at DESC);

ALTER TABLE wv_be_inbox_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inbox_events_service_all ON wv_be_inbox_events;
CREATE POLICY inbox_events_service_all ON wv_be_inbox_events
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS inbox_events_select_member ON wv_be_inbox_events;
CREATE POLICY inbox_events_select_member ON wv_be_inbox_events
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT cu.client_id FROM wv_be_client_users cu
      WHERE cu.user_id = auth.uid() AND cu.deleted_at IS NULL
    )
  );

COMMENT ON TABLE wv_be_inbox_events IS
  'Slice 7: Vista Social inbox events. Webhook-fed. UNIQUE on vista_event_id for replay idempotency.';

-- ---------------------------------------------------------------------------
-- 3. Extend wv_be_templates.template_type to allow 'reply'
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_templates DROP CONSTRAINT IF EXISTS wv_be_templates_template_type_check;
ALTER TABLE wv_be_templates ADD CONSTRAINT wv_be_templates_template_type_check
  CHECK (template_type IN (
    'post', 'long_form_article', 'outreach_opener', 'outreach_followup',
    'connection_request', 'cluster', 'profile_bio', 'featured_tile', 'banner',
    'email',
    'reply'
  ));

-- ---------------------------------------------------------------------------
-- 4. Extend wv_be_drafts.source_type CHECK + add inbox_event_id column
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_drafts DROP CONSTRAINT IF EXISTS wv_be_drafts_source_type_check;
ALTER TABLE wv_be_drafts ADD CONSTRAINT wv_be_drafts_source_type_check
  CHECK (source_type IN (
    'tool_post', 'tool_article', 'tool_bio', 'tool_featured_tile',
    'outreach_message', 'editorial_post', 'editorial_article', 'editorial_email',
    'reply'
  ));

-- inbox_event_id: soft FK (no constraint due to partitioned wv_be_drafts; matches parent_draft_id pattern)
ALTER TABLE wv_be_drafts ADD COLUMN IF NOT EXISTS inbox_event_id UUID;
CREATE INDEX IF NOT EXISTS idx_wv_be_drafts_inbox_event ON wv_be_drafts(inbox_event_id) WHERE inbox_event_id IS NOT NULL;

COMMENT ON COLUMN wv_be_drafts.inbox_event_id IS
  'Slice 7: when source_type=reply, links to wv_be_inbox_events row. NULL otherwise. Soft reference (no FK due to partitioned table).';

-- ---------------------------------------------------------------------------
-- 5. Seed canon LinkedIn reply template
-- ---------------------------------------------------------------------------

INSERT INTO wv_be_templates (client_id, template_type, platform, name, body_template, variables, is_default)
SELECT NULL::uuid, 'reply', 'linkedin', 'WV: LinkedIn reply (short)',
$tpl$You are replying as {brand_name} to a LinkedIn {event_type} from {source_handle}.

VOICE PROFILE:
- Audience: {voice.audience}
- One-word tone: {voice.one_word_tone}
- Register: {voice.register}
- Do: {voice.do_list}
- Don't: {voice.dont_list}
- Never sound like: {voice.never_sound_like}
- Signature phrases (use sparingly): {voice.signature_phrases}

BANNED PHRASES (do not use any of these):
{banned_phrases_canon_list}

INBOUND MESSAGE (from {source_display_name}):
"""
{inbound_message}
"""

INBOUND SENTIMENT HINT (use as context, do not mirror tone if hostile): {sentiment_hint}

FOUNDER HINT (optional steer): {founder_hint}

Write a reply of 1-3 sentences (max 280 chars for comments, max 1000 chars for DMs).
- Reply MUST sound like {brand_name}'s voice profile above
- Do NOT introduce facts, prices, or commitments not present in the inbound or voice profile
- Do NOT use any banned phrase
- Do NOT open with the inbound author's name (sounds robotic on LI)
- Do NOT close with "best regards" or "kind regards" (corporate-cliche category)

Return ONLY the reply body. No quotes, no preamble.$tpl$,
'{"required":["voice","prompt","banned_phrases_canon_list","brand_name","event_type","source_handle","source_display_name","inbound_message"],"optional":["sentiment_hint","founder_hint"]}'::jsonb,
true
WHERE NOT EXISTS (
  SELECT 1 FROM wv_be_templates WHERE name = 'WV: LinkedIn reply (short)' AND is_default = true
);

-- Verify
SELECT
  (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='wv_be_inbox_events')) AS inbox_events_table,
  (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='wv_be_platform_credentials')) AS platform_credentials_table,
  (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='wv_be_drafts' AND column_name='inbox_event_id')) AS drafts_inbox_event_id,
  (SELECT COUNT(*) FROM wv_be_templates WHERE template_type='reply' AND is_default=true) AS canon_reply_templates;
