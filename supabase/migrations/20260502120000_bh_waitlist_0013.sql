-- Migration 0013: BrandHacker waitlist table
-- Rollback: DROP TABLE IF EXISTS bh_waitlist;

CREATE TABLE IF NOT EXISTS bh_waitlist (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  name          text,
  pain_point    text,
  source        text DEFAULT 'website',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bh_waitlist_email ON bh_waitlist (email);
CREATE INDEX IF NOT EXISTS idx_bh_waitlist_created_at ON bh_waitlist (created_at DESC);

ALTER TABLE bh_waitlist ENABLE ROW LEVEL SECURITY;

-- No public access — service role only (insert via API route with service key)
CREATE POLICY bh_waitlist_denied_all ON bh_waitlist FOR ALL USING (false);
