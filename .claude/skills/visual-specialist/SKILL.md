---
name: visual-specialist
description: "Make every page visually rich with real assets in one visual system per site: visual kit (type pair, palette, motif, icon family, photo grade, illustration style), product UI art, UI fragments, photos (Commons/Pexels), spot illustrations, diagrams, charts, icons, social-proof visuals, covers/OG, motion. Use whenever a site, page, landing page or app looks text-heavy, thin, plain or generic; when building or redesigning any front end; when the owner says 'add images', 'more visual', 'make it look like <site>'; and for image/visual audits, rollouts and density checks."
context: fork
---
<!-- VENDORED from r33bt/alphadev22-command-center global-claude-config/skills/visual-specialist/SKILL.md @ 47530d3.
     Do not edit here: change the source, then re-run scripts/vendor-skill.sh visual-specialist. -->


# Visual Specialist v4: every page visually rich, every asset real, one visual system per site

> **TARGET RESOLUTION (first, before reading anything):** resolve the target project from the invocation args,
> NOT the session cwd. If an explicit path or project is given, work on THAT; if you cannot, say so and STOP. Open
> your reply by naming the resolved target.

**Definition (Pat-approved 2026-10-23):** `_command-center/specialists/VISUAL-SPECIALIST-DEFINITION.md`.
**Board of record:** `specialists/ROLLOUT-MATRIX.md`; update the site's row in the same commit as the work.
**Alias:** `/image-specialist` loads this skill.

## What this skill owns, and what it does not

| Owns | Does not own (independent reviewers and tools) |
|---|---|
| The site's **visual kit** (type pair, palette, motif, icon family, photo grade, illustration style, card system, section rhythm) | Quality judgement: `/art-director` (THIN / NOT YET / READY FOR OWNER) |
| Every **asset**: photos, product UI art, UI fragments, illustrations, diagrams, charts, covers/OG, icons, proof visuals, motion | Design-system compliance (tokens, components, a11y): `/daisy` |
| **Composition**: which section of which page gets which asset | Words and facts: `/content-audit` |
| The **density gate** and the site's visual state | Page copy and product features |

Its job: no page ships text-led, and nothing on it is fake. "Abstract topic" is never a reason for fewer visuals;
it changes *which* visuals.

## Usage

`/visual-specialist [mode] [project] [page|scope]`

| Mode | Does | Output |
|---|---|---|
| `audit` (default) | classify, render key pages, density check, asset inventory, kit gaps | per-page worklist (no score) |
| `kit` | define or repair the kit | `docs/VISUAL-KIT.md` + specimen PNG; owner sign-off |
| `plan` | per page type: sections and the asset class each gets | plan section in `docs/VISUAL-KIT.md` |
| `rollout` | kit → plan → assets → wire → verify | branch + preview + screenshots |
| `page <route>` | one page to standard | branch |
| `assets <class>` | one asset class (`photos`, `ui-art`, `spots`, `charts`, `icons`, `covers`) | files + registry rows |
| `verify` | build, 1280 + 375 screenshots, density exit 0, `/art-director` | verdict + shots |
| `review` | runs `/art-director` in a forked context (the reviewer is never the author) | defect list |

## Stage 0: classify the site (one primary archetype, note secondaries)

| Archetype | Sites like | Hero is | Lead asset classes | Recipe |
|---|---|---|---|---|
| PLACE | visit-*, walks, wine, venues | the place | photos (Commons), maps | `destination-guide` |
| PEOPLE / LIFE | personal finance, family law, education, careers, coaching | the reader's situation or the working tool | UI art from own data, photos (Pexels), spots, charts | **`people-life`** |
| EDITORIAL / DATA | theringgit, research, explainers | strongest chart or primary document | charts, documents, covers | `content-editorial`, `editorial-hero-direction` |
| TOOL / CALC | calculators, planners, checkers | the working tool | UI art, fragments, charts | `tools-calculators` |
| DIRECTORY | findtraining, halal stores, schools, stays | rail of real item cards | item imagery, category photos | `directory-listing` |
| SAAS / B2B | addestra, nerdsmith, agencies | the product or real work | UI art, fragments, device-in-context, proof | `saas-app` |
| CREATOR | coaches, course creators, newsletters | a real person and their outcome | portrait, UI over photo, proof | `saas-app` (proof) |

Recipes live in `_command-center/design-craft/recipes/`.

## The loop (per site)

