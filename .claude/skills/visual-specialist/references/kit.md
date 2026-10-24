# Part A: the visual kit (decide once per site; everything else draws from it)

Write `docs/VISUAL-KIT.md` in the repo, express it as tokens (Tailwind `@theme` / CSS vars) and render a one-page
**specimen PNG** (type, swatches, motif, a sample hero, two spot drawings) so Pat can approve it from a phone. If
the site already has a design system, **extend it, never fork it** (adopt-best rule). Line 3 of the file is the
status line (see SKILL.md, "Site state"). Worked example: 212-moneymy `docs/VISUAL-KIT.md`.

1. **Type pair**: a characterful display face (serif or bold grotesk) + a workhorse body face. Display:body ≥ 2.5x on
   heroes; body ≥ 18px near-black (build-defaults). Load through `next/font` (no layout shift). Put the heading rule
   in `@layer base` so a heading's own utility classes still win. *Stable: Recoleta + Söhne. money.com.my: Fraunces + Inter.*
2. **Base surface**: light by default; prefer a warm off-white / paper tone over clinical `#fff`, optional 2–4% grain.
3. **One action colour**: CTAs, checks, step numerals, links. Nothing decorative uses it.
4. **One brand accent**: eyebrows, stamps, highlights; < 5% of pixels. Each hue has exactly one job.
5. **A contrast band colour**: a deep tone for alternating sections, stat bands, the sign-up and CTA bands.
6. **The motif**: ONE ownable ornament drawn from the business itself, 3–6 uses per page. *Stable: postmarks and
   postal waves. money.com.my: the ledger "total" double rule and the torn-receipt edge.* Ideas: family law →
   folded-document corners, case-file tabs; tutoring → ruled-notebook margin, graph paper; Malaysia → songket or
   batik geometry used abstractly. Never emoji, never a generic blob.
7. **Icon family**: ONE set (Lucide / Phosphor / Tabler), one stroke, one corner style. Check-circle bullets in the
   action colour; filled round badge icons for cards on photos. Never mix families; never emoji as icons.
8. **Photo grade**: one treatment on every photo (warmth, contrast, optional tint, bottom gradient to the contrast
   colour for text on photo) so mixed sources read as one system. No filters on faces.
9. **Illustration style**: ONE of ink line + accent fill · soft 3D/clay objects · flat geometric · hand-drawn.
   Objects, not people.
10. **Card system**: one radius (12–16px), one 1px warm border, at most one shadow level. Use the repo's `ui/Card`.
11. **Section rhythm**: alternate base / tinted / contrast bands; repeat ONE section pattern (eyebrow → display H2
    with the motif → one line → visual or checklist → one CTA).

Also record in the kit file: the archetype (Stage 0), the plan per page type (`composition.md`), where photos come
from and what is queued.
