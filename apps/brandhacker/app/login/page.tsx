import LoginForm from './LoginForm'

export const metadata = {
  title: 'Sign in — BrandHacker',
  robots: { index: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/" className="text-sm font-semibold tracking-tight text-zinc-50">
            BrandHacker
          </a>
          <h1 className="mt-6 text-2xl font-semibold text-zinc-50">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your email — we&apos;ll send a magic link.
          </p>
        </div>

        {error === 'auth_failed' && (
          <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            Sign-in link expired or invalid. Try again.
          </div>
        )}

        <LoginForm next={next} />

        <p className="mt-6 text-center text-sm text-zinc-500">
          No account?{' '}
          <a href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-zinc-300 hover:text-zinc-50 transition-colors">
            Sign up free
          </a>
        </p>
      </div>
    </main>
  )
}
