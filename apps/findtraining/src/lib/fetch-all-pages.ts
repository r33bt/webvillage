// PostgREST returns at most 1,000 rows per request (the project's max-rows), so a plain select
// silently drops everything after the first page. fetchAllPages asks for consecutive ranges until a
// short page comes back. The caller's query must have a stable order (a unique tiebreak column),
// or rows can repeat or go missing between pages.

export const PAGE_SIZE = 1000

type PageResult<T> = { data: T[] | null; error: { message: string } | null }

export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize: number = PAGE_SIZE,
): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPage(from, from + pageSize - 1)
    if (error) throw new Error(`fetchAllPages: ${error.message}`)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < pageSize) break
  }
  return all
}
