---
name: verify
description: "Independent reality gate before saying done: list the claims as a denominator, then a fresh-context verifier checks the rendered page, DB row or live route (never build-passes or HTTP 200). Use before any claim of complete, every, all, fixed, working, live, or reviewable; before handing a front end to the owner; and when asked to verify, check, prove or QA a change. Brief mode (formerly /close) closes out a finished build with one decision-ready owner brief. Front-end claims must include image-density.js output."
---
<!-- VENDORED from r33bt/alphadev22-command-center global-claude-config/commands/verify.md @ 4a5b16e.
     Do not edit here: change the source, then re-run scripts/vendor-skill.sh verify. -->


# Verify — Independent Verification Gate v1.0

> **Complement, not substitute (2026-08-03):** diff review is `mattpocock-skills:code-review`'s job
> (foundational module). `/verify` is the REALITY axis that runs AFTER it — code-review never
> leaves the text of the change (`rules/constraints.md`); this gate checks the rendered page, DB
> row, live route. Skills-map overlap row 2.

**The check Claude runs before it says "done".** Claude stops when work *looks* done; without a check it can run, "looks done" is the only signal available, and Patrick becomes the verification loop. This gate replaces "looks done" with "independently verified against the reality the user experiences" — the single highest-leverage fix for the dominant harness failure family (the loop closed against a proxy / a stale doc / a contaminated environment instead of primary reality, then reported green).

Arguments: $ARGUMENTS

## Usage

- `/verify [what-was-claimed]` — full gate: establish the denominator, dispatch a fresh-context verifier, gate on evidence.
- `/verify quick [what]` — happy-path only; still denominator-first and evidence-required, just no unhappy-path branches.
- `/verify brief [port|routes]` — post-build close-out: verify every claim, reconcile drift, resolve what can be resolved, hand the owner ONE brief (was `/close`, merged 2026-10-17).

> This gate produces **"reviewable"**, not "done". Per `~/.claude/CLAUDE.md` Rule 3, the done-bar for any viewable/build/refinement surface is still **Patrick's sign-off**. `/verify` is what earns the right to hand it to him — it does not replace his sign-off, it precedes it.

---

## When this fires (don't skip it)

Run this gate before ANY of these leave your hands:
- A claim of **complete / every / full / all / screen-by-screen / end-to-end / audited / done**.
- Any **enumeration** ("14 screens", "all routes", "every product") — the count is a claim.
- Any **build or refinement** of a viewable surface (before you write "reviewable"). The evidence set for a viewable surface always includes 1280 + 375 screenshots AND `frontend-baseline/image-density.js` output for each changed route; a FAIL or UNREACHABLE is not reviewable.
- Any **irreversible / one-shot** artefact (court filing, deploy, outbound comm, bulk op, migration) — here the gate is a hard requirement, not a nicety (see `rules/constraints.md` adversarial-pass note).
- Any **money-path / critical-route** claim ("checkout works", "affiliate link live", "form saves").

**Scope brake — do NOT over-apply.** Everyday reversible edits (a copy tweak, a one-line fix, a rename) don't need the full gate. This is for completeness claims, viewable surfaces, and irreversible/one-shot work. When unsure, the tell is: *would Patrick have to re-verify this himself if I got it wrong?* If yes, gate it.

---

## The failure this closes (why the steps are shaped this way)

A fresh Claude subagent is **not automatically independent** — it shares the author's training priors and will proxy-check for the *same* reasons the author did (assert HTTP 200, confirm "it rendered", trust `count === 14`) unless it is structurally prevented. Two things make it genuinely independent:

