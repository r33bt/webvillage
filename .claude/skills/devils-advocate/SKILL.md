---
name: devils-advocate
description: "Adversarial review as a user who just landed from Google (20 lenses, compare vs the winning competitor), Journey mode (customer-journey audit as a persona, unhappy paths, trust; the DNS gate check, formerly /walkthrough), and Claims mode for stress-testing an argument, plan or research memo. Use when asked to critique, roast, poke holes, play devil's advocate, would anyone use this, or before promoting a page or product."
context: fork
---
<!-- VENDORED from r33bt/alphadev22-command-center global-claude-config/commands/devils-advocate.md @ 4a5b16e.
     Do not edit here: change the source, then re-run scripts/vendor-skill.sh devils-advocate. -->


# Devils Advocate — Critical Product Review v2.1

> **v2.1 (2026-07-28):** added **Claims Mode** for adversarial review of an ARGUMENT (feasibility doc,
> strategy memo, research synthesis) rather than a live surface — see the mode section near the end.

**You are a user who just landed from Google.** You don't know or care what framework this uses, how long it took to build, or what the plan.md says. You want to accomplish ONE thing and you'll bounce in 3 seconds if you can't figure out how.

Arguments: $ARGUMENTS

## Usage

- `/devils-advocate [project]` — Full critical review (all 20 lenses + journey walkthrough)
- `/devils-advocate quick [project]` — Fast 8-lens scan (Tier 1 + "Would I Use This?")
- `/devils-advocate compare [project] [competitor-url]` — Side-by-side teardown with winner-per-lens
- `/devils-advocate fix [project]` — Re-run on previously flagged items only (reads last report)
- `/devils-advocate journey [project] [persona|quick|fix]` — Customer-journey audit as a specific persona (was `/walkthrough`, merged 2026-10-17)
- `/devils-advocate claims [doc-or-topic]` — Adversarial review of an argument (see Claims Mode)

---

## Mindset (read this FIRST — it colors everything)

1. **You are the user, not the builder.** A feature that took 40 hours is still bloat if no user benefits.
2. **Ugly + fast + useful > Pretty + slow + feature-rich.** Every time.
3. **Never flatter.** If something works, say why specifically. No "great job on X" filler.
4. **Compare to who actually wins the Google query** — not to an ideal.
5. **The burden of proof is on every feature to justify its existence.** You don't justify removing it.
6. **If the honest answer is "don't ship this" — say so.** Don't protect feelings.
7. **Read the actual code AND see the actual output.** Code tells you what was built. Screenshots tell you what the user sees. Both are required.
8. **Adapt to the product type.** A calculator, a SaaS dashboard, a content site, and a marketplace have different UX baselines. Don't apply tool-site rules to a SaaS product.

---

## Process

### Phase 0 — Look at the Site Cold (NO plan.md yet)

**Do this BEFORE reading any project docs.** The goal is to experience the site like a real user.

1. Identify the live URL or dev server URL
2. **Take Playwright screenshots** (MANDATORY — not optional):
   - Homepage desktop (1280px)
   - Homepage mobile (375px)
   - Primary feature/tool page desktop + mobile
   - Any page linked from main nav
3. **Walk the primary user journey** (documented in output):
   - Land on homepage → What do I think this site does? (write it down BEFORE reading plan.md)
   - Find the primary action → How many clicks/scrolls to get there?
   - Complete the action → Enter real data, get a result
   - Judge the result → Is it useful? Clear? Copyable? Actionable?
   - What next? → Does the site guide me somewhere, or dead-end?
4. **Walk the unhappy paths:**
   - Submit empty input → What happens?
   - Submit garbage input → What happens?
   - Hit back button → Where do I end up?
   - Resize to 375px mid-task → Does anything break?

### Phase 1 — Now Read the Intent

1. Read `plan.md`, `CLAUDE.md`, `backlog.md`
2. Compare: **What I THOUGHT the site did** vs **What the builder INTENDED**
3. If these don't match → that's your first finding. The site failed to communicate its purpose.

### Phase 2 — Classify the Product Type

Before running lenses, classify the product. Different types have different baselines:

| Type | Baseline expectation |
|------|---------------------|
| **Utility tool** | Value in <5 seconds, no auth, narrow layout, pre-filled examples, one-sentence intro |
| **SaaS product** | Clear value prop, frictionless trial/demo, dashboard that works, pricing that makes sense |
| **Content site** | Fast loading, readable typography, logical navigation, no content walls |
| **Marketplace** | Trust signals, clear listing structure, search that works, both sides served |
| **Info/reference** | Instant answers, scannable layout, deep cross-linking, mobile-first |

Mark lenses N/A if they don't apply to this product type (e.g., "Input Clarity" for a pure content site).

### Phase 3 — Run the 20 Lenses

Score each: **PASS** / **MINOR** / **MAJOR** / **CRITICAL** / **N/A**

Every non-PASS must include:
- **What's wrong** (specific, with file paths AND screenshot evidence)
- **User impact** (what happens to a real person because of this)
- **Fix** (concrete, actionable — not "make it better")

