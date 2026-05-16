export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 sm:p-8 space-y-6 animate-pulse">
      <div className="h-6 w-40 bg-zinc-800 rounded" />
      <div className="h-4 w-64 bg-zinc-900 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 bg-zinc-900 rounded-lg border border-zinc-800" />
        ))}
      </div>
    </div>
  )
}
