// scripts/smoke-slice-3.ts
// Standalone smoke test for Slice 3 — validates the full draft generation + scoring
// pipeline against all 3 V22 brands without needing a dev server.
//
// Run: cd apps/web && npx tsx --env-file=.env.local scripts/smoke-slice-3.ts
// Requires: ANTHROPIC_API_KEY + NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { assemblePrompt } from '../src/lib/be-prompt-assembly'
import { enforceBannedPhrases } from '../src/lib/be-banned-phrase-enforcer'
import { computeCostCents } from '../src/lib/anthropic-pricing'
import { deriveSourceType } from '../src/lib/be-source-type-mapping'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error('Missing env. Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + ANTHROPIC_API_KEY')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

const MODELS = {
  generation: 'claude-sonnet-4-6',
  scoring: 'claude-haiku-4-5-20251001',
} as const

interface Brand {
  client_id: string
  display_name: string
  template_name: string  // pick a brand-override template per client
  prompt: string
}

const TESTS: Brand[] = [
  {
    client_id: '4737a9bd-1edd-4290-855e-4921c28f1a71',
    display_name: 'Hafiq',
    template_name: 'Hafiq: LinkedIn long-form (Shariah-aware)',
    prompt: 'Write about why Zakat is more than just a tax on wealth — frame it around stewardship and intention (niyyah). Reader is a Muslim professional in their 30s thinking about long-term planning.',
  },
  {
    client_id: '34bd9acb-5157-430b-92ca-f2d41ceb8152',
    display_name: 'v4-sa',
    template_name: 'v4-sa: LinkedIn long-form (22seven heritage)',
    prompt: 'Write a post explaining why building wealth in 2026 South Africa requires both consistency and acknowledging real-life pressures (load shedding, cost of living). Anchor in the 22seven heritage of helping South Africans since 2012.',
  },
  {
    client_id: '711cde6c-bc22-4289-be1e-6376e290b0d3',
    display_name: 'v4-global',
    template_name: 'v4-global: LinkedIn long-form (multi-market)',
    prompt: 'Write a post about how Vault22 brings the same principles of clear, calm money management across SA, UAE, and the upcoming Malaysia market — without losing the local feel each market needs.',
  },
]

