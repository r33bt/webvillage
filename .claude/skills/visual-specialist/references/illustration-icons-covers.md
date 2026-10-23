# Spot illustrations, diagrams and maps, icons, covers and OG, ornaments (B4, B9, B11, B13)

**B4 · Spot illustrations for abstractions.** Security, trust, speed, privacy, "how it works", life situations get an
*object* in the kit's illustration style (passbook, payslip on a phone, house and key, shield with real labels),
placed so it can break out of the card's top edge. Drawn in-house as inline SVG (≥ 6 shapes, ≥ 200×120 so it counts)
or commissioned; open libraries only if restyled to the kit. AI may assist only in the kit's style, reviewed, and
recorded as `owned`. **Banned:** robots, glowing brains, circuit heads, lightbulbs, rockets-for-growth, abstract
blobs, people. Worked example: 212-moneymy `src/components/homepage/SituationsRow.tsx`.

**B9 · Diagrams and maps.** Purpose-drawn SVG flows, timelines, comparisons, process steps (numbered circles in the
action colour), maps for place and directory pages. Each explains one specific thing. On government-scheme or legal
pages diagrams replace photos; nothing may look like an official form or agency mark.

**B11 · Covers and OG images.** Every article gets a *designed* cover: a graded photo or a typographic cover in the
kit (display face title, motif, a cropped photo or drawing). OG images come from the same template (1200×630 PNG;
`next/og` cannot render every non-ASCII glyph, so test the real titles). No title-on-random-gradient cards, no one
background reused on every guide.

**Icons.** One family (`kit.md` A7), one stroke, used in nav, lists, badges and fragments. Logo, `icon.tsx` and
`opengraph-image.tsx` follow `templates/brand-scaffold/`.

**B13 · Ornaments, textures, brand-mark crops.** The motif applied; the logomark oversized and cropped behind a CTA
band; paper grain. Decorative: never counts toward density, never marked `data-visual`.
