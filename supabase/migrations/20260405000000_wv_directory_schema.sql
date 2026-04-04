-- ============================================================================
-- WebVillage Directory Schema — v1.0
-- Migration: 20260405000000_wv_directory_schema
-- Database: Supabase EVA instance (hzqbsixlintiairmabbg)
-- Prefix: wv_
-- ============================================================================

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- wv_directories: each chamber / association / trade body is one row
CREATE TABLE IF NOT EXISTS wv_directories (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text UNIQUE NOT NULL,           -- 'italcham-my', 'dancham-my'
  name                text NOT NULL,
  description         text,
  country             text,                            -- ISO 3166-1 alpha-2
  type                text NOT NULL DEFAULT 'chamber', -- chamber | association | trade_body | other
  plan_tier           text NOT NULL DEFAULT 'starter', -- starter | professional | enterprise
  white_label         boolean NOT NULL DEFAULT false,
  network_opt_in      boolean NOT NULL DEFAULT true,   -- appear in webvillage.com meta-directory
  api_key_enabled     boolean NOT NULL DEFAULT false,
  owner_user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  logo_url            text,
  accent_color        text,                            -- hex e.g. '#006400'
  domain              text,                            -- custom domain if on managed tier
  glueup_org_id       text,                            -- for Glue Up sync connector
  listing_count       integer NOT NULL DEFAULT 0,      -- denormalised for stats endpoint
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- wv_categories: per-directory category tree
CREATE TABLE IF NOT EXISTS wv_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id    uuid NOT NULL REFERENCES wv_directories(id) ON DELETE CASCADE,
  slug            text NOT NULL,
  name            text NOT NULL,
  description     text,
  icon            text,              -- emoji or icon name
  color           text,              -- hex
  parent_id       uuid REFERENCES wv_categories(id) ON DELETE SET NULL,
  display_order   integer NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  item_count      integer NOT NULL DEFAULT 0,  -- denormalised
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (directory_id, slug)
);

-- wv_listings: a member company / organisation within a directory
CREATE TABLE IF NOT EXISTS wv_listings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id        uuid NOT NULL REFERENCES wv_directories(id) ON DELETE CASCADE,
  slug                text NOT NULL,
  name                text NOT NULL,
  tagline             text,
  description         text,
  website             text,
  email               text,
  phone               text,
  address             text,
  city                text,
  state               text,
  country             text,              -- ISO 3166-1 alpha-2
  lat                 numeric(10,7),
  lng                 numeric(10,7),
  logo_url            text,
  featured_image_url  text,
  trade_sectors       text[] NOT NULL DEFAULT '{}',  -- normalised sector taxonomy
  languages           text[] NOT NULL DEFAULT '{}',  -- languages spoken
  founded_year        integer,
  employee_range      text,              -- '1-10' | '11-50' | '51-200' | '201-500' | '500+'
  profile_status      text NOT NULL DEFAULT 'unclaimed',
                      -- unclaimed | claimed | removed | opted_out
  claimed_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at          timestamptz,
  featured            boolean NOT NULL DEFAULT false,
  tier                text NOT NULL DEFAULT 'free',   -- free | starter | pro | enterprise
  social_links        jsonb NOT NULL DEFAULT '{}',    -- { linkedin, twitter, facebook, instagram }
  custom_fields       jsonb NOT NULL DEFAULT '{}',    -- directory-specific fields
  opted_in_email      boolean NOT NULL DEFAULT false,
  consent_timestamp   timestamptz,
  consent_ip_hash     text,
  consent_form_version text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (directory_id, slug)
);

-- wv_listing_categories: many-to-many listings ↔ categories
CREATE TABLE IF NOT EXISTS wv_listing_categories (
  listing_id    uuid NOT NULL REFERENCES wv_listings(id) ON DELETE CASCADE,
  category_id   uuid NOT NULL REFERENCES wv_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, category_id)
);

-- wv_contact_clicks: analytics — tracks when a visitor clicks email/phone/website
CREATE TABLE IF NOT EXISTS wv_contact_clicks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid NOT NULL REFERENCES wv_listings(id) ON DELETE CASCADE,
  directory_id    uuid NOT NULL REFERENCES wv_directories(id) ON DELETE CASCADE,
  click_type      text NOT NULL,  -- email | phone | website | linkedin | directions
  visitor_page    text,
  country_code    text,
  clicked_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- ACCESS CONTROL
