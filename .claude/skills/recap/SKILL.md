---
name: recap
description: "Session-end handover: writes the goal-anchored recap to session-recaps/ with next-session health flags (experience-first: thin or image-poor pages, broken journeys, traffic). Use when the user says recap, wrap up, end of session, save progress, handover, or before context runs out."
---
<!-- VENDORED from r33bt/alphadev22-command-center global-claude-config/commands/recap.md @ 4a5b16e.
     Do not edit here: change the source, then re-run scripts/vendor-skill.sh recap. -->


# Session Recap v5.0

> **Job boundary (2026-08-03):** `/recap` owns the SESSION-END handover, always. The upstream
> `mattpocock-skills:handoff` owns the mid-build agent-to-agent pass (OS temp dir, path refs,
> secret redaction) — never point it at `session-recaps/`. They are not substitutes; canonical
> statement in `rules/session-workflow.md`, resolution in `references/skills-map.md` overlap row 1.

Save this session's work with goal anchoring and next-session health flags. Every task traced back to its upline goal. Every handover includes health warnings so the next session starts clean.

> **Health flags lead with experience + traffic (experience-first).** When writing health warnings, the goal chain, and "state," lead with the *experience-first* signals: UX completeness (any thin/placeholder/broken/dead-end states?), traffic/indexation trend (impressions, pages indexed), and whether core journeys are completable live. Revenue-readiness is a SECONDARY, pre-outreach concern — mention it only when promotion is actually on the table, never as the headline. (Per `~/.claude/CLAUDE.md` → "Experience First, Revenue Follows".)

> **Step 0 — MUTATION-FREEZE check (before any write).** If a freeze is in effect — a controller reconcile, an explicit "hands off, it's live", or an active parallel session on the shared tree — **do NOT write to the repo.** Both Step 3 (write the recap file) and Step 4 (edit backlog/plan) are tree writes with no built-in conditional, so following them blindly causes the exact collision the freeze exists to prevent. Under freeze: route the recap to the session scratchpad, deliver the full content + handover **in chat**, DEFER the canonical `session-recaps/` write, and SKIP the backlog/plan reconcile — flagging each as a deferred write in the handover. An honest "deferred under freeze" beats both violating the freeze and skipping the recap. Same guard applies to any tree-writing skill (`/max`, `/ship`, `/grind`). Ties to the parallel-session protocol in `rules/session-workflow.md`.

## Step 1 — Gather Changes

Review all files created/modified this session. Run:
```bash
cd [project-dir] && git diff --stat HEAD~5 2>/dev/null; git status --short
```

## Step 2 — Detect Session Info

