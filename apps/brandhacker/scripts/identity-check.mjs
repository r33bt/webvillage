// Fails the build if shipping source names the owner, his companies or employer, or links a sibling site.
// Owner decision 2026-10-18: BrandHacker speaks only as BrandHacker. A tenant's own data lives in the
// database and is published only when its slug is public and not internal_only.
//   node scripts/identity-check.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const DIRS = ['app', 'components', 'lib', 'public', 'content'].map((d) => path.join(ROOT, d)).filter((d) => fs.existsSync(d))
const PATTERNS = [
  [/\bpatrick\b|patrickleemy|pat-personal/i, 'owner name'],
  [/addestra|bluemaya|alphadev|vault ?22|\bv22\b|webvillage/i, 'owner company or employer'],
  [/r33bt|patl33|padocs|padacs|websitedn|massiveniche|199pat/i, 'owner account or email'],
  [/case-study\/v22|\/pat\/(llms|\.well-known|factsheet|json-ld|og-meta)/i, 'owner tenant or V22 case study link'],
]
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