-- ============================================================================

-- wv_api_keys: per-directory API keys for Mode 3 (REST API) access
CREATE TABLE IF NOT EXISTS wv_api_keys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id    uuid NOT NULL REFERENCES wv_directories(id) ON DELETE CASCADE,
  key_hash        text UNIQUE NOT NULL,   -- SHA-256 hash — raw key never stored
  key_prefix      text NOT NULL,          -- first 12 chars for display: 'wvk_abc123...'
  label           text,
  scopes          text[] NOT NULL DEFAULT ARRAY['read'],  -- read | write | admin
  last_used_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at      timestamptz             -- NULL = active
);

-- ============================================================================
-- SYNC / INTEGRATIONS
-- ============================================================================

-- wv_sync_logs: tracks Glue Up / CSV import history per directory
CREATE TABLE IF NOT EXISTS wv_sync_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id        uuid NOT NULL REFERENCES wv_directories(id) ON DELETE CASCADE,
  source              text NOT NULL,  -- glueup | csv | manual | api
  status              text NOT NULL,  -- running | completed | failed
  records_processed   integer NOT NULL DEFAULT 0,
  records_created     integer NOT NULL DEFAULT 0,
  records_updated     integer NOT NULL DEFAULT 0,
  records_skipped     integer NOT NULL DEFAULT 0,
  error_message       text,
  triggered_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz
);

-- ============================================================================
-- NETWORK LAYER (Phase 3 schema — tables exist, API routes not yet built)
-- ============================================================================

-- wv_introductions: C2C cross-chamber B2B introduction requests
CREATE TABLE IF NOT EXISTS wv_introductions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_listing_id     uuid REFERENCES wv_listings(id) ON DELETE SET NULL,
  to_listing_id       uuid REFERENCES wv_listings(id) ON DELETE SET NULL,
  from_directory_id   uuid NOT NULL REFERENCES wv_directories(id) ON DELETE CASCADE,
  to_directory_id     uuid NOT NULL REFERENCES wv_directories(id) ON DELETE CASCADE,
  message             text,
  requester_name      text,
  requester_email     text NOT NULL,
  status              text NOT NULL DEFAULT 'pending',
                      -- pending | accepted | declined | expired
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE wv_directories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wv_categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wv_listings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wv_listing_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE wv_contact_clicks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wv_api_keys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wv_sync_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE wv_introductions       ENABLE ROW LEVEL SECURITY;

-- Public read — directories
CREATE POLICY "Public read directories"
  ON wv_directories FOR SELECT USING (true);

-- Public read — active listings only
CREATE POLICY "Public read active listings"
  ON wv_listings FOR SELECT
  USING (profile_status NOT IN ('removed', 'opted_out'));

-- Public read — active categories
CREATE POLICY "Public read active categories"
  ON wv_categories FOR SELECT USING (active = true);

-- Public read — listing_categories (needed for joins on public reads)
CREATE POLICY "Public read listing_categories"
  ON wv_listing_categories FOR SELECT USING (true);

-- Anyone can insert contact clicks (no auth needed for analytics)
CREATE POLICY "Anyone insert contact clicks"
  ON wv_contact_clicks FOR INSERT WITH CHECK (true);

-- Directory owners — full control over their directory
CREATE POLICY "Owner manages directory"
  ON wv_directories FOR ALL
  USING (auth.uid() = owner_user_id);

-- Directory owners — manage their listings
CREATE POLICY "Owner manages listings"
  ON wv_listings FOR ALL
  USING (
    directory_id IN (
      SELECT id FROM wv_directories WHERE owner_user_id = auth.uid()
    )
  );

-- Directory owners — manage their categories
CREATE POLICY "Owner manages categories"
  ON wv_categories FOR ALL
  USING (
    directory_id IN (
      SELECT id FROM wv_directories WHERE owner_user_id = auth.uid()
    )
  );

-- Claimed users can update their own listing
CREATE POLICY "Claimed user updates own listing"
  ON wv_listings FOR UPDATE
  USING (claimed_by = auth.uid());

-- Directory owners — manage API keys
CREATE POLICY "Owner manages api keys"
  ON wv_api_keys FOR ALL
  USING (
    directory_id IN (
      SELECT id FROM wv_directories WHERE owner_user_id = auth.uid()
    )
  );

