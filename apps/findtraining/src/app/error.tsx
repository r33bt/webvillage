'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[#0F6FEC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B5FC7] transition-colors"
      >
        Try again
      </button>
    </main>
  )
}