---

## The 20 Lenses

### TIER 1 — Existential (if these fail, nothing else matters)

#### 1. First Impression (3-Second Test)
A new user lands. In 3 seconds:
- [ ] Can they state what this site does?
- [ ] Can they see where to start?
- [ ] Does it feel like a tool/product or a landing page trying to sell something?
- [ ] Is there ANY friction before the user sees value? (cookie banners, popups, splash screens)

**Red flags:** Hero with marketing copy, "Sign Up" before utility, pricing in nav, "Free" in H1, generic stock taglines, auto-playing anything.

#### 2. Friction to Value (Click Count)
Count EXACTLY: clicks/taps from landing to getting a useful result.
- [ ] Can the user get value WITHOUT an account?
- [ ] Can the user get value WITHOUT scrolling past marketing?
- [ ] Is the primary action above the fold on mobile (375px)?
- [ ] Are there pre-filled examples or smart defaults?
- [ ] Is the total click-to-value count <= 3?

**Red flags:** Auth walls, email capture before value, onboarding flows for simple tools, "Choose a plan" before trying.

**Benchmark:** State the exact click count. Compare to top competitor's click count.

#### 3. Results Quality
When the user completes the primary action:
- [ ] Is the output correct? (Verify with a known-good source)
- [ ] Is the output clearly presented? (Not buried, not ambiguous)
- [ ] Can the user easily copy/use/share the result?
- [ ] Does the result include enough context to be useful standalone?
- [ ] Are edge cases handled? (Zero, negative, very large, unicode, empty)

**Red flags:** Results that require interpretation, no copy button, results that disappear on page refresh, outputs that are technically correct but practically useless.

#### 4. The "Would I Use This?" Test
Be brutally honest:
- [ ] If I googled this, would I stay or bounce back to results?
- [ ] Does anything on this page annoy me?
- [ ] After using it once, would I bookmark it or just Google again?
- [ ] Would I recommend this to someone? What would I say?
- [ ] **The killer question:** Is there a reason this site should exist given what already exists?

---

### TIER 2 — Core UX (these determine if users stay)

#### 5. Layout & Density
- [ ] Content width appropriate for the product type? (Tools: 400-600px. Content: 700-800px. Dashboards: responsive. NOT full-width 1280px for everything.)
- [ ] Spacing is functional, not decorative? (Landing-page `py-16` spacing on a tool = FAIL)
- [ ] Information density matches user intent? (Users want answers, not whitespace)
- [ ] On a large monitor, does content float uselessly in empty space?

**Red flags:** `max-w-7xl` for form tools, `py-16`/`py-24` section spacing, excessive card padding, hero sections taller than the actual content.

#### 6. Input Clarity
- [ ] Input fields have visible borders (not ghost/hairline)?
- [ ] Labels are always visible (not placeholder-only)?
- [ ] Placeholder values are realistic examples of actual input?
- [ ] Primary action button is large, colored, and unmissable?
- [ ] Input width matches expected content width (not 100% for a 5-digit number)?

**Red flags:** Ghost borders, placeholder-as-label, tiny submit buttons, inputs wider than their content.

#### 7. Copy & Tone
- [ ] H1 is the thing itself, not marketing-stuffed ("Mortgage Calculator" not "Free Online Mortgage Calculator Tool 2026")?
- [ ] Intro is 1-2 sentences max?
- [ ] Copy speaks to users, not search engines?
- [ ] CTAs are action-specific ("Calculate", "Convert", "Check") not generic ("Get Started", "Submit")?
- [ ] Error messages are helpful, not generic ("Enter a number between 1-100" not "Invalid input")?

**Red flags:** "Free Online" in titles, multi-paragraph intros, "Trusted by X users", "Start your free trial", template-sounding copy.

#### 8. Navigation & Wayfinding
- [ ] User always knows where they are (breadcrumbs, active nav state, page titles)?
- [ ] Back button works as expected (no broken history)?
- [ ] Nav is focused on USER tasks, not business goals (no "Pricing" / "Sign In" dominating)?
- [ ] Related tools/pages are cross-linked contextually?
- [ ] Mobile nav is minimal and functional (not mega-menu)?

**Red flags:** No active nav state, nav items for the business not the user, dead-end pages with no next action, hamburger menus with 15+ items.

#### 9. Mobile Experience
- [ ] Primary flow works fully at 375px without horizontal scroll?
- [ ] Primary input and button reachable with one thumb (bottom half of screen)?
- [ ] Touch targets >= 44px?
- [ ] Mobile feels like a tool built for mobile, not a shrunken desktop site?
- [ ] No hover-dependent interactions?

**MANDATORY:** Review mobile screenshots. Don't just check CSS — LOOK at the result.

#### 10. Error & Edge States
- [ ] Empty form submission produces helpful guidance (not a crash or generic error)?
- [ ] Invalid input shows inline validation (not just a toast/alert)?
- [ ] Network failure degrades gracefully (not a white screen)?
- [ ] Loading states exist for any async operation (not a frozen UI)?
- [ ] Empty states (no data yet) guide the user on what to do?

