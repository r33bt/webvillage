-- ============================================================================
-- Brand Engine Migration 0010 — Slice 10 outreach engine
-- ============================================================================
-- Per slice-10-outreach-engine-spec-v1.md (LOCKED v1, S218 speedrun: 12 founder Qs)
--
-- 1. citext extension (case-insensitive email dedup)
-- 2. wv_be_clients: reply_to_email + physical_address
-- 3. wv_be_templates: subject_template
-- 4. wv_be_outreach_sequences: reply_to_email_override + per_domain_daily_cap
-- 5. wv_be_outreach_messages: tracking deltas (recipient_id, resend_message_id, subject, body, open_count, click_count, etc.)
-- 6. NEW wv_be_outreach_recipients (consent-required; UNIQUE per sequence email)
-- 7. NEW wv_be_outreach_webhook_events (idempotency log on resend_event_id)
--
-- Idempotent: IF NOT EXISTS guards. Safe to re-run.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS citext;

-- ---------------------------------------------------------------------------
-- 2. wv_be_clients additions
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_clients
  ADD COLUMN IF NOT EXISTS reply_to_email TEXT,
  ADD COLUMN IF NOT EXISTS physical_address TEXT;

COMMENT ON COLUMN wv_be_clients.reply_to_email IS
  'Slice 10: per-brand Reply-To header for outbound outreach. NULL falls back to hello@webvillage.com.';
COMMENT ON COLUMN wv_be_clients.physical_address IS
  'Slice 10: required for CAN-SPAM email footer. NULL = "address not yet configured" warning at send time.';

-- ---------------------------------------------------------------------------
-- 3. wv_be_templates: subject_template
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_templates
  ADD COLUMN IF NOT EXISTS subject_template TEXT;

COMMENT ON COLUMN wv_be_templates.subject_template IS
  'Slice 10: subject line template (placeholders substituted same as body_template). NULL for non-email templates.';

-- ---------------------------------------------------------------------------
-- 4. wv_be_outreach_sequences augments
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_outreach_sequences
  ADD COLUMN IF NOT EXISTS reply_to_email_override TEXT,
  ADD COLUMN IF NOT EXISTS per_domain_daily_cap INTEGER NOT NULL DEFAULT 50;

-- Status CHECK (existing may not have all states we need)
ALTER TABLE wv_be_outreach_sequences DROP CONSTRAINT IF EXISTS wv_be_outreach_sequences_status_check;
ALTER TABLE wv_be_outreach_sequences ADD CONSTRAINT wv_be_outreach_sequences_status_check
  CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived'));

-- ---------------------------------------------------------------------------
-- 5. wv_be_outreach_messages augments
-- ---------------------------------------------------------------------------

ALTER TABLE wv_be_outreach_messages
  ADD COLUMN IF NOT EXISTS recipient_id UUID,
  ADD COLUMN IF NOT EXISTS resend_message_id TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS sent_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS open_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reply_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delayed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS send_failure_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wv_be_outreach_messages_resend
  ON wv_be_outreach_messages(resend_message_id)
  WHERE resend_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_messages_recipient
  ON wv_be_outreach_messages(recipient_id, step_index);

-- ---------------------------------------------------------------------------
-- 6. NEW: wv_be_outreach_recipients
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wv_be_outreach_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES wv_be_outreach_sequences(id) ON DELETE CASCADE,

  email CITEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  organization TEXT,

  -- Consent (Q10-9 hard requirement)
  recipient_consent BOOLEAN NOT NULL,
  recipient_source TEXT NOT NULL,
  consent_recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'replied', 'opted_out', 'bounced', 'spam', 'completed')),
  opted_out_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  bounced_type TEXT CHECK (bounced_type IN ('soft', 'hard') OR bounced_type IS NULL),
  marked_spam_at TIMESTAMPTZ,

  -- Per-recipient secrets/config
  unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  vars JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Audit
  imported_via TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  imported_by UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE (sequence_id, email)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_recipients_sequence_status
  ON wv_be_outreach_recipients(sequence_id, status);
CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_recipients_client
  ON wv_be_outreach_recipients(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_recipients_email
  ON wv_be_outreach_recipients(email);
CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_recipients_eligible
  ON wv_be_outreach_recipients(sequence_id)
  WHERE status = 'pending'
    AND opted_out_at IS NULL
    AND bounced_at IS NULL
    AND marked_spam_at IS NULL
    AND replied_at IS NULL;

ALTER TABLE wv_be_outreach_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS outreach_recipients_service_all ON wv_be_outreach_recipients;
CREATE POLICY outreach_recipients_service_all ON wv_be_outreach_recipients
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS outreach_recipients_select_member ON wv_be_outreach_recipients;
CREATE POLICY outreach_recipients_select_member ON wv_be_outreach_recipients
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT cu.client_id FROM wv_be_client_users cu
      WHERE cu.user_id = auth.uid() AND cu.deleted_at IS NULL
    )
  );

COMMENT ON TABLE wv_be_outreach_recipients IS
  'Slice 10: per-sequence recipient list with consent fields (Q10-9 hard requirement). Citext email for case-insensitive dedup. RLS by client_id.';

-- ---------------------------------------------------------------------------
-- 7. NEW: wv_be_outreach_webhook_events
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wv_be_outreach_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  resend_message_id TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  process_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_webhook_events_message
  ON wv_be_outreach_webhook_events(resend_message_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_wv_be_outreach_webhook_events_type
  ON wv_be_outreach_webhook_events(event_type, received_at DESC);

ALTER TABLE wv_be_outreach_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS outreach_webhook_events_service_all ON wv_be_outreach_webhook_events;
CREATE POLICY outreach_webhook_events_service_all ON wv_be_outreach_webhook_events
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE wv_be_outreach_webhook_events IS
  'Slice 10: idempotent log of Resend webhook events. UNIQUE on resend_event_id; service-role insert only.';

-- Verify
SELECT
  (SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='citext')) AS citext_installed,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='wv_be_clients' AND column_name IN ('reply_to_email','physical_address')) AS clients_new_cols,
  (SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='wv_be_templates' AND column_name='subject_template')) AS templates_subject,
  (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='wv_be_outreach_recipients')) AS recipients_table,
  (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='wv_be_outreach_webhook_events')) AS webhook_events_table,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='wv_be_outreach_messages' AND column_name IN ('recipient_id','resend_message_id','subject','body','open_count','click_count')) AS messages_new_cols;
