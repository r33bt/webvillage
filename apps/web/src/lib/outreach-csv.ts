// apps/web/src/lib/outreach-csv.ts
// Slice 10: CSV parsing for recipient import. Strict consent validation per Q10-9.

const MAX_ROWS = 1000  // Q10-3 lock

export interface ParsedRecipient {
  email: string
  first_name: string | null
  last_name: string | null
  organization: string | null
  recipient_consent: boolean
  recipient_source: string
  vars: Record<string, string>  // var_* columns
}

export interface ParseError {
  line: number
  email: string | null
  reason: string
}

export interface ParseResult {
  rows: ParsedRecipient[]
  errors: ParseError[]
  duplicate_emails_in_file: string[]
  total_rows: number
}

const RFC_5322 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

function parseCsvLine(line: string): string[] {
  // Minimal CSV parser: comma-delimited, supports quoted fields with escaped quotes.
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') {
        out.push(cur)
        cur = ''
      } else cur += ch
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

function parseConsent(v: string): boolean | null {
  const lower = v.toLowerCase()
  if (['true', '1', 'yes', 'y'].includes(lower)) return true
  if (['false', '0', 'no', 'n'].includes(lower)) return false
  return null
}

export function parseRecipientCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  const errors: ParseError[] = []
  const rows: ParsedRecipient[] = []
  const seenEmails = new Set<string>()
  const dupes: string[] = []

  if (lines.length === 0) {
    return { rows, errors: [{ line: 0, email: null, reason: 'empty file' }], duplicate_emails_in_file: [], total_rows: 0 }
  }

  const headerCols = parseCsvLine(lines[0]!).map((c) => c.toLowerCase())
  const idx = (col: string) => headerCols.indexOf(col)
  const emailIdx = idx('email')
  const consentIdx = idx('recipient_consent')
  const sourceIdx = idx('recipient_source')
  const firstNameIdx = idx('first_name')
  const lastNameIdx = idx('last_name')
  const orgIdx = idx('organization')

  if (emailIdx < 0 || consentIdx < 0 || sourceIdx < 0) {
    return {
      rows,
      errors: [
        {
          line: 1,
          email: null,
          reason: 'missing required header column (need email, recipient_consent, recipient_source)',
        },
      ],
      duplicate_emails_in_file: [],
      total_rows: 0,
    }
  }

  const dataLines = lines.slice(1)
  if (dataLines.length > MAX_ROWS) {
    return {
      rows,
      errors: [{ line: MAX_ROWS + 2, email: null, reason: `row count ${dataLines.length} exceeds ${MAX_ROWS} cap (Q10-3)` }],
      duplicate_emails_in_file: [],
      total_rows: dataLines.length,
    }
  }

  for (let i = 0; i < dataLines.length; i++) {
    const lineNum = i + 2  // 1-based + header
    const cells = parseCsvLine(dataLines[i]!)
    const email = (cells[emailIdx] ?? '').toLowerCase()

    if (!email) {
      errors.push({ line: lineNum, email: null, reason: 'missing email' })
      continue
    }
    if (!RFC_5322.test(email)) {
      errors.push({ line: lineNum, email, reason: 'invalid email format' })
      continue
    }

    const consentStr = cells[consentIdx] ?? ''
    const consent = parseConsent(consentStr)
    if (consent === null) {
      errors.push({ line: lineNum, email, reason: `consent not parseable from "${consentStr}"` })
      continue
    }
    if (!consent) {
      errors.push({ line: lineNum, email, reason: 'recipient_consent=false (Q10-9 hard requirement: consent required)' })
      continue
    }

    const source = (cells[sourceIdx] ?? '').trim()
    if (!source) {
      errors.push({ line: lineNum, email, reason: 'recipient_source is empty (Q10-9: must describe where consent obtained)' })
      continue
    }

    if (seenEmails.has(email)) {
      dupes.push(email)
      continue
    }
    seenEmails.add(email)

    // Custom var_* columns
    const vars: Record<string, string> = {}
    for (let c = 0; c < headerCols.length; c++) {
      const col = headerCols[c]
      if (col?.startsWith('var_') && cells[c]) {
        vars[col.slice(4)] = cells[c] as string
      }
    }

    rows.push({
      email,
      first_name: firstNameIdx >= 0 ? (cells[firstNameIdx] ?? null) : null,
      last_name: lastNameIdx >= 0 ? (cells[lastNameIdx] ?? null) : null,
      organization: orgIdx >= 0 ? (cells[orgIdx] ?? null) : null,
      recipient_consent: true,
      recipient_source: source,
      vars,
    })
  }

  return {
    rows,
    errors,
    duplicate_emails_in_file: Array.from(new Set(dupes)),
    total_rows: dataLines.length,
  }
}