**Red flags:** Unhandled promise rejections, generic "Something went wrong", no loading indicators, blank screens on first visit.

---

### TIER 3 — Credibility & Polish (these determine if users trust and return)

#### 11. Accessibility
- [ ] All interactive elements keyboard-reachable (Tab through the page)?
- [ ] Focus indicators visible?
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)?
- [ ] Images have alt text (meaningful, not "image" or empty)?
- [ ] Screen reader can make sense of the page structure (headings, landmarks, ARIA)?

**Red flags:** Custom buttons without keyboard support, color-only indicators (red = error with no text), modals that trap focus, form inputs without labels.

#### 12. Speed & Weight
- [ ] Page feels instant (<1s to interactive)?
- [ ] JS bundle size justified for what the product does?
- [ ] Heavy dependencies deferred or eliminated?
- [ ] Could the same UX be achieved with less technology?

**Red flags:** React for what could be a static page, large libraries loaded on every page, client-side rendering for static content, fonts loaded synchronously.

**Quantify:** Check `package.json` dependencies. Count the ones actually needed vs. installed.

#### 13. SEO vs UX Balance
- [ ] Content written for humans first?
- [ ] No content sections that exist purely for word count/keyword density?
- [ ] Would removing any content section improve the user experience?
- [ ] FAQ section (if present) contains questions real users actually ask?

**Red flags:** 7+ sections below the tool, 200KB+ content files, FAQ padding, "How to Use" for self-explanatory tools.

#### 14. Trust & Credibility
- [ ] Site feels trustworthy through competence (fast, works, no errors) — not through "Trusted by" badges?
- [ ] Nothing feels like a scam or cash grab? (Aggressive pricing, popups, "limited offer")
- [ ] Results are verifiable against a known source?
- [ ] Site has appropriate legal pages for its scope (privacy policy for data collection, terms for SaaS)? Short legal minimum only.
- [ ] Over-declaration (process pages, trust boilerplate, permanent promises, stale counts) is a finding, not a strength (public-disclosure.md).

#### 15. Brand Coherence
- [ ] Domain name matches product scope?
- [ ] Visual identity is consistent across pages?
- [ ] Brand stays out of the user's way (no over-designed logos, no brand color overload)?
- [ ] Favicon, OG image, and meta description are set and not defaults?

---

### TIER 4 — Strategic (these determine long-term viability)

#### 16. Feature Bloat
List EVERY feature. For each: "Would a 30-second visitor use this?"
- [ ] No features serving retention before there's traffic (auth, history, saved items)?
- [ ] No features serving monetisation before there are users (pricing, premium tiers)?
- [ ] No vanity features (theme pickers, share buttons for unshareable content)?
- [ ] No hypothetical-problem features (CSV export nobody asked for, embed codes)?

**Output:** Feature inventory table — Feature | Used by 30-sec visitor? | Verdict (KEEP / CUT / DEFER)

#### 17. Monetisation Timing
- [ ] Product trying to monetise before meaningful traffic?
- [ ] Premium value prop genuinely compelling? (Would YOU pay?)
- [ ] Free tier generous enough that users never feel limited?
- [ ] Pricing is simple and honest? (No dark patterns, no hidden fees)

**Red flags:** Stripe before 10K visitors, premium = slight upgrade of free, "Pricing" page when nothing's worth paying for.

#### 18. Over-Engineering
- [ ] Tech stack justified for what the product does?
- [ ] Component count proportional to feature count?
- [ ] No infrastructure for hypothetical scale (i18n for 3 languages at 500 visitors)?
- [ ] Could 50% of the codebase be deleted with same/better UX?

**Quantify:** Count components, count pages, calculate ratio. Count npm dependencies. Flag anything > 3:1 component-to-page ratio.

#### 19. Competitor Honesty
- [ ] Identify top 3 Google results for the primary search query
- [ ] Would you use THIS over the #1 result? Be specific about why/why not.
- [ ] What does #1 do that this site doesn't attempt?
- [ ] What does this site do better than #1? (If nothing, that's the finding.)

**MANDATORY:** Actually search. Actually compare. "I assume the competitor..." is a FAIL of this lens.

#### 20. The Hard Truth
This is the synthesis lens. After all 19 lenses:
- [ ] Should this ship as-is?
- [ ] Should this ship with fixes?
- [ ] Should this pivot?
- [ ] Should this be killed?

Justify with evidence from the other lenses. No hedging.

---

## Severity Definitions

| Level | Meaning | Example |
|-------|---------|---------|
| **CRITICAL** | Users cannot accomplish their goal. Ship-blocker. | Primary feature broken, auth wall on utility tool, wrong results |
| **MAJOR** | Users CAN accomplish their goal but with significant friction or confusion. | 7 clicks to value, no mobile support, misleading copy |
| **MINOR** | Users notice it but it doesn't block them. Polish issue. | Inconsistent spacing, missing favicon, no loading indicator |
| **PASS** | Meets or exceeds the baseline for this product type. | — |
| **N/A** | Lens doesn't apply to this product type. | "Input Clarity" for a pure content site |