1. **Classify** (above).
2. **Kit**: write `docs/VISUAL-KIT.md` and render a one-page specimen PNG (fonts, colours, motif, a sample hero, the
   illustration style). A kit that follows the money.com.my pattern may be agent-approved (Pat, 2026-10-23); any
   other kit goes to Pat first (`references/honesty-approval.md`). Extend an existing design system, never fork
   it. Detail: `references/kit.md`.
3. **Plan**: per page type, list the sections and the asset class each gets. Detail: `references/composition.md`.
4. **Produce** assets. Read only the reference for the class you are making:
   - photos, device-in-context, directory item images → `references/photos.md`
   - product UI art, UI fragments, social proof, partner rails → `references/ui-art.md`
   - spot illustrations, diagrams and maps, icons, covers and OG, ornaments → `references/illustration-icons-covers.md`
   - charts and primary documents → `references/charts-documents.md`
   - video and motion → `references/motion.md`
5. **Register** each asset (`data/images.ts` from `templates/image-kit/`, or the site's own registry) and **wire** it.
   Mark every visual built in HTML with `data-visual="<class>"` (see the gate below).
6. **Verify**: build → screenshots at 1280 and 375, and LOOK at them → `image-density.js` exit 0 → `/art-director`
   not THIN → `/daisy` if tokens changed.
7. **Attribute** every third-party asset (registry-driven attributions page).
8. **Record**: update the status line in `docs/VISUAL-KIT.md` and the site's board row; hand Pat a preview link and the
   screenshots. Done = all of that plus Pat's sign-off on the preview (global Rule 3).

Honesty and approval rules apply at every step: `references/honesty-approval.md`. Cloud sessions, branches and
vendoring: `references/cloud-git.md`.

## Site state (so any agent can resume cold)

Line 3 of every `docs/VISUAL-KIT.md`:
`**Status:** <draft | approved | built | live> · <date> · <branch or commit> · density <PASS/FAIL n visuals, hero n%>`.
The site's row in `ROLLOUT-MATRIX.md` mirrors it. A session that changes the state updates both.

## Density standard (the gate)

| Page type | Minimum |
|---|---|
| Homepage | hero visual ≥ 35% of the first screen at **both** 1280×900 and 375×812, AND ≥ 4 distinct real visuals page-wide; no section text-only |
| Content / guide | 1 hero + 1 visual per ~400 words (min 2); no heading-delimited section > 500 words without one |
| Hub / category | every card has a real image or a UI fragment |
| Tool | the working tool above the fold + 1 explanatory visual |
| Directory item | ≥ 1 real item image or the designed fallback tile |
| Legal / utility | exempt |

A visual is an asset from `references/` that is ≥ 200px wide, ≥ 120px high and relevant to the adjacent text. Icons,
nav logos, ornaments, emoji, gradients and icon-boxes never count.

**Checker:** `node _command-center/frontend-baseline/image-density.js --type <home|content|tool> <url…>` (in a cloud
session set `PW_CHROMIUM=/opt/pw-browsers/chromium`). It counts photos, video, canvas, large SVG drawings and any element
marked `data-visual="<class>"` (`ui-art`, `fragment`, `chart`, `diagram`, `cover`, `spot`, `proof`), and lists every
counted visual with its class and size, and writes a `<slug>.density.json` result (the Stop hook's evidence). **Exit 0 or it is not done.** Mark only real visuals: a marked block of
text is a defect `/art-director` must call out. Bot-check pages report UNREACHABLE: measure the dev server or a
preview instead. For MDX corpora (whole guide libraries) `_command-center/tools/image-harness/` is the authority;
for rendered pages `image-density.js` is.

## Photos in cloud sessions

Default (Pat, 2026-10-23): **cloud runs never block on photos.** Ship the kit's illustrations, UI art and charts first,
queue the Pexels harvest to `desktop-queue/` (never a key in a file or chat), and swap the photos in when the desk
task lands. If `PEXELS_API_KEY` is in the environment, harvest directly.

## Reference paths

- Definition: `specialists/VISUAL-SPECIALIST-DEFINITION.md` · board: `specialists/ROLLOUT-MATRIX.md`
- Teardowns: `design-craft/reference-library/` (usestable.md and kit.md verified from live renders) · recipes:
  `design-craft/recipes/` · rubric and motion bar: `design-craft/rubric.md`, `design-craft/wow-bar.md`
- Kit code: `templates/image-kit/` · gate: `frontend-baseline/image-density.js`
- Reviewers: `/art-director`, `/daisy`, `/content-audit`
- First full run (worked example): 212-moneymy `docs/VISUAL-KIT.md`, branch `claude/visual-moneymy-kit-2026-10-23`
