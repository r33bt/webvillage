import { CheckCircle } from 'lucide-react'

export function HRDFBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#00C48C]/10 text-green-700">
      <CheckCircle className="w-3 h-3" aria-hidden="true" />
      HRDF Registered
    </span>
  )
}
