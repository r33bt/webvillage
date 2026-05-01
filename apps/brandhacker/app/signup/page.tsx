import LoginForm from '../login/LoginForm'

export const metadata = {
  title: 'Sign up — BrandHacker',
  robots: { index: false },
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <a href="/" className="text-sm font-semibold tracking-tight text-zinc-50">
            BrandHacker
          </a>
          <h1 className="mt-6 text-2xl font-semibold text-zinc-50">Start your free trial</h1>
          <p className="mt-2 text-sm text-zinc-400">
            14 days free. No card required. Enter your email to begin.
          </p>
        </div>

        <LoginForm next={next ?? '/app/onboarding'} />

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <a href="/login" className="text-zinc-300 hover:text-zinc-50 transition-colors">
            Sign in
          </a>
        </p>

        <p className="mt-4 text-center text-xs text-zinc-600">
          By signing up you agree to our{' '}
          <a href="/legal/terms" className="underline hover:text-zinc-400">Terms</a> and{' '}
          <a href="/legal/privacy" className="underline hover:text-zinc-400">Privacy Policy</a>.
        </p>
      </div>
    </main>
  )
}
