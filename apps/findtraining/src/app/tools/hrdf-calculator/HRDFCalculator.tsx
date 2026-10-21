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

export default function HRDFCalculator() {
  const [employees, setEmployees] = useState<number>(25)
  const [avgSalary, setAvgSalary] = useState<number>(3000)

  // HRD Corp: 10+ Malaysian employees compulsory at 1%; 5 to 9 optional at
  // 0.5%; under 5 not covered. Source: HRDF_SOURCES.registeredEmployers
  const isMandatory = employees >= 10
  const isCovered = employees >= 5
  const levyRate = isMandatory ? 0.01 : isCovered ? 0.005 : 0
  const monthlyWagesBill = employees * avgSalary
  const monthlyLevy = monthlyWagesBill * levyRate
  const annualLevy = monthlyLevy * 12
  const perEmployeeMonthly = avgSalary * levyRate

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Enter your company details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Number of employees */}
          <div>
            <label
              htmlFor="employees"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Number of Malaysian employees
            </label>
            <input
              id="employees"
              type="number"
              min={0}
              value={employees}
              onChange={(e) => setEmployees(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FEC] focus:border-transparent"
              placeholder="e.g. 25"
            />
            <p className="mt-1 text-base text-gray-600">Malaysian citizens only</p>
          </div>

          {/* Average monthly salary */}
          <div>
            <label
              htmlFor="avgSalary"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Average monthly salary (RM)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm pointer-events-none">
                RM
              </span>
              <input
                id="avgSalary"
                type="number"
                min={0}
                step={100}
                value={avgSalary}
                onChange={(e) => setAvgSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FEC] focus:border-transparent"
                placeholder="3000"
              />
            </div>
            <p className="mt-1 text-base text-gray-600">Per employee, per month: wages or basic salary plus fixed allowances</p>
          </div>
        </div>

        {/* Employer type badge */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-base text-gray-700">Registration:</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-base font-semibold ${
              isMandatory
                ? 'bg-brand-blue-light text-brand-blue border border-blue-100'
                : isCovered
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-gray-50 text-gray-800 border border-gray-200'
            }`}
          >
            {isMandatory ? 'Compulsory (1% levy)' : isCovered ? 'Optional (0.5% levy)' : 'Not covered (under 5)'}
          </span>
        </div>
      </div>

      {/* Results */}
      <div
        className="rounded-xl border-2 p-6 space-y-5"
        style={{ borderColor: '#0F6FEC', background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)' }}
      >
        <h2 className="text-lg font-semibold text-gray-900">Your HRD Corp levy breakdown</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white border border-gray-100 p-4">
            <p className="text-base text-gray-600 mb-1">Monthly levy contribution</p>
            <p className="text-2xl font-bold" style={{ color: '#0F6FEC' }}>
              RM {formatRM(monthlyLevy)}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 p-4">
            <p className="text-base text-gray-600 mb-1">Levy over 12 months</p>
            <p className="text-2xl font-bold" style={{ color: '#00C48C' }}>
              RM {formatRM(annualLevy)}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 p-4">
            <p className="text-base text-gray-600 mb-1">Per-employee monthly levy</p>
            <p className="text-xl font-bold text-gray-900">
              RM {formatRM(perEmployeeMonthly)}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-100 p-4">
            <p className="text-base text-gray-600 mb-1">Levy rate</p>
            <p className="text-xl font-bold text-gray-900">
              {isMandatory ? '1.0%' : isCovered ? '0.5%' : '0%'} of wages
            </p>
          </div>
        </div>

        <p className="text-base text-gray-800 bg-white border border-gray-200 rounded-lg px-4 py-3 leading-relaxed">
          {isCovered ? (
            <>
              Training grants are paid from the levy your company has paid in. HRD Corp pays the
              approved amount or the actual cost, whichever is lower, within its cost limits.{' '}
            </>
          ) : (
            <>HRD Corp registration starts at 5 Malaysian employees. Below that, the levy does not apply.{' '}</>
          )}
          <a href={HRDF_SOURCES.faq} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">
            HRD Corp FAQ
          </a>
        </p>

        {/* CTA */}
        <div className="pt-1">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0F6FEC' }}
          >
            Find training providers
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
