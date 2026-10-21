import { describe, expect, it } from 'vitest'
import { fetchAllPages } from './fetch-all-pages'

// Mock of a PostgREST table: .range(from, to) is inclusive and never returns more than maxRows.
function mockTable(total: number, maxRows = 1000) {
  const rows = Array.from({ length: total }, (_, i) => ({ slug: `p-${i}` }))
  const calls: Array<[number, number]> = []
  const fetchPage = async (from: number, to: number) => {
    calls.push([from, to])
    const end = Math.min(to + 1, from + maxRows)
    return { data: rows.slice(from, end), error: null }
  }
  return { fetchPage, calls }
}

describe('fetchAllPages', () => {
  it('returns every row past the 1,000-row cap', async () => {
    const { fetchPage, calls } = mockTable(10_177)
    const rows = await fetchAllPages(fetchPage)
    expect(rows).toHaveLength(10_177)
    expect(new Set(rows.map((r) => r.slug)).size).toBe(10_177)
    expect(calls[0]).toEqual([0, 999])
    expect(calls[1]).toEqual([1000, 1999])
    expect(calls).toHaveLength(11)
  })

  it('stops after an exactly full last page with one empty request', async () => {
    const { fetchPage, calls } = mockTable(2000)
    expect(await fetchAllPages(fetchPage)).toHaveLength(2000)
    expect(calls).toHaveLength(3)
  })

  it('handles an empty table and a single short page', async () => {
    expect(await fetchAllPages(mockTable(0).fetchPage)).toEqual([])
    expect(await fetchAllPages(mockTable(5).fetchPage)).toHaveLength(5)
  })

  it('throws on a query error instead of returning a partial list', async () => {
    let n = 0
    const fetchPage = async () =>
      n++ === 0
        ? { data: Array.from({ length: 1000 }, (_, i) => ({ i })), error: null }
        : { data: null, error: { message: 'timeout' } }
    await expect(fetchAllPages(fetchPage)).rejects.toThrow('timeout')
  })
})
