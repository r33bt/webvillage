// Fails the build if shipping source names the owner, his companies or employer, or links a sibling site.
// Owner decision 2026-10-18: BrandHacker speaks only as BrandHacker. A tenant's own data lives in the
// database and is published only when its slug is public and not internal_only.
//   node scripts/identity-check.mjs
//
// The owner-specific patterns (names, companies, handles, emails) are NOT stored in this public file.
// They are read at runtime from, in order:
//   1. env IDENTITY_CHECK_PATTERNS: JSON array of [regexSource, label] pairs, or
//   2. the gitignored file scripts/identity-patterns.local.json (same JSON shape).
// When neither is present the check still runs the generic patterns below and prints a warning.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const DIRS = ['app', 'components', 'lib', 'public', 'content'].map((d) => path.join(ROOT, d)).filter((d) => fs.existsSync(d))

// Generic guards that name nobody in particular.
const PATTERNS = [
  [/\bwebvillage\b/i, 'sibling site or monorepo name'],
]

const localFile = path.join(ROOT, 'scripts', 'identity-patterns.local.json')
let extra = null
try {
  if (process.env.IDENTITY_CHECK_PATTERNS) extra = JSON.parse(process.env.IDENTITY_CHECK_PATTERNS)
  else if (fs.existsSync(localFile)) extra = JSON.parse(fs.readFileSync(localFile, 'utf8'))
} catch (e) {
  console.error(`identity-check: could not parse personal patterns (${e.message})`)
  process.exit(1)
}
if (extra) for (const [src, label] of extra) PATTERNS.push([new RegExp(src, 'i'), label])
else console.warn('identity-check: WARNING no personal patterns loaded (set IDENTITY_CHECK_PATTERNS or create scripts/identity-patterns.local.json); only generic guards ran')

const EXT = /\.(tsx?|jsx?|mjs|md|mdx|json|txt|html|css)$/

const hits = []
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p) }
    else if (EXT.test(e.name)) {
      fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
        for (const [re, label] of PATTERNS) if (re.test(line)) hits.push(`${path.relative(ROOT, p)}:${i + 1}: ${label}`)
      })
    }
  }
}
DIRS.forEach(walk)
for (const h of hits) console.log('IDENTITY', h)
console.log(`identity-check: ${hits.length} problem(s)`)
process.exit(hits.length ? 1 : 0)