1. Ask for topic: "What's a 2-5 word summary of this session?" (or infer from work done)
2. Session number: **discover the recaps dir** (`find . -type d -name "*session-recap*" -not -path "*/node_modules/*"` — it may be `docs/session-recaps/`, not `session-recaps/`) and derive from the **HIGHEST existing S-number** (`ls <dir> | grep -oiE "S[0-9]+" | grep -oE "[0-9]+" | sort -n | tail -1`, then +1), NOT the file count — count breaks on unnumbered/archived files and on a wrong/empty path (which mints "Session 1"). Fall back to count+1 only if zero S-numbered files exist; if zero recap files at all, stop and ask. Step 6.5 must cross-check the number against the *previous* recap's number + 1, not only against the filename it just wrote.
   **CONTINUED-SESSION CHECK (added 2026-07-23):** if this run is a resumed/continued session
   — same session as the latest recap (re-entered via a mid-session "do all" / follow-on, with
   NO intervening `/session-start`) — do NOT mint count+1. UPDATE the latest recap in place
   (append a dated addendum) and keep its session number. Only increment for a genuinely new
   session. (An S16 resume nearly became "Session 17"; blind count+1 propagates the wrong
   number into the handover and Step 6.5's own check then validates the wrong number.)
3. Read `plan.md` to extract current phase and project vision (for goal anchoring)

## Step 3 — Create Recap File

Save to `session-recaps/[##]-session-recap-YYYY-MM-DD--[topic-kebab-case].md`

### Recap Template

```markdown
# Session [##] Recap — [Topic]

> **Date:** YYYY-MM-DD
> **Project:** [project name]
> **Duration:** ~[estimate]
> **Milestone:** [Current milestone from plan.md, if any]

---

## Goal Chain
- **Vision:** [1-line project vision from plan.md]
- **Current focus:** [what the project is working toward right now]
- **This session served:** [which specific goal(s) this session advanced]

## What Was Accomplished
- [task] → serves: [goal]
- [task] → serves: [goal]
- [task] → serves: [goal]

## Key Decisions
- [Decision and rationale] → impact on: [phase/goal]

## Files Created/Modified
- [file path] — [brief description]

## Insights & Learnings
- [Anything noteworthy discovered]

## Durable corrections (was the `stop_reflect` Stop hook — folded in here 2026-08-01)
> The hook fired once per editing session but **blocked the stop and displaced the final answer**, so the
> owner lost sight of the actual reply. Same function, correct home: it belongs in the recap, which is
> already where session learnings go. Answer in one line if the answer is "none" — that is the common case.
- Did anything this session reveal a **durable** correction? (a) a rule in `~/.claude/` that proved wrong,
  stale or missing; (b) a skill in `~/.claude/commands/` whose output had to be corrected; (c) a project
  gotcha worth a memory file.
- **If yes, grep the queue FIRST** — `grep -in '<keyword>' ~/.claude/rule-review-queue.md`, 2-3 phrasings.
  If it is already there, add ONE line under that entry (`- ↑ CORROBORATION YYYY-MM-DD — what recurred,
  where`) and stop; a recurrence is evidence the entry matters, not a new entry. Only file fresh if nothing
  matches. Proposals only — do not edit the rules themselves unless the owner has asked for a grind.
- If no: "no durable learnings this session" and move on.

## Off-Track Work (if any)
> Items done this session that DON'T directly serve the current focus.
> Not necessarily wrong — but worth flagging for awareness.
- [task] → serves: [different goal] — reason: [why it was done anyway]

## Next Steps (Goal-Anchored)
Each next step MUST state which upline goal it serves:
1. [task] → serves: [goal] → advances: [project vision]
2. [task] → serves: [goal] → advances: [project vision]
3. [task] → serves: [goal] → advances: [project vision]

## Blockers
- [Anything blocking progress] — blocks: [which goal]
- [User action needed] — blocks: [which goal] — first flagged: [date if known]
```

## Step 4 — Session-End Verification (MANDATORY — skip only if planning/docs session)

### Features Checklist
Cross-reference every feature discussed or planned this session:
- [ ] All features mentioned are either BUILT or explicitly deferred to backlog
- [ ] No "Agent N will implement" or "TODO" text left in production code
- [ ] All new routes/pages return 200 (not 404)

### Smoke Check
```bash
# For each project worked on:
curl -s -o /dev/null -w "%{http_code}" [production-url]
# If Playwright available:
pnpm exec playwright test --grep smoke
```

### Backlog Reconciliation
- [ ] Items completed this session marked done in backlog.md (one line each, with the commit; the detail goes in this recap)
- [ ] Done items moved out: commit the backlog first, then run `python _command-center/tools/backlog-archive/backlog_archive.py --repo <project> --apply` (in a cloud session: `.claude/tools/backlog_archive.py`, installed by `scripts/install-os-commands.sh`) and commit `backlog.md` + `session-history/backlog-archive.md` together. Exit 3 = another session is on the backlog: leave it and note it in the handover. Never tick-and-leave.
- [ ] New items discovered this session added to backlog.md
- [ ] plan.md updated if phase status changed
- [ ] Backlog "Last updated" header bumped to today + this session number

### Front-End Done Gate (MANDATORY — blocks recording any front-end task as done)

> Enforces the one rule from `_command-center/frontend-baseline/SCHEMA.md`: **green is earned, never claimed.** A backlog tick is not truth. A front-end task is recorded DONE only if the project's standing scorecard (`frontend-baseline.md`) shows an EARNED **Verdict: GREEN** — dated this session, with a render screenshot on disk. Automated `GREEN*` never qualifies (it is a sweep result, not a pixel confirm).

For every task this session is about to mark done that touches the **rendered page** — images, copy, empty states, links, mobile layout, dynamic data, OG image, money path — run the gate against that project:

```bash
node ~/Documents/alphadev22/_command-center/frontend-baseline/gate.js <project-slug> --date $(date +%F) --after "<session-start ISO datetime>"
# multiple slugs ok:  gate.js 70-visitjandabaik 75-mathstutor --date $(date +%F) --after ...
# exit 0 = all PASS · exit 2 = at least one REFUSE
```

**`--after` is required for recap use** (added 2026-08-08, queue L2588): pass this session's start time (or the earliest commit being recorded done). Date-scoping alone cannot tell whose session earned the green — on a repo with concurrent sessions, a SIBLING's same-day GREEN reads identically and would certify rendered changes it never saw. With `--after`, the gate refuses (`SHOTS_PREDATE_SESSION`) unless a render capture on disk is newer than the work. Copy the gate's `evidence:` line (capture count + newest shot + timestamp) into the recap beside every PASS — a PASS recorded without its evidence line is unverifiable later.

- **PASS** → the front-end task may be recorded as DONE.
- **REFUSE** → DO NOT mark it done. Record it in the recap as **RENDER-PENDING** (or AMBER) with the gate's reason, and add a health flag to the handover. Honest RED beats fake GREEN.

The gate refuses for: no baseline file · verdict not GREEN (incl. `GREEN*`) · scorecard not dated this session (stale) · no render screenshot referenced · screenshot referenced but missing on disk (green unprovable). **Do not hand-edit a scorecard to GREEN to pass the gate** — green is flipped only by the pixel-checker after screenshotting at 1280 + 375. To legitimately earn it, run a sweep / visual-confirm pass first (`npm run sweep` in `_command-center/frontend-baseline`), then record the screenshot path + today's date in the project's `frontend-baseline.md`.

If the session did no rendered-page work, state "Front-end gate: N/A (no rendered-page changes)" and skip.

## Step 5 — Next-Session Health Flags (NEW in v5.0)

Run a quick health check so the handover prompt includes warnings. This prevents the next session from needing a full /status review.

### Quick Checks (parallel, ~30 seconds):
```bash
cd [project-dir] && git status --short | wc -l  # dirty file count
cd [project-dir] && wc -l backlog.md 2>/dev/null  # line count
```
- Git: any uncommitted work? Any unpushed commits?
- Backlog: over 40 KB (`wc -c backlog.md`)? After the archive step it should hold open items only; if it is still over, specs / decisions / status write-ups are living in it: flag WARN with the biggest sections.
- Plan: did we update it this session? If not, is it now stale?
- Blockers: any MANUAL/WAITING items older than 7 days?
- User actions: any recurring blocked items that keep appearing in recaps?
- Kill criteria: read `_command-center/KILL-CRITERIA.md` — is this project's kill condition met or deadline approaching (<14 days)?
- Visuals: did this session build or change any viewable page? If yes, was `image-density.js` run and did it exit 0? If not run, or FAIL/UNREACHABLE, flag WARN with the routes — the next session runs `/visual-specialist page <route>`.

### Health Flags Output:
```
NEXT-SESSION HEALTH:
  [OK | WARN] Git: [status]
  [OK | WARN] Backlog: [N lines]
  [OK | WARN] Plan: [last updated date]
  [OK | WARN] Visuals: [image-density result per changed route | not run]
  [OK | WARN] Stale blockers: [count]
  [OK | WARN] Recurring user actions: [list if any]
  [OK | WARN] Kill criteria: [condition status | "not defined"]
```

## Step 6 — Readiness Verdict

```
SESSION-END VERDICT: [project]
==============================
Features built: N of N planned
Unwired features: [list or NONE]
Build status: PASS | FAIL | NOT CHECKED
Front-end gate: PASS (N projects) | REFUSED ([slugs + reason]) | N/A (no rendered-page work)
Backlog: RECONCILED | GAPS FOUND ([what])
Goal alignment: [N of N tasks served current phase goal]
Lane board: UPDATED ([lanes]) | N/A (no lane worked) | SKIPPED ([reason])

READY FOR NEXT SESSION | NEEDS FOLLOW-UP ([what])
```

## Step 6.3: Programme Tracking (72-v22 only)

Programme tracking. In 72-v22, if this chat's lane keeps a file in `02-product/programme-view/streams/` (its "Kept by" line names the lane), update it before the recap. Add one dated change-log line for each thing that changed in the programme today, and never edit past lines. Move steps between Done, Now, Next and Later, add or close backlog items, and add any decision or date. Set Updated to today. No names, session ids, fees or em dashes, because the builder refuses them. The Old Mutual lane updates `dashboard.py` instead.

*(Owner-approved as drafted, 9 Oct 2026. Format and rules: `02-product/programme-view/streams/README.md`.)*

## Step 6.4 — Lane Board Update (Linear) — MANDATORY when the session worked a V22/portfolio lane

**Only in workspaces with a live lane board** (currently `72-v22`; board = `linear.app/alphadev22`, team GEN). Skip silently elsewhere.

For EACH lane this session actually worked, post a **project status update** (never a bare comment — a comment carries no health rating, so it does not move the dot) on that lane's Linear PROJECT, via the `linear-server` MCP:

```
save_status_update(project=<lane project>, health=<onTrack|atRisk|offTrack>, body=<four lines>)
```

Body is exactly four lines, in this order, plain English, no session numbers or file paths:

```
Done: <what moved since the last update>
Next: <the next concrete step>
Blockers: <what is stuck and why, or "none">
Ask: <ONE concrete ask of Patrick, or "none">
```

**Health rules (not vibes):** `atRisk` = a blocker needs Patrick, or a deadline lane has an unresolved blocker. `offTrack` = the lane's goal itself is in jeopardy. `onTrack` = neither. No optimistic green.

**Discipline:** append-only (never edit another session's update) · only lanes this session actually worked · a worked lane with NO project gets one created per the protocol, or the board lies by omission · if the board and `backlog.md` disagree, backlog.md wins.

Full protocol, quote verbatim into any agent prompt that writes to Linear: `_command-center/LINEAR-LANE-COORDINATION-PILOT-2026-08-11.md`.

**Two legitimate skips ONLY:** the session worked no lane, or Linear is unreachable/unauthenticated (name which). The pilot's own verdict is NEVER a reason to skip — "HOLD"/"on hold" in that record means keep running, not pause writing.

Record in the recap's verdict: `Lane board: UPDATED (<lanes>) | N/A (no lane worked) | SKIPPED (<reason>)`.

## Step 6.5 — Handover Quality Check (4 verifications before writing the prompt)

Run these before generating the handover. If any fail, fix the handover to match reality — never let a wrong handover propagate.

0. **Project identity** — does the project named in the handover match THIS session's working directory and git remote? A handover for repo A pasted into a session on repo B is a different failure from two sessions colliding on one repo, and it is caught by nothing else: state both and stop rather than emitting a handover that will drive wrong-repo execution on the next `appg`. (2026-07-25: a session bound to 97-fractionalchiefs received a 212-wealthplanner handover.)
1. **Session number** — does the number in the handover match the actual recap filename just saved? (e.g. if saving `212-session-recap…md`, handover must say `Session 212`, not `210`)
2. **Next tasks** — do the handover's "Next tasks" match the recap's "Next Steps" section exactly? Copy from the recap — do not paraphrase or invent.
3. **Git state** — run `git status --short` and `git rev-list --count @{upstream}..HEAD` right now. The handover's State line must reflect what `git status` actually shows (CLEAN, DIRTY N files, N UNPUSHED), not what you assume it is.

If any check fails: correct the handover before outputting it. Note the discrepancy in the recap under "Off-Track Work" or "Corrections."

## Step 7 — Generate Handover Prompt

After recap file is saved, output a handover prompt. ALWAYS inside a fenced code block (triple backticks) so the copy button appears.

```
## Handover — Session [##] — [Topic] — [Date]

**Project:** [project]
**Vision:** [1-line from plan.md]
**Current focus:** [what the project is working toward right now]
**Launch checklist:** [key items remaining before launch / next milestone]
**Last session:** [1-sentence summary]
**State:** [BUILT/DEPLOYED/PLANNING]

**Next tasks (goal-anchored, priority order):**
1. [task] → serves: [goal]
2. [task] → serves: [goal]
3. [task] → serves: [goal]

**Health warnings for next session:**
- [any flags from Step 5 — git, backlog, plan staleness, stale blockers]
- [or "None — all clear"]

**Recurring user actions (still pending):**
- [items that keep appearing — with first-flagged date]
- [or "None"]

**Key context:**
- [critical gotcha or decision]
- [file paths that matter]
- [active blockers and what they block]

**Start with:** /session-start (runs auto-pulse, verifies this handover)
```

## Step 8 — Confirm

Show:
1. Recap filename
2. Verification verdict
3. Handover prompt (in fenced code block)

Remind user: "Paste this handover into your next chat. `/session-start` will auto-verify it."

---

## Rules

- **Front-end "done" is gated.** Never record a rendered-page task as done without a gate PASS (earned **Verdict: GREEN** + a this-session render screenshot on disk). The gate (`_command-center/frontend-baseline/gate.js`) is mandatory and refuses automated `GREEN*` — a backlog tick is not truth, green is earned not claimed.
- **Every accomplished task gets a goal anchor.** No naked task bullets — always `→ serves: [goal]`.
- **Flag off-track work honestly.** Not a judgement — just awareness. User decides if it was worth it.
- **Health flags are mandatory.** The 30-second check prevents hours of drift next session.
- **Recurring user actions get tracked.** If the same blocker appears 3+ sessions in a row, call it out explicitly in the handover.
- **Handover says "Start with: /session-start".** This ensures the next session auto-verifies context instead of blindly trusting the handover. Note: `/session-start` is user-invocable only (`disable-model-invocation`) — a NON-INTERACTIVE/autonomous session receiving the handover cannot call it and must run the pulse manually instead: verify the handover's claims against git/disk, check backlog freshness, surface owner actions, then proceed.

Arguments: $ARGUMENTS
