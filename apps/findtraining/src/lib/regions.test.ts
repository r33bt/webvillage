import { describe, expect, it } from 'vitest'
import {
  getRegionBySlug,
  getRegions,
  normaliseStateKey,
  regionForState,
  regionsWithProviders,
  stateMatchForms,
  storedFormsForRegion,
} from './regions'

describe('region lists', () => {
  it('has 16 MY states, 4 GB nations and 8 AU states and territories', () => {
    expect(getRegions('MY')).toHaveLength(16)
    expect(getRegions('GB').map((r) => r.name)).toEqual(['England', 'Scotland', 'Wales', 'Northern Ireland'])
    expect(getRegions('AU')).toHaveLength(8)
    expect(getRegions('SG')).toEqual([])
    expect(getRegions('gb')).toHaveLength(4)
  })

  it('uses URL slugs that are unique across countries', () => {
    const slugs = ['MY', 'GB', 'AU'].flatMap((c) => getRegions(c).map((r) => r.slug))
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s).toMatch(/^[a-z]+(-[a-z]+)*$/)
  })

  it('looks a region up by slug with its country', () => {
    expect(getRegionBySlug('new-south-wales')).toMatchObject({ name: 'New South Wales', countryCode: 'AU' })
    expect(getRegionBySlug('Northern-Ireland')).toMatchObject({ countryCode: 'GB' })
    expect(getRegionBySlug('selangor')).toMatchObject({ countryCode: 'MY' })
    expect(getRegionBySlug('atlantis')).toBeUndefined()
  })
})

describe('normaliseStateKey', () => {
  it('ignores case, dots, extra spaces and accents', () => {
    expect(normaliseStateKey('  N.S.W. ')).toBe('nsw')
    expect(normaliseStateKey('NEW   SOUTH  WALES')).toBe('new south wales')
    expect(normaliseStateKey('W.P. Kuala-Lumpur')).toBe('wp kuala lumpur')
    expect(normaliseStateKey('Ynys Môn')).toBe('ynys mon')
    expect(normaliseStateKey(null)).toBe('')
    expect(normaliseStateKey('')).toBe('')
  })
})

describe('regionForState', () => {
  const cases: Array<[string, string, string]> = [
    ['AU', 'New South Wales', 'new-south-wales'],
    ['AU', 'NSW', 'new-south-wales'],
    ['AU', 'nsw', 'new-south-wales'],
    ['AU', 'N.S.W.', 'new-south-wales'],
    ['AU', 'NSW 2000', 'new-south-wales'],
    ['AU', 'NSW, Australia', 'new-south-wales'],
    ['AU', 'Vic', 'victoria'],
    ['AU', 'QLD', 'queensland'],
    ['AU', 'Western Australia', 'western-australia'],
    ['AU', 'WA', 'western-australia'],
    ['AU', 'South Australia', 'south-australia'],
    ['AU', 'sa', 'south-australia'],
    ['AU', 'Tasmania', 'tasmania'],
    ['AU', 'ACT', 'australian-capital-territory'],
    ['AU', 'Northern Territory', 'northern-territory'],
    ['AU', 'NT', 'northern-territory'],
    ['GB', 'England', 'england'],
    ['GB', 'ENGLAND', 'england'],
    ['GB', 'England, UK', 'england'],
    ['GB', 'Scotland', 'scotland'],
    ['GB', 'Wales', 'wales'],
    ['GB', 'Cymru', 'wales'],
    ['GB', 'Northern Ireland', 'northern-ireland'],
    ['GB', 'N. Ireland', 'northern-ireland'],
    ['GB', 'NI', 'northern-ireland'],
    ['MY', 'Kuala Lumpur', 'kuala-lumpur'],
    ['MY', 'KL', 'kuala-lumpur'],
    ['MY', 'W.P. Kuala Lumpur', 'kuala-lumpur'],
    ['MY', 'Wilayah Persekutuan Kuala Lumpur', 'kuala-lumpur'],
    ['MY', 'Pulau Pinang', 'penang'],
    ['MY', 'Malacca', 'melaka'],
    ['MY', 'Negri Sembilan', 'negeri-sembilan'],
    ['MY', 'Selangor Darul Ehsan', 'selangor'],
    ['MY', 'selangor, malaysia', 'selangor'],
  ]
  it.each(cases)('%s %j → %s', (country, raw, slug) => {
    expect(regionForState(country, raw)?.slug).toBe(slug)
  })

  it('only matches within the given country', () => {
    expect(regionForState('GB', 'NSW')).toBeUndefined()
    expect(regionForState('AU', 'England')).toBeUndefined()
    expect(regionForState('SG', 'Selangor')).toBeUndefined()
  })

  it('does not guess at cities, counties or blanks', () => {
    expect(regionForState('GB', 'London')).toBeUndefined()
    expect(regionForState('GB', 'Greater Manchester')).toBeUndefined()
    expect(regionForState('AU', 'Sydney')).toBeUndefined()
    expect(regionForState('AU', 'Australia')).toBeUndefined()
    expect(regionForState('AU', '')).toBeUndefined()
    expect(regionForState('AU', null)).toBeUndefined()
  })
})

describe('regionsWithProviders', () => {
  it('lists only regions with a stored value, in configured order', () => {
    const stored = ['QLD', 'nsw', 'New South Wales', 'Sydney', 'Victoria ']
    expect(regionsWithProviders('AU', stored).map((r) => r.slug)).toEqual([
      'new-south-wales',
      'victoria',
      'queensland',
    ])
  })

  it('is empty when no stored value matches', () => {
    expect(regionsWithProviders('GB', [])).toEqual([])
    expect(regionsWithProviders('GB', ['London'])).toEqual([])
  })
})

describe('stateMatchForms', () => {
  const nsw = getRegionBySlug('new-south-wales')!

  it('includes the name, the aliases and the stored forms that match, without case duplicates', () => {
    const stored = ['N.S.W.', 'nsw', 'Victoria', 'NSW 2000']
    expect(storedFormsForRegion(nsw, stored)).toEqual(['N.S.W.', 'nsw', 'NSW 2000'])
    expect(stateMatchForms(nsw, stored)).toEqual(['New South Wales', 'NSW', 'N.S.W.', 'NSW 2000'])
  })

  it('drops values that would act as LIKE wildcards or break the filter', () => {
    expect(stateMatchForms(nsw, ['NSW_', 'NSW%', 'NS"W'])).toEqual(['New South Wales', 'NSW'])
  })
})
