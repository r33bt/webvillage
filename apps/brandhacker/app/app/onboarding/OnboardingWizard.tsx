'use client'

import { useState, useEffect } from 'react'

type Step = 1 | 2 | 3 | 4 | 5

const STEPS = [
  { num: 1, label: 'Voice' },
  { num: 2, label: 'Tokens' },
  { num: 3, label: 'Facts' },
  { num: 4, label: 'First draft' },
  { num: 5, label: 'Done' },
]

const FONTS = ['Inter', 'Geist', 'Playfair Display', 'DM Sans', 'Libre Baskerville', 'Space Grotesk']

type DraftResult = { id: string; content: string; score?: number }

export default function OnboardingWizard({
  tenantId,
  slug,
  displayName,
}: {
  tenantId: string
  slug: string
  displayName: string
}) {
  const STORAGE_KEY = `bh_onboarding_${tenantId}`

  // Restore in-progress state from localStorage
  const [step, setStep] = useState<Step>(1)
  const [samples, setSamples] = useState('')
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [headingFont, setHeadingFont] = useState('Inter')
  const [brandName, setBrandName] = useState(displayName)
  const [mission, setMission] = useState('')
  const [faq, setFaq] = useState([
    { q: '', a: '' },
    { q: '', a: '' },
    { q: '', a: '' },
  ])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const s = JSON.parse(saved)
        if (s.step) setStep(s.step)
        if (s.samples) setSamples(s.samples)
        if (s.brandColor) setBrandColor(s.brandColor)
        if (s.headingFont) setHeadingFont(s.headingFont)
        if (s.brandName) setBrandName(s.brandName)
        if (s.mission) setMission(s.mission)
        if (s.faq) setFaq(s.faq)
      } catch {
        // stale state — ignore
      }
    }
  }, [STORAGE_KEY])

  function persist(patch: object) {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }))
  }

  // ── Step 1: Voice extraction ──────────────────────────────────────────────

  async function submitVoice() {
    if (samples.trim().length < 100) {
      setError('We need more to work with — try pasting 3 LinkedIn posts or a blog post (at least 100 characters).')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/be/voice/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, samples }),
    })

    setLoading(false)
    if (res.ok) {
      persist({ step: 2, samples })
      setStep(2)
    } else {
      const body = await res.json().catch(() => ({}))
      if (res.status === 503) {
        setError('Voice extraction requires Anthropic API credits. Add credits at console.anthropic.com, then try again. Your samples are saved.')
        persist({ samples })
      } else {
        setError(body.error ?? 'Something went wrong. Try again.')
      }
    }
  }

  // ── Step 2: Design tokens ─────────────────────────────────────────────────

  async function submitTokens() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/be/metadata', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: tenantId,
        patch: { design_tokens: { brand_color: brandColor, heading_font: headingFont } },
      }),
    })

    setLoading(false)
    if (res.ok) {
      persist({ step: 3, brandColor, headingFont })
      setStep(3)
    } else {
      setError('Failed to save tokens. Try again.')
    }
  }

  // ── Step 3: Brand facts ───────────────────────────────────────────────────

  async function submitFacts() {
    if (!brandName.trim() || !mission.trim()) {
      setError('Brand name and mission are required.')
      return
    }
    setLoading(true)
    setError('')

    const brand_facts = {
      name: brandName,
      mission,
      faq: faq.filter((f) => f.q.trim() && f.a.trim()),
    }

    const res = await fetch('/api/be/metadata', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, patch: { brand_facts } }),
    })

    setLoading(false)
    if (res.ok) {
      persist({ step: 4, brandName, mission, faq })
      setStep(4)
    } else {
      setError('Failed to save brand facts. Try again.')
    }
  }

  // ── Step 4: First draft ───────────────────────────────────────────────────

  const TEMPLATES = [
    { id: 'linkedin_post', label: 'LinkedIn post', description: 'Thought leadership post for LinkedIn.' },
    { id: 'about_page', label: 'About page', description: 'A short company / founder about section.' },
    { id: 'faq_entry', label: 'FAQ entry', description: 'One detailed FAQ question + answer.' },
  ]

  async function generateDraft() {
    if (!selectedTemplate) {
      setError('Pick a template first.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/be/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: tenantId, template_type: selectedTemplate, topic: `Intro for ${brandName}` }),
    })

    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setDraft({ id: data.draft_id, content: data.content, score: data.score?.total })
      persist({ step: 5 })
      setStep(5)
    } else {
      const body = await res.json().catch(() => ({}))
      if (res.status === 503) {
        setError('Draft generation requires Anthropic API credits. Add credits at console.anthropic.com, then return here.')
      } else {
        setError(body.error ?? 'Something went wrong. Try again.')
      }
    }
  }

  // ── Step complete ─────────────────────────────────────────────────────────

  function clearStorage() {
    localStorage.removeItem(STORAGE_KEY)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map(({ num, label }, i) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium shrink-0 ${
                step === num
                  ? 'bg-zinc-50 text-zinc-950'
                  : step > num
                  ? 'bg-zinc-700 text-zinc-300'
                  : 'bg-zinc-900 text-zinc-600'
              }`}
            >
              {step > num ? '✓' : num}
            </div>
            <span className={`text-xs ${step === num ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-zinc-800" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">

        {/* ── STEP 1: Voice ── */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-50">Your writing voice</h2>
            <p className="text-sm text-zinc-400">
              Paste 3–5 samples of your existing writing — LinkedIn posts, a blog post, About page copy. The more representative, the better.
            </p>
            <textarea
              value={samples}
              onChange={(e) => setSamples(e.target.value)}
              placeholder="Paste your writing samples here…"
              rows={10}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-y"
            />
            <p className="text-xs text-zinc-600">
              Max 5 samples · 10,000 characters · English only in Phase 1
            </p>
            {error && <p className="text-sm text-amber-400">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={submitVoice}
                disabled={loading}
                className="rounded-lg bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Extracting voice…' : 'Extract voice →'}
              </button>
              <button
                onClick={() => { persist({ step: 2, samples }); setStep(2) }}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Tokens ── */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-50">Brand tokens</h2>
            <p className="text-sm text-zinc-400">Pick your primary brand colour and heading font. These flow into your web factsheet and AEO surface.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Brand colour</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-zinc-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-28 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-mono text-zinc-300 focus:border-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-1.5">Heading font</label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={submitTokens}
                disabled={loading}
                className="rounded-lg bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save tokens →'}
              </button>
              <button onClick={() => setStep(1)} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Back</button>
            </div>
          </>
        )}

        {/* ── STEP 3: Facts ── */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-50">Brand facts</h2>
            <p className="text-sm text-zinc-400">These feed directly into your AEO surface — what AI engines will say about you.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-300 mb-1">Brand name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-1">Mission (one sentence)</label>
                <input
                  type="text"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="We help founders stay on-brand without the overhead."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-300 mb-2">3 FAQ questions (optional but recommended)</label>
                <div className="space-y-3">
                  {faq.map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <input
                        type="text"
                        value={item.q}
                        onChange={(e) => {
                          const val = e.target.value
                          setFaq(faq.map((f, j) => j === i ? { q: val, a: f.a } : f))
                        }}
                        placeholder={`Q${i + 1}: e.g. What does ${displayName} do?`}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-50 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
                      />
                      <textarea
                        value={item.a}
                        onChange={(e) => {
                          const val = e.target.value
                          setFaq(faq.map((f, j) => j === i ? { q: f.q, a: val } : f))
                        }}
                        placeholder="Answer…"
                        rows={2}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-50 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={submitFacts}
                disabled={loading}
                className="rounded-lg bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save facts →'}
              </button>
              <button onClick={() => setStep(2)} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Back</button>
            </div>
          </>
        )}

        {/* ── STEP 4: First draft ── */}
        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-50">Your first draft</h2>
            <p className="text-sm text-zinc-400">Pick a template. We&apos;ll generate a draft using your voice profile and brand facts.</p>

            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                    selectedTemplate === t.id
                      ? 'border-zinc-500 bg-zinc-800'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-sm font-medium text-zinc-200">{t.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-amber-400">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={generateDraft}
                disabled={loading || !selectedTemplate}
                className="rounded-lg bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating…' : 'Generate draft →'}
              </button>
              <button
                onClick={() => { persist({ step: 5 }); setStep(5) }}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Skip for now
              </button>
              <button onClick={() => setStep(3)} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Back</button>
            </div>
          </>
        )}

        {/* ── STEP 5: Done ── */}
        {step === 5 && (
          <>
            <h2 className="text-lg font-semibold text-zinc-50">You&apos;re set up.</h2>
            <p className="text-sm text-zinc-400">
              Your brand is live on BrandHacker. Here&apos;s a preview of your surfaces.
            </p>

            <div className="space-y-3">
              <a
                href={`/${slug}/llms.txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 hover:border-zinc-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-300">AI surface</p>
                  <p className="text-xs text-zinc-600 font-mono mt-0.5">/{slug}/llms.txt</p>
                </div>
                <span className="text-xs text-zinc-500">Open →</span>
              </a>

              <a
                href={`/${slug}/.well-known/brand.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 hover:border-zinc-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-300">Brand JSON</p>
                  <p className="text-xs text-zinc-600 font-mono mt-0.5">/{slug}/.well-known/brand.json</p>
                </div>
                <span className="text-xs text-zinc-500">Open →</span>
              </a>

              {draft && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-zinc-300">First draft</p>
                    {draft.score !== undefined && (
                      <span className="text-xs text-zinc-500">Score: {draft.score}/100</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-4">{draft.content}</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <a
                href="/app"
                onClick={clearStorage}
                className="inline-block rounded-lg bg-zinc-50 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 transition-colors"
              >
                Go to dashboard →
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
