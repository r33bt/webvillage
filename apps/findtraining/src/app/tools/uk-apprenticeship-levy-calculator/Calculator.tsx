'use client'

import { useState, useMemo } from 'react'

// Statutory rate and allowance, per HMRC "Pay Apprenticeship Levy"
// (https://www.gov.uk/government/publications/apprenticeship-levy), cited on the page.
// The government top-up and fund expiry are funding-rule settings that change, so they are not computed here.
const ALLOWANCE = 15_000 // £ annual allowance offset
const LEVY_RATE = 0.005 // 0.5%
const THRESHOLD = ALLOWANCE / LEVY_RATE // £3m: below this the allowance cancels the levy

function formatGBP(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(Math.max(0, n))
}

export default function Calculator() {
  const [payBill, setPayBill] = useState<string>('5000000')

  const result = useMemo(() => {
    const bill = Number(payBill) || 0
    const grossLevy = bill * LEVY_RATE
    const netLevy = Math.max(0, grossLevy - ALLOWANCE)
    const isLevyPayer = bill > THRESHOLD
    return {
      bill,
      grossLevy,
      netLevy,
      isLevyPayer,
    }
  }, [payBill])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <label htmlFor="paybill" className="block text-sm font-semibold text-gray-900 mb-2">
          Annual pay bill (£)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">£</span>
          <input
            id="paybill"
            type="number"
            value={payBill}
            onChange={(e) => setPayBill(e.target.value)}
            className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:border-brand-blue"
            min="0"
            step="100000"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total earnings on which Class 1 secondary National Insurance contributions are payable.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {!result.isLevyPayer ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
            <span className="font-semibold">Below the £3m levy threshold.</span> You do not pay the
            Apprenticeship Levy. You can still get apprenticeship funding through co-investment;
            see the resource article for details.
          </div>
        ) : (
          <>
            <Row label="Gross levy (0.5%)" value={formatGBP(result.grossLevy)} />
            <Row label="£15,000 allowance offset" value={`− ${formatGBP(ALLOWANCE)}`} />
            <Row label="Annual levy paid" value={formatGBP(result.netLevy)} highlight />
            <Row label="Monthly levy (approx.)" value={formatGBP(result.netLevy / 12)} />
          </>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 leading-relaxed">
        Estimates only. HMRC applies the allowance monthly through PAYE, so monthly amounts can
        differ. In England, unspent funds in your apprenticeship service account expire; check the
        current rules on GOV.UK.
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p className={`text-sm ${highlight ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</p>
      <p className={`font-mono ${highlight ? 'text-lg font-bold text-brand-blue' : 'text-sm text-gray-700'}`}>{value}</p>
    </div>
  )
}
