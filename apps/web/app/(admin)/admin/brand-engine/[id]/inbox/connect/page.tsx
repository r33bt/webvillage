import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ConnectVistaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: existing }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_platform_credentials')
      .select('id, scope, oauth_expires_at')
      .eq('client_id', id)
      .eq('platform', 'vista_linkedin')
      .is('deleted_at', null)
      .maybeSingle(),
  ])

  if (!client) notFound()

  const oauthConfigured = process.env.VISTA_OAUTH_CLIENT_ID && process.env.VISTA_OAUTH_CLIENT_ID !== 'TBD_FOUNDER_ACTION'

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/inbox`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Inbox
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Connect Vista Social</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
      </div>

      {existing ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
          <p className="mb-2 font-semibold">Already connected.</p>
          <p>
            Scope: <span className="font-mono text-xs">{existing.scope ?? '—'}</span> · expires{' '}
            {existing.oauth_expires_at ? new Date(existing.oauth_expires_at as string).toISOString().slice(0, 10) : '—'}
          </p>
          <p className="mt-3">
            <Link href={`/admin/brand-engine/${id}/inbox`} className="text-[#0F766E] hover:underline">
              Back to inbox &rarr;
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-bold text-[#1C2B28]">What this does</h2>
            <ul className="space-y-2 text-sm text-[#6B7C79]">
              <li>1. You authorise WebVillage to read + reply to LinkedIn engagement (mentions, DMs, comments) via Vista Social</li>
              <li>2. Vista sends webhooks to <span className="font-mono text-xs text-[#1C2B28]">/api/be/inbox/vista/webhook</span> on each event</li>
              <li>3. Events appear in this brand's inbox; AI generates 3 voice-aware reply variants per event</li>
              <li>4. You pick + edit + send replies back through Vista</li>
              <li>5. All sends logged in <span className="font-mono text-xs text-[#1C2B28]">wv_be_audit_log</span> with the chosen draft + final text</li>
            </ul>
          </section>

          {!oauthConfigured ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
              <p className="mb-2 font-semibold">Vista OAuth not configured yet.</p>
              <p>Founder action required:</p>
              <ol className="mt-2 list-decimal pl-5 space-y-1">
                <li>Sign up at <span className="font-mono text-xs">vistasocial.com</span> (Pro/Enterprise tier — confirms OAuth API access)</li>
                <li>Register an OAuth app in Vista's developer settings</li>
                <li>Add the redirect URL: <span className="font-mono text-xs">https://webvillage.com/api/be/inbox/vista/oauth/callback</span></li>
                <li>Set the webhook URL: <span className="font-mono text-xs">https://webvillage.com/api/be/inbox/vista/webhook</span></li>
                <li>Configure webhook signing secret to match <span className="font-mono text-xs">VISTA_WEBHOOK_SECRET</span> env var</li>
                <li>Update Vercel env vars <span className="font-mono text-xs">VISTA_OAUTH_CLIENT_ID</span> + <span className="font-mono text-xs">VISTA_OAUTH_CLIENT_SECRET</span> with real values (currently placeholders)</li>
              </ol>
              <p className="mt-3">
                Spec defers Vista CSM call to ~2026-07; build proceeds on public docs (Q7-1 lock). 1-line "what's your CSM lead time?" insurance email recommended this week.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <a
                href={`/api/be/inbox/vista/oauth/start?client_id=${id}`}
                className="inline-block rounded-lg bg-[#0F766E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d655d]"
              >
                Authorise via Vista &rarr;
              </a>
              <p className="mt-3 text-xs text-[#6B7C79]">
                You'll be redirected to Vista to sign in + grant the needed scopes. Returns here on success.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
