# Cloud sessions, git isolation, vendoring

## Cloud sessions
- Desktop machines load this skill from `~/.claude/skills/visual-specialist/`; cloud sessions have no `~/.claude`
  and load the repo's vendored copy in `.claude/skills/visual-specialist/` (SKILL.md + references/).
- Vendor or refresh: `bash _command-center/scripts/vendor-skill.sh default <repo>` (or
  `python tools/harness-adopt.py adopt <dir> --vendor-skills`); `--check` reports stale copies. Commit in that repo.
- Attach `r33bt/alphadev22-command-center` (read) for recipes, teardowns, `templates/image-kit/` and the checker.
- The checker needs Playwright: `cd _command-center/frontend-baseline && npm i`, then run it with
  `PW_CHROMIUM=/opt/pw-browsers/chromium` (the preinstalled Chromium; never `playwright install`).
- No credentials in cloud: Commons, screenshots, UI art, charts, diagrams and drawings need none. Photos needing
  Pexels go to the desktop queue unless `PEXELS_API_KEY` is set (SKILL.md, "Photos in cloud sessions").
- Bot checks (Vercel / Cloudflare) block some live domains from cloud IPs. Never bypass a human-verification
  challenge: measure the dev server or a preview URL, and say which you measured.
- Missing env (Supabase etc.) can stop `pnpm build` at page-data collection in cloud; that is environment, not your
  change. Verify on the dev server, and let the Vercel preview be the build check. Say so in the hand-back.

## Git isolation
Work on a branch `claude/visual-<site>-<topic>-<date>` (a desktop session uses a worktree:
`git -C <repo> worktree add .image-worktrees/<site>-<topic>-<date> -b <branch> <default-branch>`). Never move the
shared tree's HEAD. Live CMS sites are additive only (local registry + shared-template wiring, zero CMS writes).
`next dev` rewrites the repo's CLAUDE.md agent block: do not commit that change with visual work.