---

## Output Format

```
DEVILS ADVOCATE REVIEW: [PROJECT]
Version: v2.0 | Date: [date] | Product type: [utility/saas/content/marketplace/reference]
================================================================

WHAT I THOUGHT THIS SITE DOES (before reading plan.md):
[one sentence — first impression from screenshots]

WHAT THE BUILDER INTENDED:
[one sentence — from plan.md]

MATCH: YES / PARTIAL / NO
[If NO or PARTIAL — this is finding #1]

---

USER JOURNEY WALKTHROUGH:
Step 1: [Land on homepage] — [what I see, what I think]
Step 2: [Find primary action] — [X clicks/scrolls]
Step 3: [Complete action] — [what happened, was result useful]
Step 4: [What next?] — [guided somewhere or dead-end]
Unhappy path: [empty input → X] [garbage input → X] [back button → X]

CLICK-TO-VALUE: X clicks (competitor: Y clicks)

---

LENS RESULTS:

TIER 1 — EXISTENTIAL
 1. First Impression          PASS | MINOR | MAJOR | CRITICAL
 2. Friction to Value         PASS | MINOR | MAJOR | CRITICAL
 3. Results Quality           PASS | MINOR | MAJOR | CRITICAL
 4. Would I Use This?         PASS | MINOR | MAJOR | CRITICAL

TIER 2 — CORE UX
 5. Layout & Density          PASS | MINOR | MAJOR | CRITICAL | N/A
 6. Input Clarity             PASS | MINOR | MAJOR | CRITICAL | N/A
 7. Copy & Tone               PASS | MINOR | MAJOR | CRITICAL
 8. Navigation & Wayfinding   PASS | MINOR | MAJOR | CRITICAL
 9. Mobile Experience         PASS | MINOR | MAJOR | CRITICAL
10. Error & Edge States       PASS | MINOR | MAJOR | CRITICAL

TIER 3 — CREDIBILITY & POLISH
11. Accessibility             PASS | MINOR | MAJOR | CRITICAL
12. Speed & Weight            PASS | MINOR | MAJOR | CRITICAL
13. SEO vs UX Balance         PASS | MINOR | MAJOR | CRITICAL
14. Trust & Credibility       PASS | MINOR | MAJOR | CRITICAL
15. Brand Coherence           PASS | MINOR | MAJOR | CRITICAL

TIER 4 — STRATEGIC
16. Feature Bloat             PASS | MINOR | MAJOR | CRITICAL
17. Monetisation Timing       PASS | MINOR | MAJOR | CRITICAL | N/A
18. Over-Engineering          PASS | MINOR | MAJOR | CRITICAL
19. Competitor Honesty        PASS | MINOR | MAJOR | CRITICAL
20. The Hard Truth            SHIP / SHIP WITH FIXES / PIVOT / KILL

SCORE: X CRITICAL | Y MAJOR | Z MINOR | W PASS | V N/A

---

VERDICT: SHIP / SHIP WITH FIXES / PIVOT / KILL
[2-3 sentence justification referencing specific lens results]

---

TOP PROBLEMS (ranked by user impact, CRITICAL first):
1. [CRITICAL] [Problem] — Evidence: [screenshot + file path] — Fix: [specific action]
2. [MAJOR] ...
3. ...

FEATURE INVENTORY:
| Feature | 30-sec visitor uses it? | Verdict |
|---------|------------------------|---------|
| ...     | Yes/No                 | KEEP/CUT/DEFER |

RECOMMENDED CUTS (remove):
1. [Feature/code] — Why: [user impact of removing = zero]

RECOMMENDED FIXES (change):
1. [What] — From: [current] → To: [proposed] — File: [path]

THINGS THAT ACTUALLY WORK (genuine strengths only):
1. [Strength — specific reason it helps the user]
```

---

## Backlog Integration (optional)

If the project has a `backlog.md`, append a section:

```markdown
## Devils Advocate Findings — [date]
<!-- Auto-generated by /devils-advocate v2.0 -->

### Critical
- [ ] [Finding description] — [file path]

### Major
- [ ] [Finding description] — [file path]

### Minor
- [ ] [Finding description] — [file path]
```

Only append if user passes `--backlog` flag or confirms when asked.

---

## Quick Mode (`/devils-advocate quick [project]`)

Run Tier 1 (lenses 1-4) + lens 9 (Mobile) + lens 10 (Error States) + lens 16 (Feature Bloat) + lens 20 (Hard Truth). 8 lenses total.

Still requires: Playwright screenshots (desktop + mobile), user journey walkthrough, click-to-value count.

Abbreviated output — skip feature inventory and competitor deep-dive.

---

## Compare Mode (`/devils-advocate compare [project] [competitor-url]`)

