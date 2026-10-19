-- Migration 0014: neutralise seeded Islamic-finance client wording (identity scrub)
-- Why: migration 0003 (already applied; not edited) seeded a client named after a third-party brand and
--      template prompts naming it. This updates the rows in place to generic wording.
-- Idempotent and guarded: a no-op when the client/template rows are absent or already updated.
-- Rollback: none (the original wording is intentionally not restored).

-- Templates first (they are matched by their current names / client).
UPDATE wv_be_templates t
SET
  name = regexp_replace(t.name, '^Hafiq:', 'Islamic finance client:'),
  body_template = regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(t.body_template, 'V22 \+ Hafiq Shariah rules', 'Shariah rules', 'g'),
          '^- Brand name is "Hafiq".*$', '- Use the brand name given in the assignment', 'ng'),
        'for Hafiq, an Islamic-finance brand', 'for an Islamic-finance brand', 'g'),
      'FROM Hafiq TO', 'FROM the brand TO', 'g'),
    'Hafiq''s behalf', 'the brand''s behalf', 'g')
WHERE t.name LIKE 'Hafiq:%'
   OR t.body_template LIKE '%Hafiq%';

-- Then the seeded client's display name.
UPDATE wv_be_clients
SET display_name = 'Islamic finance client (example)'
WHERE display_name = 'Hafiq';
