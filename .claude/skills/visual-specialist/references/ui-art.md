# Product UI art, UI fragments, social proof, partner rails (B2, B3, B6, B12)

**B2 · Product UI art (the hero for any product, tool or data site).** The real UI or the site's own live data,
*deconstructed*: one main card + 2–4 floating fragments that break its edges (a key number, a status, a summary) on
the kit's base with the motif behind. Build as live components (crisp, themeable) or 2x Playwright captures with
realistic seeded data. Never lorem, never a feature that does not exist, never an invented number: every figure comes
from the same feed the site's tools use, and a fragment whose feed fails is left out.
- Mark the container `data-visual="ui-art"` so the density gate counts it, and give it an `aria-label`.
- Text inside an SVG shrinks with it: below `md`, render a compact variant (main card only) plus HTML chips.
- Credit data sources under the art where the source requires it (e.g. BNM's credit line).
- Worked example: 212-moneymy `src/components/homepage/HeroRatesArt.tsx` (12-month FD average with its real
  24-month chart on a receipt card; USD/MYR, OPR and RON95 fragments).

**B3 · UI fragments as feature illustrations.** Each feature card shows a cropped piece of the product doing that
feature (a scanned document + summary; a dated list with status pills; for calculators the result panel or chart
with a real value) **instead of an icon in a box**. Mark `data-visual="fragment"`.

**B6 · Social proof as visuals.** Greyscale customer or partner logos (permission or public use only); a rating pill
with the real source and real count; testimonials with real, consented headshots; outcome numbers as big numerals on
the contrast band. **No invented logos, quotes, ratings or numbers, ever.** New sites without proof show data
provenance instead (source logos where the source allows it, live computed counts). Public-disclosure rule: no
trust boilerplate, no hand-written counts. Mark `data-visual="proof"`.

**B12 · Integrations / partner rail.** Scrolling tiles: the real brand icon (official asset, brand rules respected)
+ name in a neutral card.