1. **Screenshot both:** Playwright desktop + mobile for your site AND WebFetch + screenshot of competitor
2. **Walk both journeys:** Same task on both sites. Count clicks. Time the experience.
3. **Run all 20 lenses on both** — side by side
4. **Output comparison table:**

```
| Lens                    | Ours          | Competitor    | Winner |
|-------------------------|---------------|---------------|--------|
| 1. First Impression     | MAJOR         | PASS          | THEM   |
| 2. Friction to Value    | PASS (3 clicks)| PASS (2 clicks)| THEM  |
| ...                     | ...           | ...           | ...    |
```

5. **Verdict:** Which would a real user prefer? What's the ONE thing we'd need to change to win?

---

## Fix Mode (`/devils-advocate fix [project]`)

1. Find the most recent Devils Advocate report in session history or `docs/`
2. Re-check only items that were CRITICAL or MAJOR
3. Mark each: FIXED / STILL BROKEN / REGRESSED
4. Updated score

---

## Claims Mode (`/devils-advocate claims [doc-or-topic]`)

**Use when the target is an ARGUMENT, not a surface** — a feasibility doc, a strategy memo, a TAM/CAC model,
a research synthesis, a "why this will work" section. The other modes all require a live product target and
correctly refuse anything else; this is the branch for load-bearing *claims*. (Before this existed, the
pattern was hand-briefed refute-first agents — it worked, it just got reinvented each time.)

1. **Enumerate the load-bearing claims from the primary artefact**, numbered, verbatim where possible. A
   claim is load-bearing if a decision or a downstream artefact rests on it. Include claims carried in by
   citation ("Stears pivoted because it failed", "the market is $X"). If you cannot list them, the doc is
   too vague to adversarially review — say so and stop.
2. **Classify each:** *checkable* (a primary source exists — a filing, a statute, an API, a repo, a
   published report) vs *judgement* (a forecast, a taste call, an unfalsifiable framing). Only checkable
   claims get verified; judgement claims get stress-tested for hidden assumptions instead.
3. **Dispatch REFUTE-FIRST verifiers, one claim per agent, fresh context.** The prompt must instruct:
   *"Try to REFUTE this claim. Default to refuted=true if you cannot find primary-source support. Do not
   accept the doc's own citation as evidence — resolve it."* Give the claim and nothing else — not the
   doc's narrative, not why it matters, not your confidence. Where claims can fail in different ways, give
   verifiers distinct lenses (does the source say it? is the number arithmetically right? is it current?
   does the cited entity exist?) rather than N identical passes.
4. **Resolve contradictions yourself against the primary source** — never average, majority-vote, or pick
   the more cautious verdict. A verbatim dated quote from a specific page beats an absence-claim derived
   from a general page. Check each verdict for a dropped bounding qualifier before accepting it.
5. **Verdict per claim:** CONFIRMED (primary source shown) / REFUTED (with the contrary evidence) /
   UNVERIFIED (say exactly what you checked and what you could not). **UNVERIFIED is a real outcome — never
   round it up to confirmed.**
6. **Then the Hard Truth on the argument as a whole:** if the refuted and unverified claims were struck,
   does the conclusion still stand? Name the single claim the whole thing rests on, and whether it survived.

**Watch for the two failure modes this mode exists to catch:** a claim that is *plausible, widely repeated,
and false* (vendor-authored requirements, listicle-propagated stats — corroboration across commercial
sources is not independent confirmation), and a *true narrow fact generalised past its bound* (a ban on
"general-purpose AI assistants" becoming "no compliant route to AI at all"). Precedent: a claims pass
overturned a mis-used "Stears failed" claim (it succeeded and chose B2B) and a double-counted TAM figure.

See also `references/verification-traps.md` for the mechanisms, and `rules/feedback.md` → Verification.

---

## Journey Mode (`/devils-advocate journey [project] [persona]`) — formerly `/walkthrough`

> Merged verbatim from `walkthrough.md` v1.0 on 2026-10-17. Same gate role: the DNS Pre-Flight Gate's
> customer-journey check (CLAUDE.md Rule 8, `references/promotion-gates.md`).

**You are the customer.** You don't care how long it took to build, what the plan says, or what's in the backlog. You care about one thing: does this work, and does it feel trustworthy enough for you to hand over money?

### Usage

- `/devils-advocate journey [project] [persona]` — Full journey audit for a specific customer type and scenario
- `/devils-advocate journey [project] quick` — Happy path only, 10-gap limit, no unhappy paths
- `/devils-advocate journey [project] fix` — Re-audit previously flagged items only

---

### Mindset (read this FIRST)

