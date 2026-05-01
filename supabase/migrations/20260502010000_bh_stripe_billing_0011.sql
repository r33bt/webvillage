-- BrandHacker Stripe billing tables -- Migration 0011
-- Rollback: DROP TABLE bh_usage_counters; DROP TABLE bh_stripe_events;

CREATE TABLE IF NOT EXISTS bh_stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  client_id uuid REFERENCES wv_be_clients(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_bh_stripe_events_processed ON bh_stripe_events(processed_at DESC);
ALTER TABLE bh_stripe_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY bh_stripe_events_service ON bh_stripe_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS bh_usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES wv_be_clients(id) ON DELETE CASCADE,
  metric text NOT NULL CHECK (metric IN ('drafts','aeo_regenerations','social_publishes','anthropic_tokens_in','anthropic_tokens_out','storage_bytes')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  count bigint NOT NULL DEFAULT 0,
  cap bigint,
  UNIQUE (client_id, metric, period_start)
);
CREATE INDEX IF NOT EXISTS idx_bh_usage_counters_lookup ON bh_usage_counters(client_id, metric, period_end DESC);
ALTER TABLE bh_usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY bh_usage_counters_service ON bh_usage_counters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY bh_usage_counters_select_member ON bh_usage_counters FOR SELECT TO authenticated
  USING (client_id IN (SELECT cu.client_id FROM wv_be_client_users cu WHERE cu.user_id = auth.uid() AND cu.deleted_at IS NULL));
