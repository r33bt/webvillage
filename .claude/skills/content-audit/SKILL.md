---
name: content-audit
description: "Audit existing content: verify load-bearing facts against primary sources, score the 5 pillars, triage every article KEEP / IMPROVE / REWRITE / KILL, write one gap manifest; never edits. Use for content quality, fact-check, thin content, AI slop, or which articles to fix or kill. Visual density is checked by /visual-specialist, not here."
context: fork
---
<!-- VENDORED from r33bt/alphadev22-command-center global-claude-config/commands/content-audit.md @ 4a5b16e.
     Do not edit here: change the source, then re-run scripts/vendor-skill.sh content-audit. -->


# Content Audit — Content Quality Audit v2.0

> **Owned by:** Specialist #4 (Content / Anti-slop) — see the Specialist Registry `_command-center/specialists/REGISTRY.md`. Extend the specialist; don't reinvent.
> **Updated:** 2026-07-30 (v2.0 — added factual-accuracy gate, coverage honesty, rendered-reality checks, harness delegation, KILL safety).

Score existing content against the 5-pillar quality model, verify its load-bearing FACTS against primary sources, and triage every article: KEEP / IMPROVE / REWRITE / KILL.

**Writes exactly one artefact** (the gap manifest, Step 9) and never edits content. Rewrites are a separate, owner-scoped task (`/content-create` was archived 2026-08-08 — `UNUSED-TRIAGE-2026-08-08.md`); missing visuals are fixed with `/visual-specialist page <route>`.

## Usage

- `/content-audit [project]` — Full project audit
- `/content-audit [project] [slug]` — Single article deep-dive
- `/content-audit [project] compare [slug1] [slug2]` — Side-by-side comparison

Arguments: $ARGUMENTS

---

## The one rule

**A quality score is an opinion; a factual error is a defect.** Grade the prose, but the gate is accuracy. An article with clean structure, a strong voice and a fabricated number is not a 78 — it is a REWRITE, and the number is a live incident. Score last, verify first.

Corollary: every score you write carries a quoted line from the article. A pillar score with no quotation is unfalsifiable and does not go in the table.

### Owner decision 2026-07-30 — DEFECTS ARE THE PRODUCT; the 0–100 score is advisory

Ruled after this skill's first full field run on money.com.my. **Every finding that changed anything came from a defect gate** — fabricated figures, two dead links, 121 SERP-truncated titles, a misattributed rate. **Nothing came from a pillar score.** Meanwhile a same-session SERP audit showed the site's real constraint was page-1 absence, which no quality score can see at all.

So:
- **Lead every report with the defect gates.** Fabrication, compliance, dead links, truncation, density, staleness. These are falsifiable, mechanizable, and each maps to a real failure.
- **The 5-pillar 0–100 score is ADVISORY.** Do not headline it, do not average it into a verdict, and never let a good score suppress a defect. Report it only when asked, or as context beneath the findings.
- **Do not calibrate the score.** Calibration anchors were considered and deliberately declined — the number was not earning its cost.
- **Triage on defects first.** The table below already encodes this: rows 1–3 are defects and outrank every score-based row. That ordering is now the point of the table, not a tiebreak.

A score tells you how an article reads. A gate tells you it is wrong. Only one of those is worth a session.

---

## Step 0 — Understand Project Content Structure

Before scoring anything, understand how THIS project does content:

