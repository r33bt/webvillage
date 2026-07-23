<!-- HARNESS-BASELINE v1.0 (2026-07-23) — managed by _command-center/tools/harness-adopt.py.
     Reference-not-copy: this file POINTS at the global tools; it never duplicates rule content
     (copy = silent drift, the F10 trap). Re-run `harness-adopt.py adopt <project>` to refresh. -->

# Harness Baseline — verify-gate + environment sanity (global tools, referenced)

This project has adopted the AlphaDev22 harness baseline. The global rules in `~/.claude/`
already load in every session; this file wires the project into the VERIFICATION mechanisms
that fixed the portfolio's top failure mode (loop closed against a proxy, not reality).

## Before any visual/functional QA in this project
Run the environment-sanity preflight FIRST — stale servers and stale `.next` have faked QA
results at least 6 times portfolio-wide:
```
python C:/Users/User/Documents/alphadev22/_command-center/tools/qa-preflight.py --project <this-dir>
```
(`--kill` scopes to the stated `--port`/`--project` only. Never trust a QA pass produced
without a preflight in the same session.)

## Before claiming anything is "done"
1. My own checks reach **reviewable**, never done — the done-bar is the owner's localhost
   sign-off (global Rule 3).
2. For any completeness/"it works" claim, run the independent verify gate: `/verify` —
   a fresh-context verifier is handed the source-derived denominator and checks primary
   reality (rendered DOM / DB row / live route), not proxies (build-passes / HTTP 200).
3. Screenshot at 1280 + 375 and LOOK (global build-defaults G). No browser tool wired?
   Install Playwright in the session scratchpad — never skip visual QA.

## Global tools this project can call (no copies here)
| Tool | Invocation |
|---|---|
| Env-sanity preflight | `python _command-center/tools/qa-preflight.py` |
| Guard self-test | `python C:/Users/User/.claude/hooks/guards_selftest.py` |
| Craft lint (A–G corrections) | `python _command-center/design-craft/craft-lint.py` |
| Token lint (colour discipline) | `python 227-housestyle/scripts/token-lint.py` |
| Front-end pixel gate | `node _command-center/frontend-baseline/gate.js` |

(All paths relative to `C:\Users\User\Documents\alphadev22\` unless absolute.)

## Project-specific scoping
Add project-only rules as separate files in this `.claude/rules/` dir with `paths:`
frontmatter at line 1 (NOT inside a code fence — fenced `paths:` silently always-loads).
Do not add copies of global rules here.
