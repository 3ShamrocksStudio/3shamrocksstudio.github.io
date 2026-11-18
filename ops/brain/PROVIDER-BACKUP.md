# Provider backup plan (CTO, night 18 Nov 2026)

Dave, 18 Nov: every product and project must keep running whatever happens to any provider.
Task t-cto-provider-backup. Source: a scan of every studio repo tonight (code, not docs), listed per line.

## 1. What each thing needs to stay up

| Product / system | Hosting | Data / backend | AI at runtime? | Other outside services |
|---|---|---|---|---|
| Studio site 3shamrocks.com (all pages, /sprint/, /audit/, /a11y/, /raise-ready/, /ops/) | GitHub Pages | none (static) | **No.** Pages that name ChatGPT/Claude/Gemini (brand-os, free prompt kits) only mention them in copy; no API call | Google Fonts; Gumroad links |
| SH✡MER app + Command | GitHub Pages (PWA) + Android build | Firebase Realtime DB, Auth, Cloud Functions (`functions/index.js`, `retention.js`: firebase-admin only) | **No** | Leaflet + OpenStreetMap tiles; Firebase phone sign-in (SMS) |
| SH✡MER Nature / Forest / Beach | GitHub Pages | Firebase (Nature only) | **No** | — |
| LickPick | GitHub Pages (PWA) + Android | Firebase Auth + Firestore (LickSync) | **No** | Gumroad / Paddle (planned) |
| Trashure Hunters | Expo app + web build | Supabase (DB, storage, edge function `verify-cleanup`) | **Yes, optional**: Claude Vision photo check | Already falls back to a deterministic check when the key is missing, the call fails or throws (`_provider.ts` lines 29–53) |
| Milo | GitHub Pages | none | **Optional**: Gemini or Groq key a grown-up enters | Default mode is built-in and private (no AI); AI only when a key is set (`index.html` ~511, 1402–1501) |
| Chore Royale / Chore Wars | GitHub Pages | Supabase (RPC only) | **No** | — |
| FaiRent | GitHub Pages | none | **No** | Leaflet + OpenStreetMap |
| J8NIX app (3shamrocks.com/j8/) | GitHub Pages | Supabase (project otkvebgrdiayjnqrytrn) | **No** in the app itself | Push alerts from the database |
| J8 team runs (night shift, sender, inbox watcher, morning plan…) | Claude scheduled tasks | Supabase + GitHub | **Yes: Claude is the team** | Gmail / Drive / Linear connectors |
| Store | Gumroad | Gumroad | No | — |

## 2. Where an AI provider going down hurts

1. **J8 team runs (Claude).** The only hard AI dependency. If Claude is unavailable, no product goes down, but no drafts, replies, fixes or sends happen.
2. **Trashure Hunters photo check (Claude Vision).** Already safe: deterministic fallback, never throws.
3. **Milo (Gemini/Groq, optional).** Already safe: built-in mode is the default.

Everything a customer or tester touches runs without any AI model.

## 3. Fallback per dependency

| Dependency | If it goes down | Fallback (in order) | Owner |
|---|---|---|---|
| Claude (J8 team runs) | Runs stop or fail | (a) Nothing customer-facing breaks: products are static or on Firebase/Supabase. (b) The J8NIX app keeps working from Supabase; Dave's notes queue as `new` and are picked up on return (no data lost). (c) Sends stop safely: only the Mac sender sends and it needs a run. (d) Second provider: the run instructions are plain-text files in this repo (BRAIN.md, J8NIX-DATA.md, J8NIX-COMMS.md, ARMS-CONTRACT.md) and the SQL is plain Postgres, so another agent tool can run them with the same Supabase project. Needs Dave's choice of tool and its account (no spend without his OK). | CTO |
| Claude Vision (TH) | Photo check falls back | Deterministic check (exists). Optional later: a second vision provider behind the same `runProvider` switch | CTO |
| Gemini / Groq (Milo) | AI chat off | Built-in mode (exists); the app shows "Built-in · private" | CTO |
| GitHub Pages | Sites down | Every site is static: the same folder can be served from any static host. Repo = full copy | CTO |
| Firebase (SH✡MER, LickPick) | App data down | Not AI; outside this plan's scope. Note: daily export of SH✡MER data is a separate step (see §4) | CTO |
| Supabase (J8NIX, TH, Chore Royale) | Data down | Not AI; outside scope. Same §4 export step | CTO |

## 4. Keep all data exportable (next steps)

1. J8NIX: a weekly read-only export of the j8_* tables to a private place (not this public repo, S8). Needs a private store Dave approves; until then Supabase's own backups apply.
2. SH✡MER: Firebase Realtime DB export, private, same rule.
3. Prompts and rules for the J8 team already live as plain text in this repo (portable).

## 5. Check

- Re-run the scan in §1 whenever a product adds an AI call: `git grep -l -i -E 'anthropic|openai|generativelanguage|gemini|api\.groq' -- ':!*.md'` in each repo.
