// Run: node --experimental-strip-types --test scripts/indexing-cohorts.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { selectCohorts, type Row } from './indexing-cohorts.ts'
import { buildProviderFacts, humanizeCategory, primaryCategoryLabel, formatRegistryDate } from '../src/lib/provider-facts.ts'

function row(slug: string, country: string, extra: Partial<Row> = {}, name = slug): Row {
  return {
    slug, name, country_code: country, state: null, region: null, description: null, website: null,
    address: null, city: null, ssm_number: null, registration_date: null, raw_data: null,
    hrdf_status: null, profile_status: 'unclaimed', ...extra,
  }
}

function fixture(): Row[] {
  const rows: Row[] = []
  const letters = 'abcdefghij'
  for (let i = 0; i < 400; i++) {
    const l = letters[i % letters.length]
    rows.push(row(`${l}-my-${i}`, 'MY', {
      state: 'Selangor', hrdf_status: 'registered', ssm_number: `S${i}`,
      raw_data: { registration_no: `R${i}`, specialisation: i % 3 ? 'IT' : null },
    }))
    rows.push(row(`${l}-au-${i}`, 'AU', {
      state: 'NSW',
      raw_data: { status: 'Current', abn: `${i}`, organisation_code: `${i}`, registration_end: '2028-11-26', rto_type: 'Company' },
    }))
  }
  for (let i = 0; i < 25; i++) {
    rows.push(row(`s-sg-${i}`, 'SG', { state: 'Central', raw_data: { extra: { uen: `U${i}` }, source_url: 'https://example.sg/x' } }))
  }
  rows.push(row('dup-co-sdn-bhd', 'MY', { hrdf_status: 'registered', ssm_number: '1' }, 'Dup Co Sdn Bhd'))
  rows.push(row('dup-co-1', 'MY', { hrdf_status: 'registered', ssm_number: '1' }, 'Dup Co'))
  return rows
}

test('quotas, shortfall reporting and control size', () => {
  const { out } = selectCohorts(fixture(), '2026-10-28')
  const by = (c: string) => out.A.filter((e) => e.country === c).length
  assert.equal(by('MY'), 60)
  assert.equal(by('AU'), 60)
  assert.equal(by('SG'), 25) // only 25 SG rows exist: no padding
  assert.match(out.shortfalls.SG, /25 of 30/)
  assert.ok(out.C.length > 0 && out.C.length <= 60)
  const overlap = out.C.filter((c) => out.A.some((a) => a.slug === c.slug))
  assert.equal(overlap.length, 0)
})

test('deterministic and input-order independent', () => {
  const f = fixture()
  const a = selectCohorts(f, '2026-10-28').out
  const b = selectCohorts([...f].reverse(), '2026-10-28').out
  assert.deepEqual(a, b)
})

test('control matches A on country and first letter where possible', () => {
  const { out, csv } = selectCohorts(fixture(), '2026-10-28')
  const matched = csv.split('\n').filter((l) => l.includes(',C,') && l.includes('matched to'))
  assert.ok(matched.length > 0)
  for (const line of matched) {
    const [slug, country] = line.split(',')
    const aLetters = new Set(out.A.filter((a) => a.country === country).map((a) => a.slug[0]))
    assert.ok(aLetters.has(slug[0]), `${slug} letter not present in A for ${country}`)
  }
})

test('duplicate company rows: at most one is eligible', () => {
  const { out } = selectCohorts(fixture(), '2026-10-28')
  const dups = [...out.A, ...out.C].filter((e) => e.slug.startsWith('dup-co'))
  assert.ok(dups.length <= 1)
})

test('facts: only present fields, no enum leaks', () => {
  assert.equal(humanizeCategory('vocational_training'), 'Vocational training')
  assert.equal(primaryCategoryLabel(['general_training']), null)
  assert.equal(primaryCategoryLabel(['vocational_training']), 'vocational training')
  assert.equal(formatRegistryDate('27/11/2021'), '27 Nov 2021')
  assert.equal(formatRegistryDate('not a date'), null)
  const f = buildProviderFacts({
    country_code: 'AU', state: 'NSW', region: null, address: null, city: null, ssm_number: null,
    registration_date: null, hrdf_status: 'active', raw_data: { status: 'Current', abn: '12' },
  })
  assert.deepEqual(f.map((x) => x.label), ['Registration status', 'ABN', 'Location'])
  assert.equal(f[2].value, 'New South Wales')
})