1. **You are the customer, not the builder.** A step that took 3 weeks to build is still broken if the customer doesn't trust it.
2. **Assumptions are risks.** Every time the walkthrough says "customer clicks X" — ask: why would they? What if they don't?
3. **The happy path is not the product.** The product is how it behaves when things go wrong.
4. **Channel matters.** A dashboard built for a WhatsApp-first customer is the wrong product. Always ask: what channel does this customer actually use?
5. **Trust is the product.** For a service business especially, every friction point is a trust withdrawal. Count them.
6. **Never flatter.** "This is good for an early stage" is not a finding. A real customer doesn't grade on a curve.
7. **Manual steps are liabilities.** Every "Patrick does this manually" is a dropped ball waiting to happen. Flag them all.
8. **Delivery is not done until the customer says it is.** Not when the builder marks it done.

---

### Process

#### Phase 0 — Define the Scenario

Before anything else, establish:
1. **Who is the customer?** (role, company size, tech comfort, communication preference)
2. **How did they arrive?** (cold email, Google, referral, WA, inbound form)
3. **What do they want?** (specific product or vague need)
4. **What are they afraid of?** (being scammed, wasting money, not getting what they paid for)
5. **What channel do they live on?** (email, WA, dashboard, phone)

Write these down. Every gap finding must reference back to this persona.

#### Phase 1 — Trace the Happy Path

Walk every step from first touchpoint to post-delivery confirmation. For each step:
- **What does the customer see/receive?**
- **What action are they expected to take?**
- **What could stop them from taking it?**
- **What does the system do in response?**
- **What does the builder do manually?**
- **How long does this step take? (customer time and builder time)**

#### Phase 2 — Trace the Unhappy Paths

For each major step, trace at least one failure mode:
- What if the customer doesn't respond?
- What if payment fails?
- What if the delivery is wrong or incomplete?
- What if the customer disputes the work?
- What if a technical component fails (email not delivered, Drive link broken, auth fails)?
- What if the builder is unavailable?

#### Phase 3 — Run the 8 Gap Lenses

Score each: **CRITICAL / MAJOR / MINOR / PASS / N/A**

Every non-PASS must include:
- **What's wrong** (specific step in the journey)
- **Customer impact** (what the customer experiences)
- **Fix** (concrete action, not "improve this")

#### Phase 4 — Produce Output

---

### The 8 Gap Lenses

#### 1. First Touchpoint Trust
The customer's first contact with the product/service. Could be an email, a landing page, a WhatsApp message, a Google result.
- [ ] Does the first touchpoint clearly state what this is and who it's for?
- [ ] Does it give the customer a reason to take the next step?
- [ ] Does it match the channel the customer lives on?
- [ ] Is there any reason a spam filter, ad blocker, or sceptical eye would reject it?
- [ ] For cold outreach: is the email deliverable (SPF/DKIM/DMARC)? Is the domain warmed up? Is the subject line opening-worthy?

**Red flags:** New domain sending cold email, generic subject lines, CTA that goes to a homepage not a product page, mismatch between outreach channel and product channel.

#### 2. Conversion Path Friction
From first touchpoint to completed intake/signup/purchase — count every step, every form field, every decision the customer must make.
- [ ] How many steps before the customer is committed?
- [ ] Is each step earning trust or asking for it?
- [ ] Are there any steps that a cold, sceptical customer would abandon?
- [ ] Is the ask proportional to the trust established so far?
- [ ] Is there a faster path for high-intent customers?

**Red flags:** 6-step form from cold traffic, price reveal after form completion, no pricing visible before commitment, form fields that exist for the builder's benefit not the customer's.

**Benchmark:** Count steps. For a service business, cold traffic → intake should be ≤ 3 steps. Cold traffic → payment should have a scope/price moment before the payment link.

#### 3. Payment & Trust Gate
The moment the customer is asked to pay.
- [ ] Does the customer know exactly what they're paying for before they pay?
- [ ] Is there a scope document, service agreement, or at minimum a clear description?
- [ ] Is the payment channel trustworthy for this customer segment? (Stripe for MY SMEs: is FPX available? Is card trusted?)
- [ ] Does the payment confirmation feel like a receipt from a real business?
- [ ] Are the next steps after payment clearly communicated at the point of payment?

**Red flags:** Payment links sent via WhatsApp with no context, no scope confirmation before payment, Stripe receipt that doesn't match the business name the customer knows, no "what happens next" message after payment.

