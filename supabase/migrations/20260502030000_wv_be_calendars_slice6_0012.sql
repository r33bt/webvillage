-- ============================================================================
-- Brand Engine Migration 0012 — wv_be_calendars + wv_be_calendar_slots
-- ============================================================================
-- Per brandhacker-product-spec-v1.md Slice 6 + content-calendar-spec-v1.md §2.2
--
-- Tables:
--   1. wv_be_calendars       — one row per (client, calendar window) pair
--   2. wv_be_calendar_slots  — one row per scheduled content piece
--
-- Rollback:
--   DROP TABLE IF EXISTS wv_be_calendar_slots CASCADE;
--   DROP TABLE IF EXISTS wv_be_calendars CASCADE;
--
-- Idempotent: IF NOT EXISTS guards. Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. wv_be_calendars
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wv_be_calendars (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  window_type   text        NOT NULL CHECK (window_type IN ('month', 'quarter')),
  window_start  date        NOT NULL,
  window_end    date        NOT NULL,
  total_slots   integer     NOT NULL,
  generated_at  timestamptz DEFAULT now(),
  -- generated_by / approved_by reference auth.users — wired when auth lands (Slice 7)
  generated_by  uuid,
  source_strategy text,     -- 'monthly_batch_v1' | 'quarterly_plan_v1' | 'cluster_propagation' | 'ad_hoc' | 'dogfood_seed'
  notes_md      text,
  status        text        NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'client_review', 'approved', 'in_flight', 'completed', 'archived')),
  approved_at   timestamptz,
  approved_by   uuid,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (client_id, window_type, window_start)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_calendars_client_window
  ON wv_be_calendars(client_id, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_wv_be_calendars_status
  ON wv_be_calendars(status)
  WHERE status IN ('draft', 'client_review', 'in_flight');

ALTER TABLE wv_be_calendars ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wv_be_calendars' AND policyname = 'wv_be_calendars_service_role'
  ) THEN
    CREATE POLICY wv_be_calendars_service_role ON wv_be_calendars
      TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. wv_be_calendar_slots
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wv_be_calendar_slots (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id         uuid        NOT NULL REFERENCES wv_be_calendars(id) ON DELETE CASCADE,
  client_id           uuid        NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  slot_index          integer     NOT NULL,
  channel             text        NOT NULL
    CHECK (channel IN ('linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'email', 'blog')),
  piece_type          text        NOT NULL
    CHECK (piece_type IN ('post', 'long_form_article', 'outreach_message', 'cluster_member', 'video_short', 'audio_voiceover', 'newsletter')),
  scheduled_for       timestamptz NOT NULL,
  topic_brief         text,
  -- optional FK back-references (wired when upstream tables are confirmed)
  cluster_slot_id     uuid,
  job_id              uuid,
  draft_id            uuid,
  draft_generated_at  timestamptz,
  publish_id          uuid,
  status              text        NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'briefed', 'in_production', 'awaiting_approval', 'approved', 'scheduled', 'published', 'cancelled', 'failed')),
  approval_state      text        DEFAULT 'pending'
    CHECK (approval_state IN ('pending', 'approved', 'rejected', 'revision_requested', 'auto_approved')),
  approval_decided_at timestamptz,
  approval_decided_by uuid,
  approval_notes      text,
  sla_target_at       timestamptz,
  sla_state           text        DEFAULT 'na'
    CHECK (sla_state IN ('green', 'amber', 'red', 'breached', 'na')),
  reschedule_count    integer     DEFAULT 0,
  cancelled_reason    text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE (calendar_id, slot_index)
);

CREATE INDEX IF NOT EXISTS idx_wv_be_calendar_slots_client_time
  ON wv_be_calendar_slots(client_id, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_wv_be_calendar_slots_status
  ON wv_be_calendar_slots(client_id, status)
  WHERE status IN ('briefed', 'in_production', 'awaiting_approval');

CREATE INDEX IF NOT EXISTS idx_wv_be_calendar_slots_sla
  ON wv_be_calendar_slots(sla_state, sla_target_at)
  WHERE sla_state IN ('amber', 'red');

CREATE INDEX IF NOT EXISTS idx_wv_be_calendar_slots_channel_time
  ON wv_be_calendar_slots(channel, scheduled_for);

ALTER TABLE wv_be_calendar_slots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wv_be_calendar_slots' AND policyname = 'wv_be_calendar_slots_service_role'
  ) THEN
    CREATE POLICY wv_be_calendar_slots_service_role ON wv_be_calendar_slots
      TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Dogfood seed — Pat-personal, May 2026 calendar
