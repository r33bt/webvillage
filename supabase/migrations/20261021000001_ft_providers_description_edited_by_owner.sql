-- FindTraining: ft_providers.description_edited_by_owner
-- NOT APPLIED. Apply via the Supabase SQL editor for the FindTraining project.
--
-- Why: the public "From the provider" label must only show when the owner wrote the description.
-- A claimed profile can still carry the description the directory seeded. The dashboard profile
-- API (apps/findtraining/src/app/api/profile/route.ts) sets this to true when the owner saves a
-- changed description. Until this is applied the app treats the missing column as false (no label)
-- and the profile save retries without the column.
--
-- No backfill: existing claimed profiles get the label the next time the owner saves a changed
-- description.
--
-- rollback: ALTER TABLE ft_providers DROP COLUMN IF EXISTS description_edited_by_owner;

ALTER TABLE ft_providers
  ADD COLUMN IF NOT EXISTS description_edited_by_owner BOOLEAN NOT NULL DEFAULT FALSE;