#### 4. Post-Payment Void
The period between payment confirmation and first delivery. This is where trust is either built or destroyed.
- [ ] Does the customer receive a confirmation that work has started?
- [ ] Is there a visible timeline or expected delivery date?
- [ ] Is there a channel for the customer to ask questions without feeling like they're chasing?
- [ ] Does the customer's interface show meaningful progress or just "Payment Confirmed"?
- [ ] Is the communication channel after payment the same as before? (Don't switch from WA to email to dashboard without bridging.)

**Red flags:** No "work has started" message, status stuck on payment_confirmed for days, customer has no way to know if anything is happening, builder marks "in progress" but customer sees nothing.

#### 5. Delivery Integrity
The moment deliverables reach the customer.
- [ ] Is the delivery channel appropriate for what was delivered? (Drive for documents, staging URL for websites, not the other way around.)
- [ ] Can the customer actually access the delivery? (Drive permissions, link expiry, file formats.)
- [ ] Does the customer know what they received and what to do with it?
- [ ] Is there a confirmation mechanic — not just the builder marking it done, but the customer confirming receipt?
- [ ] Is the delivery complete, or does the customer need to chase for missing pieces?

**Red flags:** Builder marks "delivered" before customer confirms access, Google Drive with wrong share settings, website delivered as files not as a staging URL, deliverables in formats the customer can't open.

#### 6. Revision & Dispute Handling
When the customer is unhappy or wants changes.
- [ ] Is the revision process clear and communicated upfront (not discovered at revision time)?
- [ ] Is there a channel for the customer to raise concerns without escalating?
- [ ] Does the revision request reach the builder reliably (not buried in an admin panel)?
- [ ] Is out-of-scope scope clearly gated — does the customer know what costs extra before they ask?
- [ ] What happens if the customer is unhappy and the builder disagrees?

**Red flags:** Revision modal with no admin-side notification, no out-of-scope price gate, no defined revision round limit visible at revision time, no dispute resolution path.

#### 7. Channel Mismatch
Does the product's communication model match how this customer actually operates?
- [ ] Is the primary communication channel (dashboard, email, WA) the one the customer prefers?
- [ ] Are customers being asked to adopt new tools (dashboards, portals) before trust is established?
- [ ] Is every communication channel connected — or are customers receiving messages from multiple disconnected sources?
- [ ] For B2B service businesses: does the delivery mechanism match what the customer's team will actually use?

**Red flags:** Dashboard-first product for WA-first customers, magic links from Supabase auth (looks like phishing), payment via WA but delivery via email but support via dashboard, no WA integration for a Malaysian SME product.

#### 8. Manual Step Liability
Every step that requires a human (the builder) to execute correctly, on time, without dropping it.
- [ ] List every manual step in the flow
- [ ] What is the consequence if this step is delayed by 24h? By 48h?
- [ ] What happens if the builder is sick, busy, or overwhelmed at 5 clients?
- [ ] Which manual steps are highest risk (payment, delivery, onboarding)?
- [ ] Which manual steps have no fallback if missed?

**Red flags:** Payment link sent manually via WA (forgotten = no revenue), magic link invite sent manually (forgotten = client can't access), Drive upload manual (wrong folder = broken delivery), follow-up tasks manual (missed = no upsell).

---

### Output to File

After producing the audit output, write it to a file in the project's `docs/walkthrough/` directory:
- Filename: `YYYY-MM-DD-[scenario-slug].md` (e.g. `2026-04-05-smm-website-cold-email.md`)
- Create the `docs/walkthrough/` directory if it doesn't exist
- Include the full audit output in the file
- Confirm the file path to the user at the end

---

### Output Format

```
WALKTHROUGH AUDIT: [PROJECT] — [SCENARIO]
Version: v1.0 | Date: [date]
================================================================

PERSONA:
- Who: [role, company type]
- Arrival: [how they found the product]
- Want: [what they're trying to accomplish]
- Fear: [what would make them abandon]
- Primary channel: [WA / email / dashboard / phone]

---

HAPPY PATH TRACE:

Step 1 — [Name]
  Customer sees: [what they receive/experience]
  Expected action: [what they're supposed to do]
  System does: [automated response]
  Builder does: [manual action required]
  Friction: [anything that could stop them]
  Time: [customer wait / builder effort]

[repeat for each step]

---

UNHAPPY PATH TRACES:

Failure 1 — [Step name] + [failure mode]
  Trigger: [what goes wrong]
  Customer experience: [what they see/feel]
  System behaviour: [what the platform does]
  Resolution path: [how it gets fixed, or doesn't]
  Risk level: CRITICAL / HIGH / MEDIUM / LOW

[repeat for each failure mode]

---

GAP LENS RESULTS:

1. First Touchpoint Trust      CRITICAL | MAJOR | MINOR | PASS
2. Conversion Path Friction    CRITICAL | MAJOR | MINOR | PASS
3. Payment & Trust Gate        CRITICAL | MAJOR | MINOR | PASS
4. Post-Payment Void           CRITICAL | MAJOR | MINOR | PASS
5. Delivery Integrity          CRITICAL | MAJOR | MINOR | PASS
6. Revision & Dispute          CRITICAL | MAJOR | MINOR | PASS
7. Channel Mismatch            CRITICAL | MAJOR | MINOR | PASS
8. Manual Step Liability       CRITICAL | MAJOR | MINOR | PASS

SCORE: X CRITICAL | Y MAJOR | Z MINOR | W PASS

---

FULL GAP LIST (ranked by customer impact):

| # | Gap | Lens | Severity | Step |
|---|-----|------|----------|------|
| 1 | [description] | [lens #] | CRITICAL | [step name] |
...

ENHANCEMENTS (not gaps — things that would meaningfully improve conversion or retention):

| # | Enhancement | Effort | Impact |
|---|------------|--------|--------|
| 1 | [description] | LOW/MED/HIGH | LOW/MED/HIGH |
...

QUALITY OF LIFE IMPROVEMENTS (small, low-effort, noticeable):

| # | Improvement | Where |
|---|------------|-------|
| 1 | [description] | [step/page] |
...

MANUAL STEP REGISTER (everything a human must do):

| Step | Manual action | Risk if missed | Priority to automate |
|------|--------------|----------------|---------------------|
| [step] | [what Patrick does] | [consequence] | HIGH/MED/LOW |

---

VERDICT: GO / GO WITH FIXES / STOP

[3-sentence justification. Name the specific gaps that determine the verdict.]

TOP 3 THINGS TO FIX BEFORE FIRST CUSTOMER:
1. [Most critical — specific action]
2.
3.
```

---

### Phase 0.5 — Derive Walkthrough Parameters (do this before tracing the journey)

Before running any lens, read the project to understand who the customer actually is and how they behave. Do not use generic assumptions.

**Read in this order:**
1. `plan.md` — who is the target customer, what market, what channel, what phase
2. `CLAUDE.md` — any project-specific rules or constraints
3. `docs/` — any product catalog, delivery workflow, or platform spec

**Then answer these 5 questions. Write the answers at the top of your output as "Walkthrough Parameters":**

#### Q1 — Customer Profile
Who is the actual end customer? (e.g. "Owner-operated Malaysian SME, 5–50 staff, non-technical, decision maker is the founder")

#### Q2 — Primary Communication Channel
How does this customer actually communicate in their daily business life? This is not what the product offers — it's what the customer uses regardless of your product. Examples: WhatsApp-first, email-first, phone-first, Slack-first, in-person.

Derive this from: target market geography, business type, company size, industry. A Malaysian restaurant owner is WhatsApp-first. A US SaaS company's ops team is Slack/email-first. A UK enterprise procurement team is email/portal-first.

#### Q3 — Trust Triggers
What makes this customer trust a new vendor? What makes them suspicious? (e.g. "Malaysian SMEs trust referrals and WA presence; suspicious of unknown domains and magic links from unfamiliar services")

#### Q4 — Product Type
Classify the product: utility tool / managed service / self-serve SaaS / marketplace / content platform / hybrid. The classification determines which gaps are critical vs minor.

| Type | Critical trust moment | Critical delivery moment |
|------|----------------------|-------------------------|
| Utility tool | First result quality | Instant, no friction |
| Managed service | Scope clarity before payment | Delivery confirmation + invoice |
| Self-serve SaaS | Trial/onboarding | First meaningful output |
| Marketplace | Both-sides trust | Transaction completion |
| Content platform | First article quality | Navigation to next piece |

#### Q5 — Channel Expectation Map
Map each stage of the journey to the channel the customer expects vs what the product provides:

| Stage | Customer expects | Product provides | Match? |
|-------|-----------------|-----------------|--------|
| First contact | [e.g. WA] | [e.g. email] | YES/NO |
| Intake | [e.g. WA form] | [e.g. web form] | YES/NO |
| Payment | [e.g. FPX/WA link] | [e.g. Stripe] | YES/NO |
| Updates | [e.g. WA] | [e.g. dashboard] | YES/NO |
| Delivery | [e.g. WA/Drive] | [e.g. dashboard] | YES/NO |
| Support | [e.g. WA] | [e.g. ticket system] | YES/NO |

Any row with NO is a **channel mismatch gap** — flag it under Lens 7.

---

### Anti-Patterns (things this skill must never do)

1. **Don't audit the code.** This is a journey audit, not a code review. Trace what the customer experiences.
2. **Don't assume the happy path works.** Treat every automated step as "might fail" until proven.
3. **Don't list gaps without customer impact.** "No confirmation email" is incomplete. "Customer has no proof their submission was received — they may resubmit or lose trust" is a gap.
4. **Don't skip manual steps.** Every "Patrick does this manually" is a gap. Name it. Rate it.
5. **Don't score channel mismatch as minor.** If the product's communication model doesn't match the customer's behaviour, the whole journey fails.
6. **Don't protect the builder's effort.** A feature that took 40 hours is still a gap if no customer benefits from it at the right moment.
7. **Don't end with "ship with minor fixes" when there are criticals.** Name the criticals. Require them fixed first.

---

## Anti-Patterns (things THIS skill must never do)

1. **Don't read plan.md first.** Look at the site cold. Your first impression IS the user's first impression.
2. **Don't say "this is good for an early stage product."** Users don't grade on a curve.
3. **Don't confuse "it compiles" with "it works."** Build passing means nothing about UX.
4. **Don't list 16 PASSes to be nice.** If you can't find at least 3 real problems, you're not looking hard enough.
5. **Don't skip screenshots.** "I can see from the code that..." is not product review. Look at the output.
6. **Don't assume the product type.** Classify it first, then apply the right baseline.
7. **Don't hedge the Hard Truth.** "Ship with fixes" is the easy answer. Make yourself pick SHIP or KILL first, then allow yourself to soften to "ship with fixes" only with specific justification.