-- ---------------------------------------------------------------------------
-- Pat tenant UUID: a14e954c-9e18-4af8-ac4f-9102ac168a6a (seeded S216)
-- Seed is idempotent via ON CONFLICT DO NOTHING.

DO $$
DECLARE
  v_client_id uuid := 'a14e954c-9e18-4af8-ac4f-9102ac168a6a';
  v_cal_id    uuid;
BEGIN
  -- Only seed if the client exists
  IF NOT EXISTS (SELECT 1 FROM wv_be_clients WHERE id = v_client_id) THEN
    RAISE NOTICE 'Pat-personal client not found — skipping calendar seed';
    RETURN;
  END IF;

  -- Insert calendar window (month, May 2026)
  INSERT INTO wv_be_calendars (
    id, client_id, window_type, window_start, window_end,
    total_slots, source_strategy, status, notes_md
  ) VALUES (
    'c1000000-0000-0000-0000-000000000001',
    v_client_id,
    'month', '2026-05-01', '2026-05-31',
    8, 'dogfood_seed', 'approved',
    'May 2026 dogfood calendar — seeded by Migration 0012 for Slice 6 demo.'
  ) ON CONFLICT (client_id, window_type, window_start) DO NOTHING;

  -- Fetch the calendar id (may already exist if re-run)
  SELECT id INTO v_cal_id
    FROM wv_be_calendars
   WHERE client_id = v_client_id
     AND window_type = 'month'
     AND window_start = '2026-05-01';

  -- Slots (8 total, across LinkedIn/X/Instagram/Blog)
  INSERT INTO wv_be_calendar_slots (
    calendar_id, client_id, slot_index, channel, piece_type,
    scheduled_for, topic_brief, status, sla_state
  ) VALUES
    (v_cal_id, v_client_id, 0, 'linkedin', 'post',
     '2026-05-05 09:00:00+08', 'Why Islamic fintech founders still distrust AI-generated compliance copy — and what that says about the trust gap in frontier markets.',
     'briefed', 'na'),
    (v_cal_id, v_client_id, 1, 'x', 'post',
     '2026-05-07 08:00:00+08', 'Thread: 5 things that break when a regulated fintech brand hands its social voice to an LLM with no guardrails.',
     'planned', 'na'),
    (v_cal_id, v_client_id, 2, 'blog', 'long_form_article',
     '2026-05-09 10:00:00+08', 'Brand consistency in regulated finance — a practitioner playbook for founders who care about what AI says about them.',
     'in_production', 'green'),
    (v_cal_id, v_client_id, 3, 'instagram', 'post',
     '2026-05-12 11:00:00+08', 'The /llms.txt moment — why every brand needs an AI-facing factsheet before the next model training run.',
     'planned', 'na'),
    (v_cal_id, v_client_id, 4, 'linkedin', 'post',
     '2026-05-15 09:00:00+08', 'We ran BrandHacker on our own four brands before charging anyone. Here is what we found.',
     'awaiting_approval', 'amber'),
    (v_cal_id, v_client_id, 5, 'x', 'post',
     '2026-05-19 08:00:00+08', 'Mini-thread: the audit log your brand voice actually needs (it is not a spreadsheet).',
     'planned', 'na'),
    (v_cal_id, v_client_id, 6, 'blog', 'long_form_article',
     '2026-05-22 10:00:00+08', 'What ChatGPT says about your brand when you are not looking — and how to fix it.',
     'planned', 'na'),
    (v_cal_id, v_client_id, 7, 'instagram', 'post',
     '2026-05-26 11:00:00+08', 'Case study drop: how a V22 brand consolidated voice, templates, and AEO canon onto a single source of record.',
     'planned', 'na')
  ON CONFLICT (calendar_id, slot_index) DO NOTHING;

END $$;
