-- ============================================================================
-- Brand Engine Migration 0003 — Templates seed (15 WV canon + 6 V22 overrides)
-- ============================================================================
-- Slice 2 of WV backend tools build plan (S215 2026-04-27)
-- Spec: docs/backend-tools-build-plan-v1.md § Slice 2
-- Schema: wv_be_templates (Migration 0002 S214) — 21 rows total
--
-- Layout:
--   Phase 1: 15 WV canon defaults (client_id NULL, is_default=true)
--   Phase 2: 6 V22 brand overrides (client_id set, is_default=false,
--            source_template_id resolved by name lookup)
--
-- Idempotent: uses WHERE NOT EXISTS guards; safe to re-run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Phase 1: 15 WV canon defaults
-- ----------------------------------------------------------------------------

INSERT INTO wv_be_templates (client_id, template_type, platform, name, body_template, variables, is_default)
SELECT * FROM (VALUES

  -- 1. LinkedIn long-form post
  (NULL::uuid, 'post', 'linkedin', 'WV: LinkedIn long-form post',
$tpl$You are writing a LinkedIn long-form post for {brand_name}.

VOICE PROFILE:
- Audience: {voice.audience}
- Tone: {voice.one_word_tone} ({voice.register})
- Never sound like: {voice.never_sound_like}
- Do: {voice.do_list}
- Don't: {voice.dont_list}
- Reading grade target: {voice.reading_grade_target}
- Signature phrases (use sparingly, max 1): {voice.signature_phrases}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 300-600 words
- One primary CTA at end (verb-led)
- No exclamation marks beyond first sentence
- Active voice; <20 words per sentence
- Output ONLY the post body, no commentary, no hashtags$tpl$,
   '{"required":["brand_name","voice","prompt","banned_phrases_canon_list"],"optional":["cluster_context"]}'::jsonb,
   true),

  -- 2. LinkedIn short post
  (NULL::uuid, 'post', 'linkedin', 'WV: LinkedIn short post',
$tpl$You are writing a SHORT LinkedIn post for {brand_name}.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 50-150 words
- Single insight + one closing question
- No hashtags
- Output ONLY the post body$tpl$,
   '{"required":["brand_name","voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 3. X / Twitter thread
  (NULL::uuid, 'post', 'x', 'WV: X thread',
$tpl$You are writing an X (Twitter) thread for {brand_name}.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 5-7 tweets
- Tweet 1: hook (max 270 chars, no thread numbering)
- Tweets 2-N: body, each <280 chars
- Final tweet: closer + verb-led CTA
- Output as JSON array: [{"i":1,"text":"..."}, ...]$tpl$,
   '{"required":["brand_name","voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 4. Instagram caption
  (NULL::uuid, 'post', 'instagram', 'WV: Instagram caption',
$tpl$You are writing an Instagram caption for {brand_name}.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- Caption: under 200 characters
- Then a hashtag block: 8-15 relevant tags
- Output as JSON: {"caption":"...","hashtags":["#tag1",...]}$tpl$,
   '{"required":["brand_name","voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 5. Facebook post
  (NULL::uuid, 'post', 'facebook', 'WV: Facebook post',
$tpl$You are writing a Facebook post for {brand_name}.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 100-300 words
- Story-led opening
- One closing question for engagement
- Output ONLY the post body$tpl$,
   '{"required":["brand_name","voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 6. Long-form article
  (NULL::uuid, 'long_form_article', NULL, 'WV: Long-form article',
$tpl$You are writing a long-form article for {brand_name}.

VOICE PROFILE:
- Audience: {voice.audience}
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}
- Reading grade target: {voice.reading_grade_target}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASSIGNMENT:
{prompt}

STRUCTURE:
- H1 title (single)
- 2-3 sentence intro hook
- 3-5 H2 sections, each with 2-4 paragraphs
- Closing section with one verb-led CTA

CONSTRAINTS:
- 1500-2500 words
- Active voice; max 20 words per sentence
- Cite sources by name + date when claiming a number/study
- Output as Markdown$tpl$,
   '{"required":["brand_name","voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 7. Cold outreach email
  (NULL::uuid, 'outreach_opener', 'email', 'WV: Cold outreach email',
$tpl$You are writing a cold outreach email FROM {brand_name} TO {recipient_name} ({recipient_role} at {recipient_org}).

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASK / ANGLE:
{prompt}

CONSTRAINTS:
- Subject: 4-8 words, lowercase except proper nouns
- Body: under 150 words
- Personalised opener (one specific reference to recipient or org — use {personalisation_hook})
- Single clear ask in penultimate paragraph
- Sign-off: "{sender_name}" only — no titles, no signatures
- Output as JSON: {"subject":"...","body":"..."}$tpl$,
   '{"required":["brand_name","voice","recipient_name","recipient_role","recipient_org","prompt","banned_phrases_canon_list","sender_name"],"optional":["personalisation_hook"]}'::jsonb,
   true),

  -- 8. Outreach follow-up
  (NULL::uuid, 'outreach_followup', 'email', 'WV: Outreach follow-up',
$tpl$You are writing follow-up email #{touch_number} from {brand_name} to {recipient_name}.

CONTEXT — previous touch sent {days_since_last} days ago:
{previous_touch_summary}

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ANGLE:
{prompt}

CONSTRAINTS:
- Subject: prefix "Re: " then 2-4 words
- Body: under 80 words
- Reference the prior touch in 1 sentence (don't restate it)
- Re-ask once, in different framing
- Sign-off: "{sender_name}"
- Output as JSON: {"subject":"...","body":"..."}$tpl$,
   '{"required":["brand_name","voice","recipient_name","touch_number","days_since_last","previous_touch_summary","prompt","banned_phrases_canon_list","sender_name"]}'::jsonb,
   true),

  -- 9. LinkedIn connection request
  (NULL::uuid, 'connection_request', 'linkedin', 'WV: LinkedIn connection request',
$tpl$You are writing a LinkedIn connection request note FROM {sender_name} ({sender_role} at {brand_name}) TO {recipient_name}.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ANGLE:
{prompt}

CONSTRAINTS:
- Under 300 characters total (LinkedIn hard cap)
- One specific reason for connecting (no generic "I'd like to add you to my network")
- No CTA — just connection
- Output ONLY the note body$tpl$,
   '{"required":["sender_name","sender_role","brand_name","voice","recipient_name","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 10. Re-engagement email
  (NULL::uuid, 'email', 'email', 'WV: Re-engagement email',
$tpl$You are writing a re-engagement email from {brand_name} to a dormant user/lead ({recipient_name}, last active {days_dormant} days ago).

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ANGLE:
{prompt}

CONSTRAINTS:
- Subject: under 50 chars, lowercase except proper nouns
- Body: 100-150 words
- Acknowledge the time gap once (1 sentence)
- Lead with what's new / what they'd value most NOW
- Single clear next step
- Output as JSON: {"subject":"...","body":"..."}$tpl$,
   '{"required":["brand_name","voice","recipient_name","days_dormant","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 11. Newsletter section
  (NULL::uuid, 'email', 'email', 'WV: Newsletter section',
$tpl$You are writing one section of a newsletter for {brand_name}.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 300-500 words
- One H2 section heading
- 2-3 paragraphs of body
- One concrete takeaway (bulleted or bolded)
- Output as Markdown$tpl$,
   '{"required":["brand_name","voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   true),

  -- 12. Profile bio (short)
  (NULL::uuid, 'profile_bio', NULL, 'WV: Profile bio (short)',
$tpl$You are writing a short profile bio for {brand_name} (or for {sender_name}, an employee/founder of {brand_name} — use {bio_subject} to pick).

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ANGLE:
{prompt}

CONSTRAINTS:
- Under 200 characters
- Third person if subject is the company; first person if subject is a person (use {bio_subject})
- Mention what {bio_subject} does + who they help, no awards, no buzzwords
- Output ONLY the bio$tpl$,
   '{"required":["brand_name","voice","bio_subject","prompt","banned_phrases_canon_list"],"optional":["sender_name"]}'::jsonb,
   true),

  -- 13. Profile bio (long)
  (NULL::uuid, 'profile_bio', NULL, 'WV: Profile bio (long)',
$tpl$You are writing a long profile bio for {brand_name} (or for {sender_name} if person-bio — use {bio_subject}).

VOICE PROFILE:
- Audience: {voice.audience}
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

ANGLE:
{prompt}

CONSTRAINTS:
- 200-500 characters
- Third person if company; first person if individual
- Two short paragraphs: what they do + who they help; relevant credentials/background
- No awards listed unless directly relevant; no buzzwords
- Output ONLY the bio$tpl$,
   '{"required":["brand_name","voice","bio_subject","prompt","banned_phrases_canon_list"],"optional":["sender_name"]}'::jsonb,
   true),

  -- 14. Topic cluster
  (NULL::uuid, 'cluster', NULL, 'WV: Topic cluster',
$tpl$You are designing a topic cluster for {brand_name}.

VOICE PROFILE:
- Audience: {voice.audience}
- Tone: {voice.one_word_tone} ({voice.register})

ASSIGNMENT:
Parent topic: {prompt}

CONSTRAINTS:
- Output 1 parent piece brief + 5 child piece briefs
- Each child explores one angle of the parent topic
- Each brief = 2-3 sentences (target audience + key claim + format hint)
- Output as JSON: {"parent":{"title":"...","brief":"..."},"children":[{"i":1,"title":"...","brief":"...","format":"long_form_article|post|email"}, ...]}$tpl$,
   '{"required":["brand_name","voice","prompt"]}'::jsonb,
   true),

  -- 15. Pillar cluster
  (NULL::uuid, 'cluster', NULL, 'WV: Pillar cluster',
$tpl$You are designing a pillar cluster for {brand_name}.

VOICE PROFILE:
- Audience: {voice.audience}
- Tone: {voice.one_word_tone} ({voice.register})

ASSIGNMENT:
Pillar topic: {prompt}

CONSTRAINTS:
- Output 1 pillar piece (long-form authority article) + 8 satellite pieces that link back
- Each satellite addresses a specific question or angle from the pillar
- Each brief = 2-3 sentences
- Output as JSON: {"pillar":{"title":"...","brief":"...","format":"long_form_article"},"satellites":[{"i":1,"title":"...","brief":"...","format":"long_form_article|post|email"}, ...]}$tpl$,
   '{"required":["brand_name","voice","prompt"]}'::jsonb,
   true)

) AS v(client_id, template_type, platform, name, body_template, variables, is_default)
WHERE NOT EXISTS (
  SELECT 1 FROM wv_be_templates t WHERE t.name = v.name AND t.is_default = true
);

-- ----------------------------------------------------------------------------
-- Phase 1.5: cluster_definition for the 2 cluster templates
-- (set after insert because the column is in a separate update; keeps INSERT clean)
-- ----------------------------------------------------------------------------

UPDATE wv_be_templates
SET cluster_definition = '{"slot_count":5,"structure":"topic+5_satellites","child_brief_pattern":"Child piece exploring one angle of {parent_topic}","slot_format_options":["long_form_article","post","email"]}'::jsonb
WHERE name = 'WV: Topic cluster' AND is_default = true AND cluster_definition IS NULL;

UPDATE wv_be_templates
SET cluster_definition = '{"slot_count":8,"structure":"pillar+8_satellites","child_brief_pattern":"Satellite piece linking back to pillar {pillar_title}","slot_format_options":["long_form_article","post","email"]}'::jsonb
WHERE name = 'WV: Pillar cluster' AND is_default = true AND cluster_definition IS NULL;

-- ----------------------------------------------------------------------------
-- Phase 2: 6 V22 brand overrides
-- (uses subqueries to resolve client_id by display_name + source_template_id by canon name)
-- ----------------------------------------------------------------------------

INSERT INTO wv_be_templates (client_id, template_type, platform, name, body_template, variables, is_default, source_template_id)
SELECT * FROM (VALUES

  -- 16. Hafiq: LinkedIn long-form (Shariah-aware)
  ((SELECT id FROM wv_be_clients WHERE display_name = 'Hafiq')::uuid,
   'post', 'linkedin', 'Hafiq: LinkedIn long-form (Shariah-aware)',
$tpl$You are writing a LinkedIn long-form post for Hafiq, an Islamic-finance brand.

VOICE PROFILE:
- Audience: {voice.audience}
- Tone: {voice.one_word_tone} ({voice.register})
- Never sound like: {voice.never_sound_like}
- Do: {voice.do_list}
- Don't: {voice.dont_list}
- Signature phrases (use sparingly): {voice.signature_phrases}

BANNED — auto-rewrite if any hit (V22 + Hafiq Shariah rules apply):
{banned_phrases_canon_list}

SHARIAH-FINANCE OVERLAY:
- Italicise Arabic financial terms on first use + plain-English anchor in parentheses (e.g. "Zakat (annual alms, 2.5% of eligible wealth)")
- Max 2 Arabic terms per paragraph
- Use "profit" / "profit-share" / "expected returns" — never "interest" / "yield" / "APY"
- If naming a screening body, name the standard ("AAOIFI Shariah Standard 21") not just "AAOIFI"
- Surface Halal product replacements when conventional appears (Takaful for insurance, Mudarabah for deposits, Murabaha/Ijara for finance)
- No company-voiced religious phrasing ("May Allah bless..." reserved for user-voiced moments)
- No Gharar avoidance as marketing claim

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 300-600 words
- One primary CTA at end (verb-led)
- No exclamation marks beyond first sentence
- Active voice; <20 words per sentence
- Brand name is "Hafiq" (never "Taqwa Invest", "Hafiq PFM", "Hafiq Wealth", "Hafiq Stocks", "Mizan")
- Output ONLY the post body$tpl$,
   '{"required":["voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   false,
   (SELECT id FROM wv_be_templates WHERE name = 'WV: LinkedIn long-form post' AND is_default = true)),

  -- 17. Hafiq: Cold outreach (Islamic-finance partnerships)
  ((SELECT id FROM wv_be_clients WHERE display_name = 'Hafiq')::uuid,
   'outreach_opener', 'email', 'Hafiq: Cold outreach (Islamic-finance partnerships)',
$tpl$You are writing a cold outreach email FROM Hafiq TO {recipient_name} ({recipient_role} at {recipient_org}).

CONTEXT: Recipient is in Islamic finance — a Takaful operator, Islamic bank, Shariah board member, takaful broker, Halal investment platform, or Islamic-finance regulator. Tailor accordingly using {recipient_org_type}.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED (V22 + Hafiq Shariah rules):
{banned_phrases_canon_list}

SHARIAH-FINANCE OVERLAY:
- Use "profit-share" / "Takaful contributions" — never "interest" / "premiums"
- Reference shared values where genuine: stewardship of wealth, intention (niyyah)
- No company-voiced religious phrasing
- No claims of Shariah authority on Hafiq's behalf

ASK / ANGLE:
{prompt}

CONSTRAINTS:
- Subject: 4-8 words, lowercase except proper nouns + Islamic-finance terms
- Body: under 150 words
- Personalised opener (one specific reference to recipient or org)
- Single clear ask
- Sign-off: "{sender_name}" only
- Output as JSON: {"subject":"...","body":"..."}$tpl$,
   '{"required":["voice","recipient_name","recipient_role","recipient_org","recipient_org_type","prompt","banned_phrases_canon_list","sender_name"]}'::jsonb,
   false,
   (SELECT id FROM wv_be_templates WHERE name = 'WV: Cold outreach email' AND is_default = true)),

  -- 18. v4-sa: LinkedIn long-form (22seven heritage)
  ((SELECT id FROM wv_be_clients WHERE display_name = 'v4-sa')::uuid,
   'post', 'linkedin', 'v4-sa: LinkedIn long-form (22seven heritage)',
$tpl$You are writing a LinkedIn long-form post for Vault22 South Africa (formerly 22seven, since 2012).

VOICE PROFILE:
- Audience: South African adults building wealth (200,000+ users)
- Tone: {voice.one_word_tone} ({voice.register})
- Never sound like: a corporate call centre, a faceless multinational
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED (V22 + SA register rules):
{banned_phrases_canon_list}
+ no corporate-speak ("We understand your concerns regarding...")
+ never joke about money struggles

SA CALIBRATION:
- 65% casual / 35% formal default
- Acknowledge SA cultural realities where relevant (load shedding, R-currency, local context)
- Honour 22seven heritage when topical ("We've been helping South Africans build wealth since 2012")
- Honest over polished — admit problems directly when they're brought up
- Empower not patronise

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 300-600 words
- One primary CTA at end (verb-led)
- Currency format: R 12,345 (space + comma decimal)
- Active voice; <20 words per sentence
- Output ONLY the post body$tpl$,
   '{"required":["voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   false,
   (SELECT id FROM wv_be_templates WHERE name = 'WV: LinkedIn long-form post' AND is_default = true)),

  -- 19. v4-sa: Re-engagement email (load-shedding-aware)
  ((SELECT id FROM wv_be_clients WHERE display_name = 'v4-sa')::uuid,
   'email', 'email', 'v4-sa: Re-engagement email (load-shedding-aware)',
$tpl$You are writing a re-engagement email from Vault22 SA to a dormant user ({recipient_name}, last active {days_dormant} days ago).

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}

BANNED (V22 + SA rules):
{banned_phrases_canon_list}
+ no corporate-speak

SA CALIBRATION:
- Acknowledge real life — load shedding, money pressure, life happens
- 22seven heritage if relevant ("we've been here since 2012")
- Honest, not sales-y
- Empower not patronise

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- Subject: under 50 chars, lowercase
- Body: 100-150 words
- Acknowledge time gap once + acknowledge real life (1 sentence each, max)
- Lead with what's new / what they'd value most NOW
- Currency format: R 12,345
- Single clear next step
- Sign-off: "Vault22 South Africa" + first-name-only of sender
- Output as JSON: {"subject":"...","body":"..."}$tpl$,
   '{"required":["voice","recipient_name","days_dormant","prompt","banned_phrases_canon_list"]}'::jsonb,
   false,
   (SELECT id FROM wv_be_templates WHERE name = 'WV: Re-engagement email' AND is_default = true)),

  -- 20. v4-global: LinkedIn long-form (multi-market)
  ((SELECT id FROM wv_be_clients WHERE display_name = 'v4-global')::uuid,
   'post', 'linkedin', 'v4-global: LinkedIn long-form (multi-market)',
$tpl$You are writing a LinkedIn long-form post for Vault22, the global parent brand spanning SA + UAE today and expanding into Malaysia, Indonesia, Saudi Arabia, Pakistan, UK.

VOICE PROFILE:
- Audience: {voice.audience}
- Tone: {voice.one_word_tone} ({voice.register})
- Never sound like: {voice.never_sound_like}
- Do: {voice.do_list}
- Don't: {voice.dont_list}
- Signature phrases (sparingly): {voice.signature_phrases}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

GLOBAL CALIBRATION:
- Audience may be in any of 7 markets; default to global framings ("personal finance", not "rand-denominated")
- If the post has a specific-market angle, name the market explicitly
- Use UK English; "Shariah" (no apostrophe); "Tara" (not "Maya"); "Vault22" (one word); ©2026
- Currency examples: use R for SA, AED for UAE, RM for Malaysia, $ for global — always with prefix shown

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 300-600 words
- One primary CTA at end (verb-led)
- No exclamation marks beyond first sentence
- Active voice; <20 words per sentence
- Output ONLY the post body$tpl$,
   '{"required":["voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   false,
   (SELECT id FROM wv_be_templates WHERE name = 'WV: LinkedIn long-form post' AND is_default = true)),

  -- 21. v4-global: Newsletter (regulatory partnership)
  ((SELECT id FROM wv_be_clients WHERE display_name = 'v4-global')::uuid,
   'email', 'email', 'v4-global: Newsletter (regulatory partnership)',
$tpl$You are writing one newsletter section for Vault22 (global parent), aimed at a regulator / bank partner / policy audience.

VOICE PROFILE:
- Tone: {voice.one_word_tone} ({voice.register})
- Do: {voice.do_list}
- Don't: {voice.dont_list}

BANNED — auto-rewrite if any hit:
{banned_phrases_canon_list}

REGULATORY-AUDIENCE CALIBRATION:
- More formal than retail audience (shift register +20% formal)
- Cite regulators/standards by name + jurisdiction (FSCA SA, DFSA UAE, SC Malaysia, OJK Indonesia, etc.)
- Lead with the policy/partnership relevance, not consumer benefit
- Numbers must have explicit data sources cited
- No retail marketing language

ASSIGNMENT:
{prompt}

CONSTRAINTS:
- 300-500 words
- One H2 section heading
- 2-3 paragraphs of body
- One concrete takeaway (bolded)
- Output as Markdown$tpl$,
   '{"required":["voice","prompt","banned_phrases_canon_list"]}'::jsonb,
   false,
   (SELECT id FROM wv_be_templates WHERE name = 'WV: Newsletter section' AND is_default = true))

) AS v(client_id, template_type, platform, name, body_template, variables, is_default, source_template_id)
WHERE NOT EXISTS (
  SELECT 1 FROM wv_be_templates t WHERE t.name = v.name AND t.client_id = v.client_id
);

-- ----------------------------------------------------------------------------
-- Verification: count by category
-- ----------------------------------------------------------------------------

SELECT
  CASE WHEN is_default THEN 'WV canon' ELSE c.display_name END AS source,
  COUNT(*) AS template_count
FROM wv_be_templates t
LEFT JOIN wv_be_clients c ON c.id = t.client_id
WHERE t.deleted_at IS NULL
GROUP BY 1
ORDER BY 1;