1. **Find content location** — check in order: `content/blog/`, `src/content/`, `src/app/blog/`, Sanity (grep for `sanityClient|groq|sanityFetch`)
2. **Read one existing article fully** — the actual format (raw MDX body? frontmatter fields? how are images referenced?)
3. **Check content components** — grep `src/components/` for the MDX component set. **Enumerate each component's valid prop values from source** — an invalid enum value (e.g. `<CalloutBox variant="note">` when only `tip|warning|info|important|example` exist) crashes Vercel prerender with `Cannot read properties of undefined`, and passes every grep and parity check (memory `feedback_mdx_component_enum_props`).
4. **Check image setup** — how do existing articles reference images, and are those paths guarded or unguarded?
5. **Check structured data** — is JSON-LD generated per page, or in a layout?
6. **Check the branch you are on, and test merge risk with merge semantics — not a grep.** `git branch --show-current`; compare against `origin/<default>`.

   A grep for a removed figure across all branches **massively over-reports**. Measured on the first live run: a naive sweep flagged 68 branch refs as carrying a fabricated rate; the true merge-revert risk was **zero**. If master EDITED the line and a branch did not, git keeps master's version — a stale unmodified line is not a risk. The real risk is a branch that *modified* the file, which either conflicts (visible, safe) or ADDS contradicting content elsewhere in it (invisible — the recorded add-vs-edit case, memory `feedback_sweep_scope_unlanded_branches`).

   So the correct test is per-branch, against the merge-base:
   ```bash
   mb=$(git merge-base "$b" origin/master)
   git diff --name-only "$mb" "$b" -- <the-file>   # empty ⇒ no revert risk
   ```
   **Also check the local default branch for staleness**, because it is what new work is cut from: `git rev-list --count master..origin/master`. A local `master` 159 commits behind origin still contained a figure that origin had already corrected, so anyone branching from it re-inherits the defect. A stale local ref rots silently (memory `feedback_stale_local_ref_fakes_broken_master`).

   Record which branches were in scope, and report the branch count **and** the modified-file count separately — never the grep count alone.

**Output** a "Content Setup" block at the top of the report:
```
CONTENT SETUP:
  Format:      [MDX in src/content/ | Sanity CMS | ...]
  Frontmatter: [Yes (fields: ...) | No]
  Images:      [guarded slots | unguarded frontmatter image: | external | none]
  Components:  [name(prop=allowed|values), ...]
  Schema:      [Article JSON-LD in layout | none]
  Branch:      [current] (other content-carrying branches: [list | none])
```

This shapes what "AEO Ready" means here — never penalize an article for a capability the project doesn't have.

---

## Step 1 — Enumerate the Inventory, and Fix Your Coverage Budget

**Enumerate from the primary source with ONE unbounded sweep** and record the exact command in the report. No `-maxdepth`; a bounded probe cannot support a completeness claim.

```bash
find src/content -name "*.mdx" | wc -l     # or the project's real path
```

Then count words and pick your coverage:

| Inventory | Protocol |
|---|---|
| ≤ 15 articles | Read every one fully, inline. |
| 16–40 | Read fully, but batch: score 8 at a time, write partial results to the manifest as you go. |
| > 40 | **Delegate.** Split by directory/cluster across at most 2 worker subagents, each given this skill's Steps 2–7 verbatim and told to commit its partial manifest incrementally (global Rule 5j). Orchestrate; do not attempt a single inline pass. |

**Coverage honesty is mandatory.** The report's header states `Read fully: N of M` and, if N < M, exactly how the N were chosen. Never write a bare "complete" or "full audit" — write **"verified honest at N/M coverage"** or **"verified sufficient"**, and say which. A module atlas once passed an independent completeness check *because* it openly declared 17/21, and "completeness verify PASSED" then propagated into a handover as done, at ~27% real coverage.

If no content is found: **STOP.** Report "No content found in [project] at [paths searched]. Nothing to audit." — naming the scope searched, since absence from a bounded probe is not absence.

Output a content inventory table:
| # | Title | Slug | Words | Last Modified | Visuals | Read fully? |
|---|-------|------|-------|---------------|---------|-------------|

---

## Step 2 — Load the Voice + Editorial Rules

Check all of these, in order — not just the first:
- `~/.claude/references/copy-voice.md` (per-project TOV references live here)
- the project's own `CLAUDE.md` → **Editorial Identity** section (byline bans, locked persona names, disclosure requirements)
- `docs/brand-guidelines.md`, `docs/voice-guide.md`, `docs/personas.md`
- brand section in `plan.md`

Calibrate Pillar 4 against what you find. If nothing: WARN "No voice guide found — Pillar 4 uses generic criteria."

