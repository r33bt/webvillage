'use client'

import { useState } from 'react'
import Link from 'next/link'

function formatRM(value: number): string {
  return new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const SECTORS = [
  'Manufacturing',
  'Services',
  'Mining & Quarrying',
  'Construction',
  'Agriculture',
  'Other',
]

export default function HRDFEligibilityChecker() {
  const [sector, setSector] = useState<string>('Services')
  const [employees, setEmployees] = useState<number>(15)
  const [monthlyPayroll, setMonthlyPayroll] = useState<number>(75000)

  // Eligibility logic
  // Mandatory: 10+ employees, OR (<10 employees but payroll >RM 500K/mo)
  const isMandatory = employees >= 10 || monthlyPayroll > 500000
  const levyRate = employees >= 10 ? 0.01 : 0.005
  const monthlyLevy = monthlyPayroll * levyRate
  const annualLevy = monthlyLevy * 12

  const isEligible = isMandatory || employees > 0

  const statusLabel = employees >= 10
    ? 'Mandatory Registration'
    : monthlyPayroll > 500000
    ? 'Mandatory Registration (high payroll)'
    : 'Voluntary Registration'

  const statusColor = isMandatory
    ? 'bg-green-50 text-green-700 border border-green-200'
    : 'bg-amber-50 text-amber-700 border border-amber-100'

  return (
    <div className="space-y-6">
      {/* Step 1 — Company details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Step 1 — Enter your company details</h2>

        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1.5">
            Industry sector
          </label>
          <select
            id="sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FEC] focus:border-transparent bg-white"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Most private-sector industries are covered under the PSMB Act 2001
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Number of employees */}
          <div>
            <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1.5">
              Number of Malaysian employees
            </label>
            <input
              id="employees"
              type="number"
              min={1}
              value={employees}
              onChange={(e) => setEmployees(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FEC] focus:border-transparent"
              placeholder="e.g. 15"
            />
            <p className="mt-1 text-xs text-gray-400">Citizens and permanent residents only</p>
          </div>

          {/* Monthly payroll */}
          <div>
            <label htmlFor="monthlyPayroll" className="block text-sm font-medium text-gray-700 mb-1.5">
              Total monthly payroll (RM)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm pointer-events-none">
                RM
              </span>
              <input
                id="monthlyPayroll"
                type="number"
                min={0}
                step={1000}
                value={monthlyPayroll}
                onChange={(e) => setMonthlyPayroll(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FEC] focus:border-transparent"
                placeholder="75000"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Combined gross salary of all Malaysian staff</p>
          </div>
        </div>
      </div>

      {/* Step 2 — Eligibility result */}
      <div
        className="rounded-xl border-2 p-6 space-y-5"
        style={{ borderColor: '#0F6FEC', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)' }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">Step 2 — Eligibility result</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {isEligible ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-1">Monthly levy</p>
                <p className="text-2xl font-bold" style={{ color: '#0F6FEC' }}>
                  RM {formatRM(monthlyLevy)}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-1">Annual levy (training budget)</p>
                <p className="text-2xl font-bold" style={{ color: '#00C48C' }}>
                  RM {formatRM(annualLevy)}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-1">Levy rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {employees >= 10 ? '1.0%' : '0.5%'} of wages
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-4">
                <p className="text-xs text-gray-500 mb-1">Registration type</p>
                <p className="text-xl font-bold text-gray-900">
                  {isMandatory ? 'Mandatory' : 'Voluntary'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800 leading-relaxed">
              <strong>Your annual HRD Corp training budget: RM {formatRM(annualLevy)}</strong>
              <br />
              This is the maximum you can claim back for approved HRDF-registered training programmes.
              You should plan your training calendar early — unused levy does not roll over indefinitely.
            </div>

            {/* Grant types */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Grant types available to you
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 rounded-lg bg-white border border-gray-100 p-3">
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: '#0F6FEC' }}
                  >
                    1
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">SBL-Khas</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Most common. HRD Corp pays the training provider directly from your levy balance.
                      No upfront cost to the employer.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-white border border-gray-100 p-3">
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: '#0F6FEC' }}
                  >
                    2
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">SBL (Skim Bantuan Latihan)</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Employer pays the provider upfront, then submits a claim to HRD Corp for
                      reimbursement from the levy pool.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-white border border-gray-100 p-3">
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: '#0F6FEC' }}
                  >
                    3
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">PROLUS</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      For unemployed Malaysians. Employers can sponsor training for new hires or
                      pre-employment candidates and claim reimbursement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Enter your company details above to see your eligibility result.
          </p>
        )}
      </div>

      {/* Step 3 — Action panel */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Step 3 — Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/providers"
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-[#0F6FEC] hover:bg-blue-50 transition-all group"
          >
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white"
              style={{ backgroundColor: '#0F6FEC' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC]">
                Find HRDF providers
              </p>
              <p className="text-xs text-gray-500">Browse registered training providers</p>
            </div>
          </Link>

          <Link
            href="/tools/hrdf-calculator"
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-[#0F6FEC] hover:bg-blue-50 transition-all group"
          >
            <div
              className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white"
              style={{ backgroundColor: '#00C48C' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0F6FEC]">
                Detailed levy breakdown
              </p>
              <p className="text-xs text-gray-500">Per-employee levy calculator</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
