# FindTraining — Visual Kit

**Status:** built · 2026-10-23 · branches `claude/visual-findtraining-2026-10-23` (kit, homepage, listing images) and `claude/visual-findtraining-inner-2026-10-23` (category hero, guide covers, country chips) · density PASS: homepage 9 visuals, hero 38% at 1280 and 375; /resources 15 visuals
**Extends, does not replace:** `211-findtraining/docs/brand-guidelines.md` (colours, Inter), `tailwind.config.ts` brand tokens, `src/app/globals.css`.
**Specimen:** `docs/visual-kit/findtraining-kit-specimen.png` (source `kit-specimen.html`, built from the rendered components).
**Why now:** the live homepage measured 0 visuals, hero 0% at both widths (2026-10-17 and again 2026-10-23). Listing cards had a 48px logo only when `logo_url` was set, so most cards were text only.

## Stage 0 — archetype

- **Primary: DIRECTORY** (training providers). Recipe `design-craft/recipes/directory-listing.md`: one card primitive with a real item image at a fixed ratio, neutral chrome, one accent.
- **Secondary: PEOPLE / LIFE** for guide pages (`recipes/people-life.md`), and TOOL for the HRDF calculators.
- Lead asset classes: B10 directory item imagery (provider logo or designed monogram), B4 spot drawings, B3 UI fragments from the site's own config, B2 hero art.

## Part A — the kit

| # | Element | Decision |
|---|---|---|
| A1 | Type pair | **Display: Bricolage Grotesque** 700/800 (OFL, `next/font/google`, `--font-display`, class `font-display`) for H1, H2, card titles, monograms. **Body: Inter** (the documented brand face, now loaded through `next/font`, `--font-sans`). Hero H1 `2.6rem` mobile / `3.75rem` desktop; body copy in redesigned sections 18px+ near-black. |
| A2 | Base surface | White, with `brand-mist #F1F5F9` (brand Neutral 100) bands. |
| A3 | Action colour | `brand-blue #0F6FEC` (hover `brand-blue-dark #0A52B8`): buttons, links, the first motif bar. |
| A4 | Brand accent | `brand-teal #00C48C` for fills in drawings and the motif (< 5% of pixels); `brand-teal-dark #00916A` for accent text (eyebrows). |
| A5 | Contrast band | The existing blue provider CTA band. No dark surfaces. |
| A6 | Motif | **Session blocks of a course timetable.** Three rounded bars (long blue, mid teal, short dark blue) under display headings (`.ft-blocks`) and on item tiles, and a faint 48px timetable grid behind panels (`.ft-timetable`). The wall timetable in the hero drawing is where it comes from. |
| A7 | Icon family | **Lucide** (already in the repo). Country flag emoji are replaced by the kit's country chip (`components/CountryChip.tsx`: the code in a rounded chip; `ZZ` reads INTL). No emoji anywhere in the UI. |
| A8 | Photo grade | None yet (no photos on the site). When category photos land: neutral, slightly cool, no filters on faces, text on photo over a bottom gradient to `brand-ink` at 70%. |
| A9 | Illustration style | **Ink line** in `brand-ink #0F172A`, 2–2.5px rounded strokes, flat fills from the brand tints, blue and teal. Objects and buildings only: no people, no robots, no lightbulbs, no figures or data on drawn charts. |
| A10 | Card system | `rounded-xl`, 1px `gray-200` border, image band on top (`ProviderMark`, 128px), one hover shadow. |
| A11 | Section rhythm | White hero → white country band → mist "why" band → blue CTA band. Pattern: display H2 with session blocks → one line → visual cards. |

## Part B — what each page type gets

| Page type | Visuals | Gate |
|---|---|---|
| Homepage | B2/B4 hero art (`components/home/HeroArt.tsx`), landmark spot per country hub (`CountryArt.tsx`), two spots + a search fragment in "Why" (`WhyArt.tsx`) | ≥ 35% hero, ≥ 4 visuals |
| Listing card (all lists) | `ProviderMark` band: the provider's own logo on white, else the monogram tile | every card has an item image |
| Provider profile | `ProviderMark` tile beside the name; related cards carry the band | ≥ 1 item image |
| Category page | `CategoryHeroVisual`: the photo at `public/images/categories/<slug>.jpg` once it exists (kit bottom gradient), until then the category's ink-line spot (`components/category/CategoryArt.tsx`, 13 categories + a generic course drawing); listing cards with bands | hero visual + every card visual |
| Country hubs | listing cards with bands | every card visual |
| Guides index (`/resources`) | `GuideCover` on every card: kit panel, the guide's category, a subject drawing chosen per guide | every card visual |
| Guide article (`/resources/[slug]`) | people-life recipe: designed cover + 1 visual per ~400 words. Not done yet. | 1 per 400 words |
| Legal / utility | exempt | — |

## Sourcing and honesty

- **Item imagery:** only the provider's own `logo_url`. No logo, or a logo that fails to load → the monogram tile (initials from the name, legal suffixes dropped). Never stock passed off as the business.
- **Drawings:** drawn in-house as inline SVG, recorded as `owned`. No numbers or data on any drawing.
- **Fragments:** country hubs and training bodies come from `src/lib/countries.ts`; delivery filters are the real search filter values.
- **Photos wanted (queued by the orchestrator, none shipped):** category hero photos for the top categories (Pexels, Malaysian workplace settings, hands and tools rather than posed meetings).