async function runOne(test: Brand) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`SMOKE: ${test.display_name} — "${test.template_name}"`)
  console.log('='.repeat(80))

  // Fetch all the rows
  const [
    { data: client, error: cErr },
    { data: voiceProfile, error: vpErr },
    { data: template, error: tplErr },
    { data: bannedCanon },
    { data: bannedClient },
  ] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', test.client_id).is('deleted_at', null).single(),
    sb.from('wv_be_voice_profiles').select('*').eq('client_id', test.client_id).maybeSingle(),
    sb
      .from('wv_be_templates')
      .select('*')
      .eq('name', test.template_name)
      .eq('client_id', test.client_id)
      .is('deleted_at', null)
      .single(),
    sb.from('wv_be_banned_phrases_canon').select('phrase, category, severity, rationale').eq('active', true),
    sb
      .from('wv_be_client_banned_phrases')
      .select('phrase, category, severity, rationale')
      .eq('client_id', test.client_id)
      .is('deleted_at', null),
  ])

  if (cErr || !client) throw new Error(`client fetch failed: ${cErr?.message}`)
  if (vpErr || !voiceProfile) throw new Error(`voice profile fetch failed: ${vpErr?.message}`)
  if (tplErr || !template) throw new Error(`template fetch failed: ${tplErr?.message}`)

  const bannedMap = new Map<string, { phrase: string; category: string | null; severity: 'block' | 'flag'; rationale: string | null }>()
  for (const b of bannedCanon ?? []) bannedMap.set(b.phrase.toLowerCase(), b as never)
  for (const b of bannedClient ?? []) bannedMap.set(b.phrase.toLowerCase(), b as never)
  const allBanned = Array.from(bannedMap.values())

  console.log(`✓ Fetched: client=${client.display_name}, voice v${voiceProfile.version}, template, ${allBanned.length} banned phrases`)

  // Assemble prompt
  const systemPrompt = assemblePrompt({
    templateBody: template.body_template,
    brandName: client.display_name,
    voiceProfile: voiceProfile,
    prompt: test.prompt,
    bannedPhrases: allBanned,
  })
  console.log(`✓ Assembled system prompt (${systemPrompt.length} chars)`)

  // Generate with Sonnet 4.6
  const t0 = Date.now()
  const genResp = await anthropic.messages.create({
    model: MODELS.generation,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Generate the ${template.template_type} per the system instructions above.` }],
  })
  const genLatency = Date.now() - t0
  const draftBody = genResp.content[0]?.type === 'text' ? genResp.content[0].text : ''
  const genCost = computeCostCents(MODELS.generation, genResp.usage.input_tokens, genResp.usage.output_tokens)

  console.log(`✓ Generation: ${genResp.usage.input_tokens} in / ${genResp.usage.output_tokens} out / ${genCost}¢ / ${genLatency}ms`)
  console.log(`\n--- DRAFT (${draftBody.length} chars) ---`)
  console.log(draftBody.slice(0, 800) + (draftBody.length > 800 ? '\n... [truncated]' : ''))
  console.log('--- END DRAFT ---\n')

  // Banned-phrase enforce
  const enforcer = enforceBannedPhrases(draftBody, allBanned)
  console.log(`✓ Enforcer: ${enforcer.blockHits.length} block / ${enforcer.flagHits.length} flag hits`)
  if (enforcer.blockHits.length > 0) console.log('  BLOCK:', enforcer.blockHits.map((h) => h.phrase).join(', '))
  if (enforcer.flagHits.length > 0) console.log('  FLAG:', enforcer.flagHits.map((h) => h.phrase).join(', '))

  // Score with Haiku 4.5
  const scoringRubric = `You are a content quality scorer for ${client.display_name}. Score the draft against 5 pillars.

DRAFT TO SCORE:
"""
${draftBody}
"""

VOICE PROFILE FOR REFERENCE:
- One-word tone: ${voiceProfile.one_word_tone ?? 'n/a'}
- Register: ${voiceProfile.register ?? 'n/a'}
- Do: ${(voiceProfile.do_list ?? []).join(' / ')}
- Don't: ${(voiceProfile.dont_list ?? []).join(' / ')}

5 PILLARS (each 0-100):
1. Provenance — claims backed by sources / data / first-hand knowledge (no fabrication)
2. Specificity — concrete numbers, names, dates (not vague generalities)
3. Structure — logical flow, scannable, appropriate length for format
4. Voice — matches the voice profile above (tone, register, do/don't list)
5. Utility — reader leaves knowing/able to do something they couldn't before

Return ONLY valid JSON (no markdown, no commentary, no code fences):
{"provenance":<int 0-100>,"specificity":<int 0-100>,"structure":<int 0-100>,"voice":<int 0-100>,"utility":<int 0-100>,"rationale_per_pillar":{"provenance":"<one sentence>","specificity":"<one sentence>","structure":"<one sentence>","voice":"<one sentence>","utility":"<one sentence>"}}`

  const t1 = Date.now()
  const scoreResp = await anthropic.messages.create({
    model: MODELS.scoring,
    max_tokens: 1000,
    messages: [{ role: 'user', content: scoringRubric }],
  })
  const scoreLatency = Date.now() - t1
  const rawScoreText = scoreResp.content[0]?.type === 'text' ? scoreResp.content[0].text : '{}'
  const cleaned = rawScoreText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()
  const scoreCost = computeCostCents(MODELS.scoring, scoreResp.usage.input_tokens, scoreResp.usage.output_tokens)

  let scores
  try {
    scores = JSON.parse(cleaned)
  } catch (err) {
    console.error('  ✗ Score JSON parse failed. Raw:', rawScoreText.slice(0, 300))
    throw err
  }
  console.log(`✓ Scoring: ${scoreResp.usage.input_tokens} in / ${scoreResp.usage.output_tokens} out / ${scoreCost}¢ / ${scoreLatency}ms`)
  const voiceAdjusted = Math.max(0, Math.min(100, scores.voice + enforcer.voiceScoreDeduction))
  const avg = (scores.provenance + scores.specificity + scores.structure + voiceAdjusted + scores.utility) / 5
  console.log(
    `  Scores: P=${scores.provenance} · S=${scores.specificity} · St=${scores.structure} · V=${voiceAdjusted}(${scores.voice}${enforcer.voiceScoreDeduction ? `${enforcer.voiceScoreDeduction}` : ''}) · U=${scores.utility} → avg=${avg.toFixed(1)}`
  )

  // Status routing
  let status: string
  if (enforcer.hasHardFail) status = 'rejected (hard fail)'
  else if (avg >= 85) status = 'approved (auto-publishable)'
  else if (avg >= 70) status = 'generated (founder review queue)'
  else if (avg >= 60) status = 'generated (reviewer queue, Editorial)'
  else status = 'rejected (auto-fail)'
  console.log(`  → status: ${status}`)

  const sourceType = deriveSourceType(template.template_type as never, voiceProfile.quality_tier as never)
  console.log(`  → source_type: ${sourceType}`)

  const totalCost = genCost + scoreCost
  console.log(`  💰 Total: ${totalCost}¢ (${(totalCost / 100).toFixed(3)} USD)`)

  return { brand: test.display_name, avg, status, totalCost, blockHits: enforcer.blockHits.length, flagHits: enforcer.flagHits.length }
}

async function main() {
  console.log('Slice 3 smoke test — drafts API pipeline against 3 V22 brands\n')
  const results = []
  for (const test of TESTS) {
    try {
      const r = await runOne(test)
      results.push(r)
    } catch (err) {
      console.error(`\n✗ ${test.display_name} FAILED:`, err instanceof Error ? err.message : err)
      results.push({ brand: test.display_name, error: err instanceof Error ? err.message : String(err) })
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(JSON.stringify(results, null, 2))

  const totalCost = results.reduce((s, r) => s + ('totalCost' in r ? r.totalCost : 0), 0)
  console.log(`\n💰 Total smoke-test cost: ${totalCost}¢ (${(totalCost / 100).toFixed(3)} USD)`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
