# 3Shamrocks Studio — GitHub Pages / LickPick
> Claude working rules for this repo. All 3S permanent session rules apply on top of these.

## Project
- **Repo**: `3shamrocksstudio.github.io` — GitHub Pages host for LickPick PWA + landing page
- **Live URL**: `https://3shamrocksstudio.github.io/lickpick/`
- **Stack**: Vanilla HTML/CSS/JS PWA, Firebase Auth (LickSync), Firestore
- **Deploy**: push to `main` → auto-deploy via GitHub Pages (no CI)
- **Git attribution**: always `git config user.email noreply@anthropic.com && git config user.name Claude`

## Permanent rules (never override)
1. **Nothing goes public without Dave's explicit green light. Deployed = staging only.**
2. **Tag `NEEDS YOUR EYES` on anything requiring Dave's review/approval.**
3. **Never send Dave to do dev/tech/console tasks — Claude executes everything technical.**
4. **CRITICAL: Never rebuild or redesign existing UI unless explicitly asked. Minimal change only.**
5. **MANDATORY QA GATE**: before reporting any task complete — syntax-validate JS, grep for corruption, verify live deployed state, map every line of request to shipped change, report PASS/FAIL evidence.
6. **Never call a staged product "launched" or "live".**
7. **go ahead e2e autonomous proceed** = confirmed authorisation to run to completion without check-ins.

## Multi-agent execution rules
These govern how Claude operates inside this repo:

### Verifier gate (mandatory)
Before reporting ANY finding or completed fix:
- Spawn an independent verifier Agent (separate context, no memory of the producing pass)
- The verifier re-reads the relevant files from disk and checks the specific claim
- Only report PASS if the verifier independently confirms
- If verifier disagrees: fix the discrepancy; do not report until both passes agree

### Fix loop cap
- If the same bug survives 2 consecutive fix attempts with no measurable progress → STOP
- Report what was tried, what failed, what state the code is in
- Do not attempt a 3rd approach without Dave's input

### Scan vs patch model routing
- **Read-only scans** (find the bug, understand the structure, audit): run as lightweight subagent with focused scope
- **Patch/edit passes**: isolate the change to the minimum set of lines; verify diff before committing
- **Planning pass** (what to build, how to architect it): done before any file is touched

### Commit discipline
- One commit per logical change
- Commit message: imperative, under 72 chars, with `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_014tNuHNxs6LXCKPMHdXM6gG`
- Never force-push main

## Key files
- `lickpick/app/index.html` — entire PWA (monolithic, ~8200 lines)
- `lickpick/index.html` — landing page
- `lickpick/beta.html` — tester recruitment page
- `LP_VER` const at ~line 1800 — bump on every deploy (format: `lp-YYYY-MM-DDx`)
- z-index hierarchy: nav=20 → .layer=30 → .bar=31 → .scrim=40 → #signgate=50 → .float/.toast=60 → #boot=999

## Firebase
- Project: `lickpick-app` | number: `881593704089`
- Authorized domains: localhost, lickpick-app.firebaseapp.com, lickpick-app.web.app, **3shamrocksstudio.github.io**
- Config at `window.LP_FIREBASE` (~line 1800)