1. **It is handed the denominator** — the "complete set" derived from the PRIMARY source by the caller. A verifier cannot invent the denominator (it doesn't know the Figma has 92 screens); if it has to guess the target, it will rubber-stamp whatever it's shown. **The caller establishes the count; the verifier confirms it against reality.**
2. **It is forbidden proxy evidence and required ground-truth evidence** — per item, it must paste what a *user* would actually observe, not a signal that merely correlates with success.

---

## The procedure (5 steps — the caller runs 1–2 and 5; a fresh subagent runs 3–4)

### Step 1 — Establish the denominator from the PRIMARY source (caller does this)
Name the authoritative source of "what should exist" and enumerate the complete set FROM IT — not from the build, not from memory, not from the handover.
- Onboarding "screen-by-screen" → the design source (Figma/spec) is the denominator, and its screen count is the target.
- "All routes/products/categories" → the route manifest / DB query / sitemap is the denominator.
- Money-path → the requirement is the denominator ("the outbound URL must carry a REAL affiliate ID, not `cid=-1`").
- Irreversible prose (filing/comm) → the primary facts (the order, the evidence index, the law) are the denominator.

**If you cannot produce a primary-source denominator, STOP — that is itself a FAIL.** You cannot verify completeness against an unknown complete set. Say so; don't proceed to a green.

### Step 2 — Define the primary-reality checks + forbid the proxies (caller does this)
For each item in the denominator, state the **ground-truth observation** that proves it, and the **proxy that does NOT count**:

| Claim type | ✅ Primary reality (required) | ❌ Proxy (rejected as evidence) |
|---|---|---|
| Page/screen works | Rendered DOM/text a user sees, screenshot @1280 + @375 | HTTP 200, "route exists", "it compiled" |
| Data renders | The actual values on the page / the DB row written | "component mounted", non-blank, `count===N` |
| Money path | The real outbound URL with the real ID / a real DB record | button present, `onClick` wired, test-mode key |
| Completeness | Every item in the denominator individually observed | "looks complete", a spot-check of 3 |
| Prose/legal fact | The claim traced to the primary doc, mirror-tested | "reads well", author confidence |

**Mandatory extra step for any CONTENT change — grep the changed files for rendered placeholders:**
`grep -rniE '\[TBD\]|TODO|lorem|coming soon|\[INSERT' <changed content files>`. Structural checks are
constitutionally blind to this: a `[TBD] for your specific market` shipped live inside an MDX frontmatter
`faq[]` answer while 200s, JSON-LD, Playwright overflow/broken-image/console and a 20/20 build all passed
(2026-07-25). `build-defaults` F and `content-mdx.md` already BAN placeholders; no verify STEP looked for
them. Exclude the intentional designed "photo coming soon" honesty state (see the frontend-baseline
honest-placeholder exception) — everything else is a FAIL.

### Step 3 — Dispatch a FRESH-CONTEXT verifier subagent (not the author)
Spawn ONE subagent with the template below. Give it the denominator + the checks + how to run them — and NOT the build narrative, not "how hard this was", not your confidence. Choose the agent type by what the check needs:
- **read-only file/DOM/manifest checks** → `Explore` (skips CLAUDE.md, genuinely fresh, cheap).
- **live checks that must run a server / curl / query a DB / drive a browser** → `general-purpose` (Explore can't execute those).

### Step 4 — The verifier runs and returns evidence (subagent does this)
It works through the denominator item by item, pasting ground-truth evidence for each, and returns the structured verdict.

### Step 5 — Gate on the result; surface failures, don't smooth (caller does this)
- All items PASS with real evidence → hand to Patrick as **"reviewable"** with the evidence attached and the exact `localhost:<port><route>` link(s).
- Any FAIL → it is **not** reviewable. Report the specific gaps; fix; re-run the gate. Never round a partial up to "done".
- **Probe sanity:** a 0%-all-fail OR 100%-all-pass result across many checks is a signal the *probe itself is broken* (dead backend answering every check the same way, wrong environment) — investigate the probe before trusting the verdict. Cross-check with `~/.claude/tools/qa-preflight.py`.

---

## Verifier subagent prompt template (copy, fill the {braces})

```
You are an INDEPENDENT verifier. You did not build this and you must not assume it works.
Your job is to confirm — against the reality a user experiences — a specific completeness claim.
Your final message IS the return value: return the structured verdict below, nothing else.

THE CLAIM UNDER TEST: {the exact claim, e.g. "the onboarding is complete, screen-by-screen"}

THE DENOMINATOR (the complete set — this is the target, do not second-guess it, verify AGAINST it):
{the enumerated list from the primary source, e.g. the 92 screens, the N routes, the money-path requirement}

FOR EACH ITEM, confirm it by OBSERVING PRIMARY REALITY and PASTE the evidence:
{the per-item check from Step 2, e.g. "load the live route, paste the rendered heading + a screenshot path; confirm the value shown is real data not a placeholder"}

EVIDENCE RULES — these are disqualifying if you rely on them:
- HTTP 200 / "the route exists" / "it compiled / built" is NOT evidence the thing works.
- "the component rendered" / "not blank" / "count === {N}" is NOT evidence the content is correct or complete.
- A spot-check of a few items is NOT evidence of completeness — walk EVERY item in the denominator.
- Your own confidence is NOT evidence. Paste what you actually observed.

PROBE SANITY: if EVERY item fails, or EVERY item passes identically, suspect a broken probe / wrong
environment / dead backend answering everything the same — report that suspicion and check the environment
(stray server on the port? right project? backend reachable?) BEFORE returning a verdict.

RETURN (exactly this shape):
- VERDICT: PASS | FAIL | PROBE-BROKEN
- DENOMINATOR: {count} items claimed; {count} items I actually observed
- PER-ITEM: for each item — PASS/FAIL + the concrete evidence (rendered text / screenshot path / DB row / real URL)
- GAPS: every item that failed or that you could not observe, with why
- Do not smooth, do not grade on a curve, do not say "good for an early stage."
```

---

## Output contract (what the caller reports back to Patrick)

```
/verify [what] — VERDICT: PASS | FAIL
Denominator: N (source: {primary source}) · Observed: M
Evidence: {links to screenshots / the real URLs / DB rows / rendered strings}
Gaps: {none | the specific list}
→ {reviewable, awaiting your sign-off at localhost:<port><route>  |  not reviewable — fixing X first}
```

Never emit "done / shipped / ✅ / verified / PASS" on your own authority for a viewable/build surface — this gate gets it to **reviewable**; Patrick's sign-off is the done-bar.

---

## Anti-patterns this gate exists to kill (from the 258-incident mine)

- **F3 — proxy-check as verification** (~50 incidents): 200 / build / grep called "works". → Step 2 forbids the proxy.
- **F2 — secondary source not primary** (~49): acted on a doc/handover/memory without a live check. → Step 1 forces the primary source.
- **F5 — broken-env false pass** (~44): a stale server / dead key made broken look fine. → Step 5 probe-sanity + qa-preflight.
- **F1 — completeness vs subset** (~29): "done" over a fraction. → Step 1 denominator + Step 4 walk-every-item.
- **F4 — self-review certifying itself** (~22): the only checker was Claude checking Claude. → Step 3 fresh verifier, handed the denominator.

---

## Brief mode (`/verify brief`) — formerly `/close`, merged 2026-10-17

**The prompt to run when an `appg` build says it has finished.** Three steps. It ends in a *brief*,
not a report.


> v1.0 was seven steps. That was the wrong shape: a longer checklist for a problem that was actually
> a *presentation* fault. Rewritten 2026-08-01 against Matt Pocock's `loop-me` vocabulary.

### The two rules that make this work

**Push right.** Defer the checkpoint as far as it will go. Do every scrap of resolvable work
*before* involving Patrick, so he is asked **once, late, with everything prepared**. If you can
settle it from the code, the artefact or a measurement, settle it. A defect you can demonstrate is a
finding to report, never a choice to delegate.

**A brief, not a draft.** What he reads is a tight, decision-ready summary with links down to the
assets. Never the raw output, never the narration. *Narration is not the artifact* — a description
of what you did is a secondary source written by the party being reviewed.

---

### 1 — Verify against primary reality

List every claim this session made, numbered. That list is the denominator; you are verifying each
claim, not "does the site work".

Then for each one, observe what a **user** would observe, and never a proxy:

- `python ~/.claude/tools/qa-preflight.py --port N --expect-title "<string from THIS project>"`
  before any probe (full path required — it is NOT on PATH). A 200
  does not prove your process bound the port, and `next start` serves the last build, not the tree.
- Playwright at 1280x900 and 375x812. **Drive the control** — drag, click, submit, then diff the
  DOM. Renders-and-navigates is not works. Assert `scrollWidth > innerWidth`, console errors,
  `img.naturalWidth`. Then look at the image.
- Render and READ any non-web artefact too: emails, PDFs, OG images, exported docs.
- Interpolated copy gets rendered against several members of the set, never one.
- `grep -rniE '\[TBD\]|TODO|lorem|coming soon|\[INSERT'` over the changed files.
- Re-derive every number stated. Verify a count by reading a sample of what it included **and** what
  it excluded.

Fix what you find, up to two passes. Anything still failing on pass three gets reported, not fixed.

### 2 — Reconcile drift and resolve everything resolvable

Git state as real numbers. Backlog ticked, additions added, date bumped. Plan phase accurate.
Front-end tasks through `frontend-baseline/gate.js`; a REFUSE is **RENDER-PENDING**, not done.
Anything out of scope goes to `parking.md`.

Then take every open question and try to kill it. Most are determinable. What survives is genuinely
a taste or owner-authority call, and only those reach step 3.

### 3 — Hand over one brief

```
CLOSE-OUT — <project> — <date>
Claims verified: M of N          Unverified/failed: <list or NONE>
Drift: git <N dirty, N unpushed, branch> · backlog <state> · plan <state>
Deferred to parking: <list>

REVIEW HERE
  localhost:<port><route>  — check <what specifically>

EVIDENCE
  <screenshot paths · driven controls · commands run and what they returned · real URLs>
```

Anything needing his decision goes through **AskUserQuestion** with your recommendation first and
the trade-off stated. Never a prose paragraph he has to reply to.

Then `/recap`.

---

- **Never self-declare done.** This reaches reviewable. His localhost sign-off is the done-bar.
- **All-green across many checks is a broken-probe signal**, not a perfect build. Investigate the
  probe before trusting the verdict.
- **Do not smooth.** "Verified honest at 60% coverage" beats a bare "complete".
- **RULE 0 overrides this file.** No outbound anything.
