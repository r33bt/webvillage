# Honesty guardrails and the two-tier approval (non-negotiable; Core Rules 4 and 10)

## Honesty
- Licence recorded per asset: CC0 / PD / CC BY / CC BY-SA / Pexels / Pixabay / owned / permissioned. Never NC, ND,
  unclear or scraped search results. Every third-party asset is credited on the registry-driven attributions page.
- **View before write:** every `alt` is written from looking at the asset.
- **No stock as real:** a lifestyle photo never claims to be a specific client, venue, school or business.
- **No AI-generated people**, and no AI image presented as a real place, event, product or customer.
- **No invented proof or data:** logos, ratings, testimonials, numbers and UI must all be real.
- **Sensitive topics** (abuse, divorce, medical, debt distress, scams): no identifiable faces cast as victims or
  perpetrators; use hands, objects, rooms, places, spots, diagrams. **No identifiable children** unless licensed,
  model-released, neutral context, never on abuse or legal topics.
- **No placeholders** in production (`placehold.co`, `picsum`, `source.unsplash.com`, emoji, icon-boxes); craft-lint
  `fake-image` blocks the URLs. The only allowed gap is a designed honesty state.
- **No padding:** `data-visual` goes only on a real visual. A marked block of text is a defect.
- **Hard dedup:** never the same asset twice on one page. No runtime fetching of third-party images.
- Public-disclosure rule applies to anything visible: no hand-written counts, no trust boilerplate.

## Approval
- **Tier 1, agent promotes** (`status:'live'`, `verified:true`, `verifiedBy:'vision'`): licence recorded and allowed;
  asset viewed and alt matches; subject is a place, object, screenshot, UI art, chart, diagram or illustration, or a
  lifestyle photo with no identifiable child and not on a sensitive topic.
- **Kit approval (Pat, 2026-10-23):** an agent may approve a site's kit itself when it follows the money.com.my
  pattern: extend the site's own colours and tokens, add a display face, one motif drawn from the business, the
  ink-and-accent spot style, the specimen PNG rendered and looked at. Record `approved (agent, pattern)` in the
  kit's status line and show Pat the specimen with the finished preview. A kit that departs from the pattern (new
  palette, dark base, people illustrations, a rebrand) still goes to Pat first.
- **Tier 2, Pat approves** (`status:'candidate'` until flipped, `verifiedBy:'human'`): people on sensitive topics; any child; anything claimed to be a specific real person,
  business or venue; every testimonial, logo or rating (consent); licence edge cases. One batched contact sheet
  (`specialists/build-contact-sheets.py`) and one AskUserQuestion or `founder-tasks.md` line.
- The finished page is a visible (T2) change: Pat approves the preview and screenshots before it merges.