**Then run the editorial-compliance check (binary, per-article — these are rule violations, not scores):**
- [ ] No banned byline (some projects ban the founder's real name in `author` frontmatter, alt text, OG text, about copy — check the project CLAUDE.md)
- [ ] Persona/author names match the locked set exactly (names drift on rewrite)
- [ ] Legal disclosures (affiliate label, cookie consent, children's privacy notice) present and **visible in the rendered page**, where the law requires them. A MISSING disclosure, editorial-standards, methodology or corrections page is NOT a defect (Superseded 2026-10-19 by `global-claude-config/rules/public-disclosure.md`).
- [ ] **Over-declaration is a finding** (public-disclosure.md rules 1 to 8): process pages, trust boilerplate, reviewer or team claims, "researched by AI" lines, permanent promises, hand-written counts or dates, llms.txt, public admissions. A reviewed-by / fact-check footer is a finding unless literally TRUE and needed.

Any failure is a **COMPLIANCE FLAG**, listed separately from scores and never averaged away.

---

## Step 3 — Factual Verification Gate (HARD — run before scoring)

> This step exists because it is the recorded failure mode. On this portfolio, every GX/Boost/AEON savings rate on a live money site was **fabricated** — figures that exist nowhere at source (memory `project_digital_bank_rate_sot`) — and a Malaysian credit guide's central claim, "negative records stay on CTOS up to 7 years", was the US/FCRA norm against a real ~24 months, overstating reader harm 3–4× (`rules/content-mdx.md`). Both had citations. Both would score 16+ on Provenance. Provenance measures whether a source is *cited*; this step measures whether the *number is true*.

**Applies to:** every localized YMYL article (money, credit, tax, legal, medical, insurance, employment) and to any article whose central claim is a number.

### 3.0 — Run the harness first; it owns the mechanical half
`_command-center/tools/content-audit/` mechanizes everything in this step that can be deterministic, and is self-tested (30/30) plus mutation-tested (8/8 — it demonstrably fails when broken). Do not hand-extract what it extracts.

```bash
PY="C:/Users/User/AppData/Local/Python/pythoncore-3.14-64/python.exe"
"$PY" _command-center/tools/content-audit/check.py --config <repo>/content-audit.config.json
"$PY" _command-center/tools/content-audit/selftest.py        # prove the ruler before trusting a run
```

**It owns:** figure extraction (prose + component props + chart `data=` values + HTML-comment stripping), all six look-alike exclusions, density and the >500-word-run sub-check, heading structure, link and CTA resolution, rendered title length including the brand suffix, and readability percentiles. It prints **un-thresholded values for every file**, not just flagged ones.

**It deliberately does NOT own** pillars 2/4/5 or slop-in-context — those emit `NEEDS-JUDGMENT` and are yours. It never fakes a verdict on them.

**Precedence when both harnesses run:** `image-harness` is authoritative for visuals, because it asserts against resolved files and rendered pixels; `check.py`'s density is a source-level computation, used for projects with no image-harness adapter. Where they disagree, image-harness wins and the disagreement itself is worth reporting.

**Verify the harness before believing a green run:** a zero-findings result and a broken checker look identical. `selftest.py` must be green in the same session, and `check.py` requires `--config` (a bare invocation exits 2 on argparse, which is not a pass).

### 3a — Extract the claim set
List every load-bearing figure: rates, thresholds, retention periods, statutory limits, discharge terms, score bands, fees, deadlines, eligibility criteria. Include figures inside **component props and chart data**, not just prose — `data={[{"value":3.50}]}` evades a `3.50%` grep, which is how a figure sweep passed while the number was still shipping. Also strip HTML comments before verifying: commented-out old values read as live matches and fake a hit.

### 3a.1 — Exclude the look-alikes BEFORE you count (proven necessary)
A figure grep over a real corpus returns mostly noise, and every class below produced a false positive on the first live run of this gate. Read the matched LINE, never the file list. Exclude:

- **Corrective annotations** quoting the old value — `"No 3.88% figure exists anywhere on Boost's site"` matches every naive pattern and is the fix, not the defect. The single most common false positive.
- **Same digits, different unit** — `3.5–4.0 stars` (app-store rating) against a 3.5% rate.
- **Same digits, different entity** — `| 2020 | 3.50% |` is a historical ASB dividend component, unrelated to a bank's savings rate. Check which entity the row belongs to.
- **Code and asset data** — `d="M15 5.88 …3.88Z"` is an SVG path. Restrict content sweeps to content paths.
- **Legitimately hedged figures** — `~3.5% p.a.` for a fund's *historical* return, explicitly captioned "not a promised rate", is correct writing, not a fabrication. The defect is an unhedged conditional rate presented as unconditional.
- **HTML-commented staging** — strip `<!-- -->` first; a staged hero figure inside a comment is not live (and the same trap exists on the banks' own sites).

Report the exclusions you made. An unexplained drop from N matches to M findings is indistinguishable from missing them.

### 3b — Flag prime suspects
Round Anglo-American figures in non-US localized content are **prime suspects, not defaults**. An LLM fills locale-specific specifics from US-dominant priors, producing confident, plausible, locally-wrong numbers that pass every non-factual check. Standing suspect list:

- 7-year retention · 30-day windows · FICO 300–850 bands · US-style bankruptcy / collections timelines
- "credit score" where the local bureau uses its own term
- any suspiciously clean figure (3.50%, 5.00%, exactly 10 years)
- any figure that makes the article's headline more dramatic

### 3c — Verify against a LOCAL primary source
The country's Act, the regulator, or the named agency's own page. Never a vendor page, never a listicle, never corroboration-across-blogs: **in commercially-dominated topics, sources copy each other, so agreement is not independent confirmation.** Term-search the primary text. If a claimed rule cannot be found there, trace it to its earliest source; if that is a single uncited commercial page, record it **REFUTED, not unverified**.

Note also that WebFetch **fabricates** details on thin or template sites — verify against raw rendered `innerText`, not a fetch summary. And a 403/522/JS-challenge is a probe failure, not evidence a source is dead; `WebSearch(query, allowed_domains=["regulator.gov.my"])` reaches WAF'd sites via the search index.

### 3d — Volatility / staleness
Classify each verified figure and compare against `Last Modified`:

| Class | Examples | Stale after |
|---|---|---|
| VOLATILE | savings/OPR rates, promo APRs, fund yields | 3 months |
| ANNUAL | tax brackets, dividend declarations, contribution ceilings | 1 cycle |
| STATUTORY | Act provisions, retention periods, discharge terms | until amended (check for amendments — a 2017 amendment cut a term from 5 years to 3) |

A stale VOLATILE figure is **wrong**, not merely old.

### 3e — Record the verdict
Per article, one of:
- **VERIFIED** — every load-bearing figure traced to a named local primary source
- **PARTIAL (n/m)** — list each unverified figure explicitly; never round up to verified
- **FABRICATION FLAG** — one or more figures REFUTED or traceable to nothing

**FABRICATION FLAG overrides triage to REWRITE regardless of score**, and is reported at the top of the audit as a live incident with the exact figure, the article, the line, and the primary source that contradicts it. When two or more articles share a fabricated figure, name the shared-source problem: the fix is a figure source-of-truth doc, not n article edits.

**Two things are NEVER a PASS here** — record them `NEEDS-HUMAN`, never green: whether a cited source *says what the article claims it says* when you could not open it, and whether a professional-advice boundary has been crossed. Refuse to fake a verdict.

---

## Step 4 — Score Each Article (5-Pillar Model, 0–100)

Read the article fully. Score 0–20 per pillar. **Every score ≥16 or ≤10 requires a quoted line from the article as its anchor** — quote it in the deep-dive and in the SLOP/GAP sections.

### Pillar 1: Provenance (0–20) — *sourcing quality, NOT factual correctness (that's Step 3)*
- 16–20: named local primary sources, linked and dated; first-party data or experience; attributed author with a real credential
- 11–15: some citations, real sources, attribution present
- 6–10: factually plausible but unsourced
- 0–5: no sources, no attribution, unverifiable
- **Cap at 10** if Step 3 returned PARTIAL. **Cap at 5** on a FABRICATION FLAG. A citation next to a wrong number is worse than no citation — it borrows authority it hasn't earned.

### Pillar 2: Specificity (0–20)
- 16–20: named entities, real figures with units and dates, concrete worked examples, zero weasel words
- 11–15: mix of specific and vague
- 6–10: mostly adjectives
- 0–5: "various options", "significant savings", "many experts"

### Pillar 3: Structure (0–20)
- 16–20: clean H2/H3 hierarchy, answer-first opening, tables/lists used where they beat prose, scannable throughout
- 11–15: good hierarchy, mostly scannable
- 6–10: basic H2s, text walls between them
- 0–5: undifferentiated stream

### Pillar 4: Voice (0–20)
- 16–20: unmistakably this brand, strong POV, calibrated to the actual reader
- 11–15: has personality
- 6–10: professional but interchangeable
- 0–5: boilerplate

### Pillar 5: Utility (0–20)
- 16–20: the reader can now DO something — framework, checklist, worked numbers, decision rule
- 11–15: some actionable advice
- 6–10: informational only
- 0–5: says nothing new

**Calibration:** 90+ is genuinely excellent and rare. Most unedited AI content lands 30–50. If your average is above 75, you are grading generously — re-read your two highest-scored articles and justify each ≥16 with its quote.

---

## Step 5 — Anti-Slop Check

Judge by **context, not presence**. A word used precisely, with a specific consequence attached, is not slop. The same word used to avoid saying something concrete is.

**Always slop:** delve, tapestry, realm, embark, beacon, spearhead, myriad, plethora, paramount, holistic, synergy, paradigm.

**Context-dependent** — slop when filler, fine when specific:
- **landscape** — ✗ "in today's competitive landscape" · ✓ geographic use
- **leverage** — ✗ "leverage our platform" · ✓ "leverage ratio" (finance)
- **navigate** — ✗ "navigate the challenges" · ✓ "navigate the LHDN e-Filing portal"
- **crucial/critical** — ✗ "plays a crucial role" · ✓ "crucial for SOC 2 compliance"
- **journey** — ✗ "your financial journey" · ✓ literal travel
- **robust** — ✗ "robust solution" · ✓ "robust to network failures"
- **comprehensive** — ✗ "comprehensive guide" · ✓ "comprehensive across all 14 banks"
- **unlock / streamline / seamless / empower / elevate / harness** — slop unless a measurable outcome follows
- **game-changer / cutting-edge / revolutionize** — slop unless citing specific evidence

**Structural tells:** "In today's [adj] [noun]" · "Let's dive in" · "In this article, we will" · "[Topic] has become increasingly important" · "In conclusion" · "Are you looking for…?" · "Look no further".

**Current-generation tells** (the 2023 word-list above misses these; they are now the stronger signal):
- **Negative parallelism** — "It's not just X, it's Y" / "This isn't about X. It's about Y." Repeated more than once in a piece.
- **Rule-of-three triads** everywhere — three adjectives, three clauses, three bullets, at every level.
- **Hedge stacks** — "generally speaking, it's often the case that you may want to consider" (a whole sentence of qualifiers, no claim).
- **Manufactured second person** — "You might be wondering…" / "Here's the thing:" / "Let that sink in."
- **Symmetrical sections** — every H2 with near-identical word count and the same intro-body-takeaway shape. Real writing is lumpy.
- **The summarizing close** that restates the article without adding a decision.
- **Orphan citation** — a linked authority next to a claim the source doesn't actually make. Overlaps Step 3; flag in both.

**Scope caveat — do NOT flag em dashes here.** The portfolio's no-em-dash rule governs the owner's own voice (comms, specs, docs). It does **not** govern a product's signed-off editorial content voice; when auditing inside a project whose approved style uses them, match the surrounding signed-off content. Stripping them from approved editorial is a fidelity regression, not a fix.

**Logic tell:** can 3+ consecutive paragraphs swap order without changing meaning? → generated list content.

**Scoring:** 0 markers = CLEAN · 1–2 = MINOR (note, no penalty) · 3+ = **SLOP FLAG**, −10 from total. Quote every marker with its context judgment; an unquoted slop claim doesn't count.

---

## Step 6 — Visual Density: Call the Harness, Don't Hand-Count

A tested harness already does this against **resolved files and rendered pixels**, which a hand-count cannot: `_command-center/tools/image-harness/`. It is self-tested and carries per-site adapters. Use it.

```bash
PY="C:/Users/User/AppData/Local/Python/pythoncore-3.14-64/python.exe"
"$PY" _command-center/tools/image-harness/harness.py --config <repo>/image-harness.config.json
```

Take from its scorecard: density per article, dead asset paths (L1), placeholder leaks (L2), rendered-reality failures (L3). Report deltas against the previous scorecard — success is a **diff of two scorecards**, not an opinion.

**If no adapter exists for this project**, note that and fall back to a manual count — but keep the harness's distinctions, because they are what make the number honest:

- **Counts as a visual:** photo, illustration, chart, diagram, data table (comparison/pricing — not layout), embedded video, infographic.
- **Does NOT count:** code blocks (content, not visual relief — report code density separately at `blocks / (words/500)`), inline code, decorative gradients, emoji, and an **authored-guarded image whose file is missing** — it degrades to a placeholder and is not a real visual.
- **Density** = visuals / (words / 400) — the portfolio's single standard (build-defaults §B, `/visual-specialist`). ≥1.0 OK · 0.5–0.99 NEEDS VISUALS · <0.5 VISUAL DESERT. For the rendered page, `frontend-baseline/image-density.js --type content` is the gate; this source-level count is the per-article triage.
- **Hard sub-check:** no >500-word run with zero visuals, even if the article's overall density passes.

**A declared path is not a file.** A truthiness check (`fm.image ? …`) passes on a dead path — that is how og:image 404s shipped across 112 pages. Resolve every local path before recording it as present.

---

## Step 7 — SEO/AEO: Measure the RENDERED Page

Check relative to what the project supports (Step 0). **Three of these cannot be answered from the MDX source, and each has shipped a portfolio-wide defect** (`references/nextjs-app-router-traps.md`):

- **Title length must be computed on the RENDERED title, including the `title.template` brand suffix.** The suffix is invisible in the MDX a rewrite ticket points at, and the Next/shadcn starter ships one by default. One `title:{absolute:…}` change once fixed 139 posts all pushed past the ~60-char SERP limit — the copywriting was the smaller half of that job.
- **Canonical must be read from the rendered `<head>`, per route.** A root-layout `canonical:'/'` is inherited by every child route, so every page canonicalises to the homepage while a source-level "canonical set?" check passes.
- **"Indexed" cannot be inferred** from sitemap presence + 200 + no-noindex. Use the GSC URL Inspection API and read `inspectionResult.indexStatusResult.coverageState` (`sc-domain:` prefix; ADC token + `x-goog-user-project` header per `rules/credentials.md`).

**SEO basics:** rendered title unique and <60 chars incl. suffix · meta description <160 · exactly one H1 · clean slug · per-route canonical correct.

**AEO readiness:** first paragraph answers the implied query · FAQ section with FAQ schema · ≥1 citable data table · ≥1 list · JSON-LD present and valid · ≥3 internal links with descriptive anchors · ≥2 external authoritative links (prefer the regulator/statute over Wikipedia).

**AEO score** = checks passed / applicable checks. Flag <50%.

**Also render-verify:** the tables and components you scored actually appear. A markdown table renders only with `remark-gfm` wired; a component with an invalid enum prop crashes prerender. `curl` the rendered HTML — a source-level structure score on a page that doesn't render is fiction.

**Cannibalisation (project-level, once):** group articles by the query they target. Two articles competing for one query split their own equity — flag the pair and recommend consolidate-and-redirect, not two rewrites.

**Separate project gaps from article gaps.** "No JSON-LD" is one project fix, not M article failures.

---

## Step 8 — Journey Completion & Return-Visit

Evaluates whether the content leaves the reader somewhere useful, not just informed.

**Next-step wiring (per article):**
- [ ] ≥1 CTA to a product surface (tool, calculator, directory, form) — not merely another article
- [ ] ≥1 "read next" to a logically downstream article, not a generic related-list
- [ ] Does not end in a conclusion paragraph with nowhere to go

WIRED (3/3) · WEAK (2/3, name the miss) · DEAD END (0–1/3).

**Return-visit hooks (project-level, flag once):** newsletter or update subscription · a bookmarkable tool · two-way linking from listing/directory pages back into content · any saved state. If none: `RETURN RISK: no repeat-visit mechanics — readers arrive, read, leave.`

**Verify a CTA by following it.** A CTA counts only if its target returns 200 and is the intended page — 11 of 53 CTAs once 404'd live for an hour because presence was checked and destination wasn't.

---

## Step 9 — Triage

Apply in order; **the first matching row wins.** Precedence is deliberate: defects outrank scores.

| # | Condition | Triage |
|---|---|---|
| 1 | FABRICATION FLAG (Step 3) | **REWRITE — URGENT.** Live incident; fix the figure today, independent of the rewrite. |
| 2 | COMPLIANCE FLAG (Step 2) | **FIX NOW.** Rule violation, not a quality score. Not a rewrite — a targeted correction. |
| 3 | Stale VOLATILE figure (3d) | **REFRESH.** Cheapest high-value fix in the set; do these first. |
| 4 | SLOP FLAG *and* score <70 | **REWRITE** |
| 5 | Score <50 | **REWRITE** |
| 6 | SLOP FLAG, score ≥70 | **IMPROVE** — de-slop editing pass; the bones are sound, don't rewrite |
| 7 | Score 50–69 | **IMPROVE** — name the weakest pillar and the specific fix |
| 8 | Score ≥70, VISUAL DESERT or DEAD END | **IMPROVE** — visuals / next-step wiring only, don't touch the prose |
| 9 | Score ≥85 | **KEEP — flagship.** Protect; quarterly refresh; re-verify VOLATILE figures each time |
| 10 | Score 70–84 | **KEEP** |

The rows are exhaustive by construction: rows 1–3 take every defect, rows 4–5 every sub-70, row 6 every remaining slop flag, rows 7–8 every remaining weakness, rows 9–10 the rest. If an article matches nothing, the table is wrong — say so rather than inventing a verdict.

### KILL is guarded — never a score-only verdict

A low score is **not** grounds to delete or noindex. Before proposing KILL, all three must hold:

1. **GSC evidence pulled** for that exact URL — impressions, clicks, average position. Any page with impressions or a position better than ~30 carries equity a rewrite can capture and a delete destroys.

   **Named data path (do not reimplement, and do not follow a pointer chain):** `212-moneymy/scripts/fetch_gsc_content_data.py` — see `docs/gsc-content-data-path-2026-07-30.md`. Saying "use `/content-pulse` or the `anita` agent" was a **dead pointer chain**: content-pulse defers to anita, anita defers to "available scripts", and neither named one, so the KILL guard and three dependent features were inert specifications for as long as they existed. Name the script or the guard does not run.

   **Two traps that silently invert this data:**
   - **The GSC v3 API returns query rows sorted by CLICKS and offers no usable `orderBy`.** A plain `rowLimit: 10` therefore keeps the ten highest-*click* queries, which on a low-click page is a near-random 2-impression tail. Fetch ~500 rows and rank by impressions LOCALLY. Measured impact: query coverage went from 1.16–4.25% to 77–87%, and the reported top query for the site's largest page changed from `best travel credit card malaysia` (950 impressions) to `best travel credit cards no fees` (10,532, position 9.5) — an 11x error that had already aimed a shipped title rewrite at the wrong intent.
   - **Zero query rows never means zero demand.** The query dimension is privacy-filtered, so page/date-dimension totals are authoritative and will NOT reconcile with summed query rows (measured: filtered sum = 68% of authoritative). A page with 350 impressions and no query view exists and must not be read as dead. Read `query_coverage` per URL; head coverage does not generalise (median across all URLs was 14.3%).
2. **No inbound links** to it, internal or external.
3. **The claim isn't merely wrong** — a wrong page is a REWRITE. KILL is for content with no audience and no purpose.

Then propose, in this order: **consolidate + 301 redirect** (default — preserves equity) → **noindex** → **410** — and note that **410 is a middleware change, never a page-level edit**; a page cannot set an HTTP status. Delete only when the URL never ranked and nothing links to it.

KILL/noindex/redirect recommendations are **proposals for the owner**, never applied by this skill.

---

## Output Format

```
CONTENT AUDIT — [Project]
Date: YYYY-MM-DD | Inventory: M | Read fully: N of M | Coverage: [honest at N/M | sufficient]
Enumerated by: [exact command]
Branch: [current] | Other content-carrying branches: [list | none]
==========================================================

⚠ FACTUAL INCIDENTS (fix independently of any rewrite):
  [article:line] "[figure as published]" — REFUTED by [primary source + real value]
  [or: none found across N articles verified]

⚠ COMPLIANCE FLAGS:
  [article] — [banned byline | persona drift | over-declaration | false reviewer claim]
  [or: none]

CONTENT SETUP:
  [block from Step 0]

SUMMARY:
  Average Score:   [N]/100  (over the N read fully)
  Fact status:     VERIFIED [n] | PARTIAL [n] | FABRICATION [n] | NEEDS-HUMAN [n]
  Triage:          URGENT [n] | FIX NOW [n] | REFRESH [n] | REWRITE [n] | IMPROVE [n] | KEEP [n] | KILL proposed [n]
  Slop Flags:      [n]
  Visual Deserts:  [n]   (source: image-harness scorecard | manual fallback)
  AEO Ready:       [n]/[applicable]
  Dead Ends:       [n]
  Cannibalising:   [n] query groups
  RETURN RISK:     [NONE — no repeat-visit mechanics | LOW | OK]

SCORES:
| # | Title | Total | P1 | P2 | P3 | P4 | P5 | Fact | Slop | Vis | AEO | Journey | Triage |

DO THESE FIRST (ranked by value ÷ effort):
  1. [what] — [why it's top] — Effort: [LOW/MED/HIGH] — [article(s)]

FACT REPORT:
  [article]: [figure] → [verified against source | REFUTED by source, real value | UNVERIFIED, what I checked and couldn't]

SLOP REPORT:
  [article]: "[quoted phrase]" — [context judgment]

VISUAL GAPS:
  [article]: [words] words, [n] visuals, density [x] — [n] more needed; [n]-word run with no visual after H2 "[heading]"

AEO GAPS:
  [article]: missing [what]

PROJECT-LEVEL GAPS (one fix each, not M):
  [e.g. root-layout canonical inherited by all routes; no FAQ schema; title.template pushes N titles past 60 chars]

NOT COVERED:
  [the M−N articles not read, and why — or "none"]
```

### Single Article Deep-Dive (slug given)
Same, plus: per-pillar breakdown with the **quoted line** behind each score · the full extracted claim set with per-figure verification status and source URL · recommended visuals (type + position + alt) · AEO fixes · if REWRITE, a brief stating angle, structure, what to preserve, what to cut.

### Machine-Readable Gap Manifest — the one file written
Save to `docs/content-audit-gaps-YYYY-MM-DD.json` (date-stamped, inside the repo's docs dir — not an undated file at repo root that silently goes stale).

```json
{
  "project": "[name]",
  "date": "YYYY-MM-DD",
  "branch": "[branch]",
  "coverage": { "inventory": 129, "readFully": 40, "basis": "honest", "enumeratedBy": "find src/content -name '*.mdx' | wc -l" },
  "projectGaps": ["root-layout canonical inherited", "no FAQ schema"],
  "factIncidents": [
    { "slug": "best-savings-accounts", "line": 84, "published": "3.50%", "verdict": "REFUTED",
      "realValue": "0.25% prevailing", "source": "https://<bank>/rates", "sharedWith": ["e-wallets-guide"] }
  ],
  "complianceFlags": [{ "slug": "...", "issue": "missing AI-format disclosure" }],
  "articles": [
    {
      "slug": "how-to-become-a-cto",
      "score": 72,
      "triage": "IMPROVE",
      "factStatus": "PARTIAL (3/5)",
      "gaps": {
        "visuals": [{ "type": "diagram", "preset": "inline", "suggestedAfterH2": "The Five Stages",
                      "description": "Career progression flowchart", "alt": "Five-stage path from IC to CTO" }],
        "unverifiedFigures": ["RM4,200 median", "18-month average"],
        "missingSchema": ["FAQ"],
        "renderedTitleChars": 68,
        "weakestPillar": { "pillar": "Provenance", "score": 11, "fix": "Cite DOSM salary survey + name the year" }
      }
    }
  ]
}
```

Feeds `batch.mjs` (visual manifest — note `preset`) and `/visual-specialist` (the NEEDS VISUALS / VISUAL DESERT rows are its worklist). `/content-create` and `/content-batch` were archived 2026-08-08.

---

## Rules

- **Verify facts before scoring prose.** Step 3 is the gate; Steps 4–8 are the grade. A cited fabrication is a defect, not a low score.
- **Every score ≥16 or ≤10 carries a quoted line.** No quote, no score.
- **State coverage; never write a bare "complete".** "Honest at N/M" and "sufficient" are different verdicts — say which one you earned.
- **Enumerate unbounded, from the primary source, and record the command.** An absence-claim from a bounded probe is UNVERIFIED, not a finding.
- **Measure the rendered page for title, canonical, tables, components, and indexation.** Source-level checks on these have each shipped a live defect.
- **Delegate density to the image harness.** Don't rebuild a tested tool; report scorecard diffs.
- **Round Anglo-American figures in localized YMYL are prime suspects.** Verify against the local Act/regulator/agency, never a vendor page — and never treat blog-to-blog agreement as confirmation.
- **KILL requires GSC evidence.** Default to consolidate + 301. A wrong page is a rewrite, not a delete. 410 is middleware.
- **Don't flag em dashes** in a project's signed-off editorial voice — that rule governs the owner's voice, not approved content style.
- **Separate project gaps from article gaps** — one fix, not M penalties.
- **Never edit content.** One artefact written: the dated gap manifest.
- **This audit reaches "reviewable", not "done".** Hand the owner the report path plus any `localhost:<port><route>` needed to see a flagged page, say what to check, and hold for sign-off.
