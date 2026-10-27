# Indexing cohorts (experiment, 2026-10)

Why: Google crawls provider pages and will not index them. The experiment lets a small wave
of enriched pages earn indexing and keeps the rest out of the index (rule
`indexing-and-authority.md` sections 1, 2 and 6).

## What the sandbox could not do
The cohort lists need a read of `ft_providers`. The cloud sandbox has no database
credentials, so `src/data/indexing-cohorts.json` ships as a **placeholder**
(`"status": "placeholder"`, empty lists). While it is a placeholder the gate is inert: every
provider page stays indexable and the sitemap lists providers as before. No membership was invented.

## What the desk runs (read-only)
```
cd apps/findtraining
export NEXT_PUBLIC_SUPABASE_URL=...        # production project URL
export NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon key is enough; the script only issues GET requests
pnpm cohorts -- --as-of 2026-10-28         # writes src/data/indexing-cohorts.json and scripts/indexing-cohorts.csv
git add src/data/indexing-cohorts.json scripts/indexing-cohorts.csv
git commit -m "data: fill indexing cohorts"
```
`pnpm test` runs the selection and facts tests (Node 22.18+; no extra dependencies).
Offline: `pnpm cohorts -- --input rows.json --as-of YYYY-MM-DD` with an array of `ft_providers` rows.

Check the printed `counts` and `shortfalls` before committing. A country that has fewer than
its quota of rows scoring at least `MIN_SCORE` (3) gets fewer A pages; nothing is padded.

## Definitions
- **Score** = number of renderable verified fields (`src/lib/provider-facts.ts`): the facts shown on the page, plus a description and a website.
- **A** (up to 150): top score per country, then slug ascending. Quotas MY 60, AU 60, SG 30.
- **C** (up to 60): control, matched to A on country and first slug letter, chosen by lowest `sha256(slug)`; country mix follows A.
- **B**: every other provider. One row per normalised company name is eligible for A or C, so the MY duplicate rows can only be B.

The output is deterministic: same rows and `--as-of` give the same files.

## The switch
`src/config/indexing.ts`: `COHORT_NOINDEX_ENABLED` (default on). Set `FT_COHORT_NOINDEX=off` in
the Vercel environment and redeploy to make every provider page indexable again.
