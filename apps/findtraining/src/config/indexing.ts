// Indexing switch for the 2026-10 indexing experiment (see scripts/README-indexing-cohorts.md).
//
// COHORT_NOINDEX_ENABLED = true  -> provider pages outside Cohort A and Cohort C render
//                                   `noindex, follow` and are left out of the sitemap.
// COHORT_NOINDEX_ENABLED = false -> every provider page is indexable again.
//
// Default is ON. To flip without a code change set FT_COHORT_NOINDEX=off in the
// Vercel environment and redeploy. The gate does nothing until
// src/data/indexing-cohorts.json is filled in by the desk (status "generated").
export const COHORT_NOINDEX_ENABLED: boolean = process.env.FT_COHORT_NOINDEX !== 'off'
