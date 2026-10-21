'use client'

import { useState } from 'react'
import Link from 'next/link'
import { HRDF_SOURCES } from '@/lib/hrdf-sources'

function formatRM(value: number): string {
  return new Intl.NumberFormat('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

type Band = 'compulsory' | 'optional' | 'not-covered'

// HRD Corp: 10 or more Malaysian employees in a covered industry must
// register (1%); 5 to 9 may choose to register (0.5%). Headcount and
// industry decide it, nothing else. Source: HRDF_SOURCES.registeredEmployers
function bandFor(employees: number): Band {
  if (employees >= 10) return 'compulsory'
  if (employees >= 5) return 'optional'
  return 'not-covered'
}

const BAND_COPY: Record<Band, { label: string; rate: number; note: string }> = {
  compulsory: {
    label: 'Registration is compulsory',
    rate: 0.01,
    note: 'With 10 or more Malaysian employees in a covered industry, your company must register with HRD Corp and pay a 1% monthly levy.',
  },
  optional: {
    label: 'Registration is optional',
    rate: 0.005,
    note: 'With 5 to 9 Malaysian employees in a covered industry, your company may choose to register. If it does, the levy is 0.5% a month.',
  },
  'not-covered': {
    label: 'Below the registration threshold',
    rate: 0,
    note: 'HRD Corp registration starts at 5 Malaysian employees. Below that, the levy does not apply.',
  },
}

export default function HRDFEligibilityChecker() {
  const [employees, setEmployees] = useState<number>(15)
  const [monthlyPayroll, setMonthlyPayroll] = useState<number>(75000)

  const band = bandFor(employees)
  const copy = BAND_COPY[band]
  const monthlyLevy = monthlyPayroll * copy.rate
  const annualLevy = monthlyLevy * 12

  const statusColor =
    band === 'compulsory'
      ? 'bg-green-50 text-green-800 border border-green-200'
      : band === 'optional'
      ? 'bg-amber-50 text-amber-800 border border-amber-200'
      : 'bg-gray-50 text-gray-800 border border-gray-200'

  return (
    <div className="space-y-6">
      {/* Step 1 — Company details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Step 1: your company</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="employees" className="block text-base font-medium text-gray-800 mb-1.5">
              Number of Malaysian employees
            </label>
            <input
              id="employees"
              type="number"
              min={0}
              value={employees}
              onChange={(e) => setEmployees(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="e.g. 15"
            />
            <p className="mt-1 text-base text-gray-600">Malaysian citizens only</p>
          </div>

          <div>
            <label htmlFor="monthlyPayroll" className="block text-base font-medium text-gray-800 mb-1.5">
              Monthly wages of those employees (RM)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 text-base pointer-events-none">
                RM
              </span>
              <input
                id="monthlyPayroll"
                type="number"
                min={0}
                step={1000}
                value={monthlyPayroll}
                onChange={(e) => setMonthlyPayroll(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-2.5 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="75000"
              />
            </div>
            <p className="mt-1 text-base text-gray-600">Wages or basic salaries plus fixed allowances</p>
          </div>
        </div>
      </div>

      {/* Step 2 — Result */}
      <div className="rounded-xl border-2 border-brand-blue bg-brand-blue-light/40 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">Step 2: your result</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-base font-semibold ${statusColor}`}>
            {copy.label}
          </span>
        </div>

        <p className="text-lg text-gray-900 leading-relaxed">{copy.note}</p>

        {band !== 'not-covered' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-gray-200 p-4">
              <p className="text-base text-gray-600 mb-1">Monthly levy</p>
              <p className="text-2xl font-bold text-brand-blue">RM {formatRM(monthlyLevy)}</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-4">
              <p className="text-base text-gray-600 mb-1">Levy over 12 months</p>
              <p className="text-2xl font-bold text-gray-900">RM {formatRM(annualLevy)}</p>
            </div>
          </div>
        )}

        <p className="text-base text-gray-700 leading-relaxed">
          Only HRD Corp can confirm whether your company is liable, after it processes your
          registration form. The levy is paid by the 15th of each month and may not be deducted
          from employees&apos; wages. Federal and state government, local councils and statutory
          bodies are not covered.{' '}
          <a href={HRDF_SOURCES.registeredEmployers} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
            HRD Corp: registration terms
          </a>
          {' · '}
          <a href={HRDF_SOURCES.faq} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
            HRD Corp FAQ
          </a>
        </p>

        {band !== 'not-covered' && (
          <div>
            <p className="text-base font-semibold text-gray-900 mb-2">How registered employers use the levy</p>
            <div className="space-y-2">
              <div className="rounded-lg bg-white border border-gray-200 p-4">
                <p className="text-lg font-semibold text-gray-900">HRD Corp Claimable Courses (HCC)</p>
                <p className="text-base text-gray-700 leading-relaxed">
                  The main scheme. You train with an HRD Corp registered provider and pay nothing
                  upfront; HRD Corp pays the provider from your levy after it approves the claim.{' '}
                  <a href={HRDF_SOURCES.hcc} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
                    HRD Corp: HCC
                  </a>
                </p>
              </div>
              <div className="rounded-lg bg-white border border-gray-200 p-4">
                <p className="text-lg font-semibold text-gray-900">Skim Bantuan Latihan (SBL)</p>
                <p className="text-base text-gray-700 leading-relaxed">
                  For training that is not with an HRD Corp registered provider, such as internal
                  trainers or overseas providers. You pay the provider, then claim reimbursement.{' '}
                  <a href={HRDF_SOURCES.sbl} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
                    HRD Corp: SBL
                  </a>
                </p>
              </div>
            </div>
            <p className="mt-2 text-base text-gray-700">
              HRD Corp pays the approved amount or the actual cost, whichever is lower, within its
              cost limits.
            </p>
          </div>
        )}
      </div>

      {/* Step 3 — Next steps */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Step 3: next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/providers"
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-brand-blue hover:bg-brand-blue-light transition-all group"
          >
            <div>
              <p className="text-lg font-semibold text-gray-900 group-hover:text-brand-blue">
                Find training providers
              </p>
              <p className="text-base text-gray-600">Browse providers in Malaysia</p>
            </div>
          </Link>

          <Link
            href="/tools/hrdf-calculator"
            className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-brand-blue hover:bg-brand-blue-light transition-all group"
          >
            <div>
              <p className="text-lg font-semibold text-gray-900 group-hover:text-brand-blue">
                Levy calculator
              </p>
              <p className="text-base text-gray-600">Work out the levy from headcount and salary</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
