export function PoweredByWebVillage() {
  return (
    <a
      href="https://webvillage.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by WebVillage — managed directory network"
      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
    >
      <span>Powered by</span>
      <span className="font-semibold text-gray-700">WebVillage</span>
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-500 text-white font-bold text-[10px] leading-none"
      >
        W
      </span>
    </a>
  )
}
