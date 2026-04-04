export function PoweredByWebVillage() {
  return (
    <a
      href="https://webvillage.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WebVillage — managed directory network"
      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
    >
      <span aria-hidden="true" className="font-bold tracking-tight text-gray-500">
        ▼W▼
      </span>
      <span>
        Powered by{' '}
        <span className="font-semibold text-gray-500 hover:text-gray-700">WebVillage</span>
      </span>
    </a>
  )
}