-- Directory owners — read sync logs
CREATE POLICY "Owner reads sync logs"
  ON wv_sync_logs FOR SELECT
  USING (
    directory_id IN (
      SELECT id FROM wv_directories WHERE owner_user_id = auth.uid()
    )
  );

-- Directory owners — read introductions involving their directories
CREATE POLICY "Owner reads introductions"
  ON wv_introductions FOR SELECT
  USING (
    from_directory_id IN (SELECT id FROM wv_directories WHERE owner_user_id = auth.uid())
    OR
    to_directory_id IN (SELECT id FROM wv_directories WHERE owner_user_id = auth.uid())
  );

-- Anyone can insert an introduction request (public C2C form)
CREATE POLICY "Anyone insert introduction"
  ON wv_introductions FOR INSERT WITH CHECK (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_wv_listings_directory_id
  ON wv_listings (directory_id);

CREATE INDEX IF NOT EXISTS idx_wv_listings_profile_status
  ON wv_listings (directory_id, profile_status);

CREATE INDEX IF NOT EXISTS idx_wv_listings_featured
  ON wv_listings (directory_id, featured DESC);

CREATE INDEX IF NOT EXISTS idx_wv_listings_slug
  ON wv_listings (directory_id, slug);

CREATE INDEX IF NOT EXISTS idx_wv_listings_trade_sectors
  ON wv_listings USING GIN (trade_sectors);

CREATE INDEX IF NOT EXISTS idx_wv_listings_search
  ON wv_listings USING GIN (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(description, ''))
  );

CREATE INDEX IF NOT EXISTS idx_wv_categories_directory_id
  ON wv_categories (directory_id);

CREATE INDEX IF NOT EXISTS idx_wv_contact_clicks_listing_id
  ON wv_contact_clicks (listing_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_contact_clicks_directory_id
  ON wv_contact_clicks (directory_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_api_keys_hash
  ON wv_api_keys (key_hash) WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wv_sync_logs_directory_id
  ON wv_sync_logs (directory_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_introductions_from_dir
  ON wv_introductions (from_directory_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wv_introductions_to_dir
  ON wv_introductions (to_directory_id, created_at DESC);

-- ============================================================================
-- TRIGGERS — keep updated_at current
-- ============================================================================

CREATE OR REPLACE FUNCTION update_wv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wv_directories_updated_at
  BEFORE UPDATE ON wv_directories
  FOR EACH ROW EXECUTE FUNCTION update_wv_updated_at();

CREATE TRIGGER trg_wv_listings_updated_at
  BEFORE UPDATE ON wv_listings
  FOR EACH ROW EXECUTE FUNCTION update_wv_updated_at();

CREATE TRIGGER trg_wv_introductions_updated_at
  BEFORE UPDATE ON wv_introductions
  FOR EACH ROW EXECUTE FUNCTION update_wv_updated_at();

-- ============================================================================
-- LISTING COUNT DENORMALISATION
-- Keep wv_directories.listing_count in sync automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_directory_listing_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wv_directories
    SET listing_count = listing_count + 1
    WHERE id = NEW.directory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wv_directories
    SET listing_count = GREATEST(listing_count - 1, 0)
    WHERE id = OLD.directory_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- profile_status change to/from removed or opted_out
    IF OLD.profile_status NOT IN ('removed','opted_out') AND NEW.profile_status IN ('removed','opted_out') THEN
      UPDATE wv_directories SET listing_count = GREATEST(listing_count - 1, 0) WHERE id = NEW.directory_id;
    ELSIF OLD.profile_status IN ('removed','opted_out') AND NEW.profile_status NOT IN ('removed','opted_out') THEN
      UPDATE wv_directories SET listing_count = listing_count + 1 WHERE id = NEW.directory_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wv_listings_count
  AFTER INSERT OR UPDATE OR DELETE ON wv_listings
  FOR EACH ROW EXECUTE FUNCTION sync_directory_listing_count();

-- ============================================================================
-- CATEGORY ITEM COUNT DENORMALISATION
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_category_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wv_categories SET item_count = item_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wv_categories SET item_count = GREATEST(item_count - 1, 0) WHERE id = OLD.category_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wv_listing_categories_count
  AFTER INSERT OR DELETE ON wv_listing_categories
  FOR EACH ROW EXECUTE FUNCTION sync_category_item_count();
